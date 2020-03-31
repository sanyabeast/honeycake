<template>
<program_wrapper
  title="Telegraf Bot"
  class="telegraf_bot"
>
  <logger 
    ref="logger"
  />
</program_wrapper>
</template>

<script lang="js">
"use strict";
import bot from "./telegraf_bot"
import Vue from "vue"
import forEach from "lodash/forEach"
import find from "lodash/find"
import template from "lodash/template"
import emoji from "emoji-json-list"
import set from "lodash/set"
import get from "lodash/get"
import unset from "lodash/unset"
import isString from "lodash/isString"
import isArray from "lodash/isArray"
import isUndefined from "lodash/isUndefined"
import isNull from "lodash/isNull"
import isObject from "lodash/isObject"
import merge from "lodash/merge"
import chunk from "lodash/chunk"

export default Vue.extend({
        name: "programed_bot",
        mixins: [ bot ],
        components: {},
        props: {
          scenario: {
            type: String,
            default () { return null }
          },
          reply_timeout: {
            type: Number,
            default () { return 500 }
          }
        },
        data () {
          return {
            auto_launch: false,
            scenario_data: null,
            scenario_build_data: null,
            templates_cache: {},
            eval_context: {},
            emoji_list: {}
          }
        },
        watch: {},
        computed: {},
        mounted () {
          window.programed_bot = this
          let emoji_list = this.emoji_list = {}

          forEach( emoji.list, ( data )=>{
            emoji_list[data[1]] = data[0];
          } )
          let bot = this.bot

          if (this.scenario  ) {
            let scenario_data = this.scenario_data = action_manager.read_yaml( this.scenario )
            this.scenario_build_data = this.build_scenario( bot, scenario_data )
          }
          this.launch()
        },
        destroyed () {},
        methods: {
          is_file ( data ) {
            return isString( data ) && data.match(/@file/)
          },
          resolve_file_data ( data ) {
            if ( this.is_file( data ) ) {
              let url = data.replace( "@file:", "" )
              this.log(`resolving scenario chunk (${ url })`)
              return window.action_manager.read_yaml( url )
            } else {
              return data
            }
          },
          build_scenario ( bot, scenario_data ) {
 
            scenario_data.data = this.resolve_file_data( scenario_data.data )

            let stage = this.build_scenes( bot, scenario_data.scenes )
            let commands = this.build_commands( bot, scenario_data.commands )
            let events = this.build_events( bot, scenario_data.events )
            let hear_data = this.build_hears( bot, scenario_data.hears )
            let action_data = this.build_actions( bot, scenario_data.actions )

            

            // bot.command('echo', (ctx) => ctx.scene.enter('echo'))
            // bot.command('kek', (ctx) => ctx.scene.enter('kek'))

            return {
              stage,
              commands,
              events,
              hear_data,
              action_manager
            }
          },
          build_scenes ( bot, scenes_data ) {
            let stage = null
            let scenes = []

            forEach( scenes_data, ( scene_data, index )=>{
              scene_data = this.resolve_file_data( scene_data )
              if ( isArray( scene_data ) ) {
                forEach( scene_data, ( data, index )=>{
                  let scene = this.build_scene( bot, data )
                  scenes.push( scene || null )
                } )
              } else if ( isObject( scene_data ) ) {
                let scene = this.build_scene( bot, scene_data )
                scenes.push( scene || null )
              }
              
            } )


            stage = new Telegraf.Stage( scenes, { ttl: 999 } )

            bot.use(Telegraf.session())
            bot.use(stage.middleware())

            return stage;
          },
          build_scene ( bot, scene_data ) {
            let scene = new Telegraf.BaseScene( scene_data.id )


            let commands = this.build_commands( scene, scene_data.commands )
            let events = this.build_events( scene, scene_data.events )
            let hear_data = this.build_hears( scene, scene_data.hears )
            let action_data = this.build_actions( scene, scene_data.actions )
            // let scenes_data = this.build_scenes( scene, scene_data.scenes )

            scene.enter((ctx) => ctx.reply('Hi'))

            return scene
          },

          build_commands ( ctx, commands ) {
            if ( !commands ) return
            let result = null
          
            forEach( commands, ( data, index )=>{
              ctx.command( data.id, this.build_callback( data.cb ) )

            } )

          },

          build_events ( ctx, events ) {
            if ( !events ) return
            let result = null
          
            forEach( events, ( data, index )=>{
              if ( data.id.match(/^(enter|leave)$/) ) {
                  ctx[data.id](this.build_callback( data.cb ))
              } else {
                ctx.on( data.id, this.build_callback( data.cb ) )
              }

            } )

          },

          build_hears ( ctx, hear_data ) {
            if ( !hear_data ) return
            let result = null

          
            forEach( hear_data, ( data, index )=>{
              ctx.hears( new RegExp( data.text, "igm" ), this.build_callback( data.cb ) )

            } )
          },

          build_actions ( ctx, action_data ) {
            if ( !action_data ) return
            let result = null

          
            forEach( action_data, ( data, index )=>{
              let smart_value = this.is_smart_value( data.text )
              let action_id = smart_value.type === "parse/regexp" ? new RegExp( smart_value.arg, "igm" ) : data.text
              let callback = this.build_callback( data.cb )

              ctx.action( action_id, (ctx)=>{
                callback( ctx )
              })
            } )
          },

          is_smart_value ( config ) {
            let result = false
            let smart_values = [
              ["reply/text", "@reply:"],
              ["reply/html", "@reply-html:"],
              ["scene/leave","@leave-scene"],
              ["scene/enter","@scene:"],
              ["reply/help","(@help:|@help)"],
              ["answer/cb-query/text","(@answer:|@answer)"],
              ["debug/log","(@log:|@log)"],
              ["code/eval","(@code:|@code)"],
              ["set/user/prompt", "@prompt:"],
              ["system/eval", "@eval:"],
              ["keyboard/inline", "@inline-keyboard:"],
              ["system/eval", "@eval:"],
              ["system/wait", "@wait"],
              ["parse/regexp", "@regexp:"],
            ]

            let smart_value = null

            if ( isString( config ) ) {
              smart_value = find( smart_values, ( data )=> config.match(new RegExp( data[1] )) )

              if ( smart_value ) {
                let type = smart_value[0]
                let arg = config.split(":")[1]

                result = {
                  type, arg
                }
              } 
            }  

           return result

          },

          build_callback ( config ) {

            if ( isArray( config ) ) {
              let callbacks = []

              forEach( config, ( cb_data, index )=>{
                callbacks.push( this.build_callback( cb_data ) )
              } )

              return ( ctx ) => {
                forEach( callbacks, ( callback, index )=>{
                  setTimeout( ()=>{
                    callback( ctx )
                  }, index * this.reply_timeout )
                } )
              }
            }

            let smart_value = this.is_smart_value( config ) 
            let result = ()=> { 
            }

            if ( smart_value ) {
              // this.log(`smart-value: ${ smart_value.type } - ${smart_value.arg }`)

              switch ( smart_value.type ) {
                case "system/wait":
                  result = ( ctx ) => { 
                    this.log("waiting...")
                  }
                  break;
                case "system/eval":
                  result = ( ctx ) => { 
                    this.log("evaluating value...")
                    this.eval( smart_value.arg, ctx )
                  }
                  break;
                case "scene/enter":
                  result = ( ctx ) => { 
                    this.log("entering scene...")
                    ctx.scene.enter( this.apply_template( ctx, smart_value.arg ) )
                  }
                  break;
                case "scene/leave":
                  result = ( ctx ) => { 
                    this.log("leaving scene...")
                    ctx.scene.leave()
                   }
                  break;
                case "reply/text":
                  result = ( ctx ) => { 
                    this.log("reply/text")
                    this.send_text( ctx.from.id, this.apply_template( ctx, smart_value.arg ) )
                   }
                  break;
                case "reply/html":
                  result = ( ctx ) => { 
                    this.log("reply/html")
                    this.send_text( ctx.from.id, this.apply_template( ctx, smart_value.arg ) )
                   }
                  break;
                case "reply/help":
                  result = ( ctx ) => { 
                    this.log("reply/help")
                    this.send_help( ctx )
                   }
                  break;
                case "answer/cb-query/text":
                  result = ( ctx ) => { 
                    this.log(`answer/cb-query/text (${ctx.match[0]})`)
                    ctx.answerCbQuery( this.apply_template( ctx, smart_value.arg ) )
                   }
                  break;
                case "debug/log":
                  result = ( ctx ) => { 
                    this.log(`debug/log`)
                    this.log( `@log: ${ this.apply_template( ctx, smart_value.arg ) }`, "recieved" )
                   }
                  break;
                case "set/user/prompt":
                  result = ( ctx ) => {

                  }
                break;
                case "keyboard/inline":
                  let tokens = smart_value.arg.split(";")
                  let button_data = {}
                  let text = "..."
                  let config = null

                  forEach( tokens, ( token, index )=>{
                    if ( token.trim().split("=")[0] === "$caption" ){
                      text = token.trim().split("=")[1]
                      return
                    }

                    if ( token.trim().split("=")[0] === "$config" ){
                      config = token.trim().split("=")[1]
                      return
                    }


                    button_data[ token.trim().split("=")[0] ] = token.trim().split("=")[0]
                  } )


                  
                  
                  result = ( ctx )=>{
                    if ( config ) {
                      button_data = merge( this.eval( config, ctx ), button_data )
                    }

                    
                    let inline_keyboard = this.create_inline_keyboard( button_data )
                    this.send_text( ctx.from.id, this.apply_template( ctx, text ), inline_keyboard.extra() )
                  }
                break;
              }
            } else {
              if ( isString( config.branch ) ) {
                return this.build_branch_callback( config )
              }
            }



            return result
          },


          build_branch_callback( config ) {
            let callbacks = {}
            let default_value = !isUndefined( config.default ) ? config.default : undefined

            forEach( config, ( cb, test_value )=>{
              set( callbacks, `string.${ test_value }`, [] )
              let cbs = get( callbacks, `string.${ test_value }` )
              if (  !test_value.match(/(branch|default)/ ) ) {
                cbs.push( this.build_callback( cb ) )
              }
            } )

            return ( ctx )=>{
              let user_value = this.get_user_value( ctx, config.branch )

              if ( isUndefined( user_value ) && !isUndefined( default_value ) ){
                user_value = default_value
              }

              forEach( config, ( cb, test_value )=>{
                if ( test_value === user_value && !test_value.match(/(branch|default)/) ) {
                  let cbs = get( callbacks, `string.${ test_value }` )
                  forEach( cbs, callback => callback( ctx ) ) 
                }
              } )
            }
          }

        }
})
</script>
<style lang="less">
  .programed_bot {
    
  }
</style>