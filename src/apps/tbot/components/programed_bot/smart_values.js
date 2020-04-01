import find from "lodash/find"
import isString from "lodash/isString"
import forEach from "lodash/forEach"
import merge from "lodash/merge"
import isFunction from "lodash/isFunction"
import isUndefined from "lodash/isUndefined"
import isNumber from "lodash/isNumber"
import isObject from "lodash/isObject"
import get from "lodash/get"
import set from "lodash/set"
import unset from "lodash/unset"

class SmartValues {
    constructor () {
        this.tokens = [
            {
                test: "@reply",
                factory: ( config ) => function ( ctx ) { 
                    this.log("reply/text")
                    this.send_text( ctx.from.id, this.apply_template( ctx, config.arg ) )
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
                    ctx.scene.enter( this.apply_template( ctx, config.arg ) )
                }
            },
            {
                test: "(@help:|@help)",
                factory: ( config ) => function ( ctx ) { 
                    this.log("reply/html")
                    this.send_text( ctx.from.id, this.apply_template( ctx, config.arg ) )
                }
            },
            {
                test: "(@answer:|@answer)",
                factory: ( config ) => function ( ctx ) { 
                    this.log(`answer/cb-query/text (${ctx.match[0]})`)
                    ctx.answerCbQuery( this.apply_template( ctx, config.arg ) )
                }
            },
            {
                test: "(@log:|@log)",
                factory: ( config ) => function ( ctx ) { 
                    this.log(`debug/log`)
                    this.log( `@log: ${ this.apply_template( ctx, config.arg ) }`, "recieved" )
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
                    let tokens = config.arg.split(";")
                    let button_data = {}
                    let text = "..."
                    let kb_config = null

                    forEach( tokens, ( token, index )=>{
                        if ( token.trim().split("=")[0] === "$caption" ){
                        text = token.trim().split("=")[1]
                        return
                        }

                        if ( token.trim().split("=")[0] === "$config" ){
                            kb_config = token.trim().split("=")[1]
                        return
                        }


                        button_data[ token.trim().split("=")[0] ] = token.trim().split("=")[0]
                    } )

                    return function ( ctx ) {
                        if ( kb_config ) {
                            button_data = merge( this.eval( kb_config, ctx ), button_data )
                        }

                        
                        let inline_keyboard = this.create_inline_keyboard( button_data )
                        this.send_text( ctx.from.id, this.apply_template( ctx, text ), inline_keyboard.extra() )
                    }
                }
            },
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
                let arg = data.split(":")[1] || null
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