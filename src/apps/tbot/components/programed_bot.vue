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

export default Vue.extend({
        name: "programed_bot",
        mixins: [ bot ],
        components: {},
        props: ["scenario"],
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
          build_scenario ( bot, scenario_data ) {
 
            // const kekScene = new Telegraf.BaseScene('kek')
            // kekScene.enter((ctx) => ctx.reply('Hi'))
            // kekScene.leave((ctx) => ctx.reply('Bye'))
            // kekScene.hears(/.+/, Telegraf.Stage.enter('kek'))

            // const echoScene = new Telegraf.BaseScene('echo')
            // echoScene.enter((ctx) => ctx.reply('echo scene'))
            // echoScene.leave((ctx) => ctx.reply('exiting echo scene'))
            // echoScene.command('back', Telegraf.Stage.leave())
            // echoScene.hears(/.+/, (ctx) => ctx.reply(ctx.message.text))

            // let stage = new Telegraf.Stage( [echoScene, kekScene], { ttl: 999 } )
            // bot.use(Telegraf.session())
            // bot.use(stage.middleware())

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
              let scene = this.build_scene( bot, scene_data )
              scenes.push( scene )
            } )

            stage = new Telegraf.Stage( scenes, { ttl: 999 } )

            bot.use(Telegraf.session())
            bot.use(stage.middleware())

            return stage;
          },
          build_scene ( bot, scene_data ) {
            let scene = new Telegraf.BaseScene( scene_data.id )

            console.log(scene_data)

            let commands = this.build_commands( scene, scene_data.commands )
            let events = this.build_events( scene, scene_data.events )
            let hear_data = this.build_hears( scene, scene_data.hears )
            let action_data = this.build_actions( scene, scene_data.actions )

            scene.enter((ctx) => ctx.reply('Hi'))

            return scene
          },

          build_commands ( ctx, commands ) {
            if ( !commands ) return
            let result = null
          
            forEach( commands, ( data, index )=>{
              console.log(12,data.id, this.build_callback( data.cb ))
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

            console.log("hears data", ctx, hear_data)
          
            forEach( hear_data, ( data, index )=>{
              ctx.hears( new RegExp( data.text, "igm" ), this.build_callback( data.cb ) )

            } )
          },

          build_actions ( ctx, action_data ) {
            if ( !action_data ) return
            let result = null

            console.log("actions data", action_data)
          
            forEach( action_data, ( data, index )=>{
              ctx.action( new RegExp( data.id, "gm" ), this.build_callback( data.cb ))
            } )
          },

          is_smart_value ( config ) {
            if (typeof config !== "string") return false
            let result = false
            let smart_values = [
              ["reply/text", "@reply:"],
              ["reply/html", "@reply-html:"],
              ["scene/leave","@scene-leave"],
              ["scene/enter","@scene:"],
              ["reply/help","(@help:|@help)"],
              ["answer/cb-query/text","(@answer:|@answer)"],
              ["debug/log","(@log:|@log)"],
              ["code/eval","(@code:|@code)"],
            ]

            let smart_value = find( smart_values, ( data )=> config.match(new RegExp( data[1] )) )

            if ( smart_value ) {
              let type = smart_value[0]
              let arg = config.split(":")[1]

              result = {
                type, arg
              }
            }

            return result

          },

          build_callback ( config ) {
            let smart_value = this.is_smart_value( config ) 
            let result = ()=> { console.log( `mockup for: ${ JSON.stringify( config ) }` ) }

            if ( smart_value ) {
              // this.log(`smart-value: ${ smart_value.type } - ${smart_value.arg }`)

              switch ( smart_value.type ) {
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
                    console.log(ctx)
                    this.log("reply/text")
                    this.send_text( ctx.from.id, this.apply_template( ctx, smart_value.arg ) )
                   }
                  break;
                case "reply/html":
                  result = ( ctx ) => { 
                    this.log("reply/html")
                    console.log(ctx)
                    this.send_text( ctx.from.id, this.apply_template( ctx, smart_value.arg ) )
                   }
                  break;
                case "reply/help":
                  result = ( ctx ) => { 
                    console.log(ctx)
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
                 case "code/eval":
                  result = ( ctx ) => { 
                    this.log(`code/eval`, "system")
                    this.eval(smart_value.arg, ctx)
                   }
                  break;
              }
            }



            return result
          }
        }
})
</script>
<style lang="less">
  .programed_bot {
    
  }
</style>