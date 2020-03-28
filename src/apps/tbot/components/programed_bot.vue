<template>
        <div class="programed_bot bot flex-column">
          <div class="header" v-html="`BOT (${scenario})`">BOT</div>
          <div class="bot_info flex-row">
            <logger 
              ref="logger"
            />
          </div>
        </div>
</template>

<script lang="js">
"use strict";
import bot from "./bot"
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

          let scenario_data = this.scenario_data = action_manager.read_json( this.scenario )
          let bot = this.bot

          this.scenario_build_data = this.build_scenario( bot, scenario_data )
          this.launch()
        },
        destroyed () {},
        methods: {
          build_scenario ( bot, scenario_data ) {
 
            let commands = this.build_commands( bot, scenario_data.commands )
            let events = this.build_events( bot, scenario_data.events )
            let hear_data = this.build_hears( bot, scenario_data.hears )
            let action_data = this.build_actions( bot, scenario_data.actions )
            let stage = this.build_scenes( bot, scenario_data.scenes )

            bot.use(Telegraf.session())
            bot.use(stage.middleware())

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

            stage = new Telegraf.Stage( scenes, { ttl: 10 } )
            return stage;
          },
          build_scene ( bot, scene_data ) {
            let scene = new Telegraf.BaseScene( scene_data.id )

            forEach( scene_data.events, ( event_data, event_name )=>{
              switch ( event_name ) {
                case "enter":
                  scene.enter( this.build_callback( event_data, event_name ) )
                  break;
                case "leave":
                  scene.leave( this.build_callback( event_data, event_name ) )
                  break;
              }
            } )

            forEach( scene_data.commands, ( command_data, command_name )=>{
              scene.command( new RegExp(command_name), this.build_callback( command_data, command_name ) )
            } )

            return scene
          },

          build_commands ( ctx, commands ) {
            let result = null
          
            forEach( commands, ( data, index )=>{
              ctx.command( new RegExp(data.id), this.build_callback( data.cb ) )

            } )

          },

          build_events ( ctx, events ) {
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
            let result = null

            console.log("hears data", ctx, hear_data)
          
            forEach( hear_data, ( data, index )=>{
              ctx.hears( new RegExp( data.text, "igm" ), this.build_callback( data.cb ) )

            } )
          },

          build_actions ( ctx, action_data ) {
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
              ["scene/leave","@leave_scene:"],
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
              this.log(`smart-value: ${ smart_value.type } - ${smart_value.arg }`)

              switch ( smart_value.type ) {
                case "scene/enter":
                  result = ( ctx ) => { 
                    this.log("entering scene...")
                    this.enter_scene( this.apply_template( ctx, smart_value.arg ) )
                  }
                  break;
                case "scene/leave":
                  result = ( ctx ) => { 
                    this.log("leaving scene...")
                    this.leave_scene()
                   }
                  break;
                case "reply/text":
                  result = ( ctx ) => { 
                     this.log("reply/text")
                    ctx.reply( this.apply_template( ctx, smart_value.arg ) )
                   }
                  break;
                case "reply/html":
                  result = ( ctx ) => { 
                     this.log("reply/html")
                    ctx.replyWithHTML( this.apply_template( ctx, smart_value.arg ) )
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