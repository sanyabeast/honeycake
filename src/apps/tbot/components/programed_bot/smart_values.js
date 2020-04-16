import find from "lodash/find"
import isString from "lodash/isString"
import forEach from "lodash/forEach"
import merge from "lodash/merge"
import isFunction from "lodash/isFunction"
import isUndefined from "lodash/isUndefined"
import isNumber from "lodash/isNumber"
import isObject from "lodash/isObject"
import isArray from "lodash/isArray"
import get from "lodash/get"
import set from "lodash/set"
import unset from "lodash/unset"
import chunk from "lodash/chunk"

class SmartValues {
    constructor () {
        this.tokens = [
            
            {
                test: "@reply",
                factory: ( config ) => function ( ctx ) { 
                    this.log("reply/text")
                    this.send_text( ctx.from.id, this.apply_template( config.arg, ctx ) )
                }
            },
            {
                test: "@leave-scene",
                factory: ( config ) => function ( ctx ) { 
                    this.log("leaving scene...")
                    ctx.scene.leave()
                }
            },
            {
                test: "@scene:",
                factory: ( config ) => function ( ctx ) { 
                    this.log("entering scene...")
                    ctx.scene.enter( this.apply_template( config.arg, ctx ) )
                }
            },
            {
                test: "@default_scene",
                factory: ( config ) => function ( ctx ) { 
                    this.log("entering scene...")
                    console.log( this.default_scene || "default" )
                    ctx.scene.enter(  this.default_scene || "default"  )
                }
            },
            {
                test: "(@help:|@help)",
                factory: ( config ) => function ( ctx ) { 
                    this.log("reply/html")
                    this.send_text( ctx.from.id, this.apply_template( config.arg, ctx ) )
                }
            },
            {
                test: "(@answer:|@answer)",
                factory: ( config ) => function ( ctx ) { 
                    this.log(`answer/cb-query/text (${ctx.match[0]})`)
                    ctx.answerCbQuery( this.apply_template( config.arg, ctx ) )
                }
            },
            {
                test: "(@log:|@log)",
                factory: ( config ) => function ( ctx ) { 
                    this.log(`debug/log`)
                    this.log( `@log: ${ this.apply_template( config.arg, ctx ) }`, "recieved" )
                }
            },
            {
                test: "@eval:",
                factory: ( config ) => function ( ctx ) { 
                    this.log("evaluating value...")
                    this.eval( config.arg, ctx )
                }
            },
            {
                test: "@wait",
                factory: ( config ) => function ( ctx ) { 
                    this.log("waiting...")
                }
            },
            {
                test: "@regexp:",
                factory: ( config ) => new RegExp( config.arg, "igm" )
            },
            {
                test: "@file:",
                factory: ( config ) => config.arg.match(/.yaml/) ? action_manager.read_yaml( config.arg ) : action_manager.read_json( config.arg )
            },
            {
                test: "@inline-keyboard",
                factory: ( config ) => {
                    if ( !config.arg ) {
                        return ( ctx )=>{
                            ctx.reply("invalid inline-keboard")
                        }
                    }
                    let tokens = config.arg.split(";")
                    let button_data = {}
                    let text = "..."
                    let kb_config = null
                    let photo = null

                    forEach( tokens, ( token, index )=>{
                        if ( token.trim().split("=")[0] === "$photo" ){
                            photo = token.trim().split(/=(.+)/sgm)[1]
                            return
                        }

                        if ( token.trim().split("=")[0] === "$caption" ){
                            text = token.trim().split(/=(.+)/sgm)[1]
                            return
                        }

                        if ( token.trim().split("=")[0] === "$config" ){
                            kb_config = token.trim().split(/=(.+)/sgm)[1]
                            return
                        }

                    } )

                    return function ( ctx ) {
                        let result_text = this.apply_template( text, ctx );

                        if ( kb_config ) {
                        }

            
                        let inline_keyboard = this.create_inline_keyboard( merge( this.eval( kb_config, ctx ), button_data ) )
                        
                        if ( photo !== null ) {
                            let extra = inline_keyboard.extra()
                            extra.caption = result_text
                            this.send_photo( ctx.from.id, {
                                url: this.apply_template(photo, ctx)
                            }, extra )
                        } else {
                            this.send_text( ctx.from.id, result_text, inline_keyboard.extra() )
                        }

                    }
                }
            },
            /*branch*/
            {
                test: ( data ) => isObject( data ) && isString( data.branch ),
                factory ( config ) {
                    let callbacks_data = config.arg
                    let callbacks = {}
                    let default_value = !isUndefined( callbacks_data.default ) ? callbacks_data.default : undefined

                    forEach( callbacks_data, ( cb, test_value )=>{
                        set( callbacks, `string.${ test_value }`, [] )
                        let cbs = get( callbacks, `string.${ test_value }` )
                        if (  !test_value.match(/(branch|default)/ ) ) {
                            cbs.push( this.build_callback( cb ) )
                        }
                    } )

                    return function( ctx ) {
                        let user_value = this.get_user_value( ctx, callbacks_data.branch )

                        if ( isUndefined( user_value ) && !isUndefined( default_value ) ){
                            user_value = default_value
                        }

                        forEach( callbacks_data, ( cb, test_value )=>{
                            if ( test_value === user_value && !test_value.match(/(branch|default)/) ) {
                                let cbs = get( callbacks, `string.${ test_value }` )
                                forEach( cbs, callback => callback( ctx ) ) 
                            }
                        } )
                    }
                }  
            },
            {
                test: ( data )=> isObject( data ) && data.$type === "ifelse",
                factory ( config ) {
                    let params = config.arg
                    let pos_cb = this.build_callback( params.positive )
                    let neg_cb = this.build_callback( params.negative )

                    return function ( ctx ) {
                        let value = this.eval( params.value, ctx ) 


                        if ( value === true ) {
                            pos_cb( ctx )
                        } else {
                            neg_cb( ctx )
                        }
                    }
                }
            },
            /*dialog scene*/
            {
                test: ( data ) => isObject( data ) && data.$type === "dialog_scene",
                factory ( config ) {
                    let params = config.arg
                    let text = params.text ? params.text : "..." 
                    let retval = {
                        id: params.id,
                        events: [],
                        actions: [],
                        commands: [],
                        hears: []
                    }

                    let buttons_data = []
                    let enter_cb = []

                    if ( params.enter ) {
                        if ( isArray( params.enter ) ) {
                            enter_cb = params.enter
                        } else {
                            enter_cb.push( params.enter )
                        }
                    }

                    if ( params.pins ) {
                        forEach( params.pins, ( callback_data, button_caption )=>{
                            buttons_data.push( button_caption )
                            retval.actions.push({
                                text: button_caption,
                                cb: callback_data
                            })
                        } )
                    } 

                    if ( params.show_exit ) {
                        buttons_data.push( "↩️ Выход" )
                        retval.actions.push({
                            text: "↩️ Выход",
                            cb: "@scene:default"
                        })
                    }

                    if ( buttons_data.length > 0 ) {
                        if ( isNumber( params.columns ) ) buttons_data = chunk( buttons_data, params.columns )
                        enter_cb.push( `@inline-keyboard: $caption=${ text }; $config=${ JSON.stringify( buttons_data ) }` )
                    } else {
                        enter_cb.push( `@reply:${ text }` )
                    }

                    retval.events.push({
                        id: "enter",
                        cb: enter_cb
                    })
                    
                    return retval
                } 
            }
        ]
    }

    is_smart_value ( data ) {
        let smart_value = find( this.tokens, ( token )=> {
            if ( isFunction( token.test ) ) {
                return token.test( data )
            } else {
                if ( isString( data ) ) return data.match( new RegExp( token.test ) )
            }
        } ) 

        if ( smart_value ) {
            if ( isString( data ) ) {
                let arg = data.split(/:(.+)/sgm)[1] || null
                return {
                    ...smart_value,
                    arg
                }
            } else {
                return {
                    ...smart_value,
                    arg: data
                }
            }
        } else {
            return false
        }
    }

    resolve_value ( data, factory_context ) {
        let smart_value = this.is_smart_value( data )
        if ( smart_value ) {
            let result = smart_value.factory.call( factory_context, smart_value )
            return result
        } else {
            return data
        }
    }
}

export default SmartValues