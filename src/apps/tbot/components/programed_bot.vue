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

import SmartValues from "./programed_bot/smart_values"
let smart_values_manager = new SmartValues()

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
            default () { return 333 }
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
          build_scenario ( bot, scenario_data ) {
 
            scenario_data.data = smart_values_manager.resolve_value( scenario_data.data )

            let scenes = this.build_scenes( bot, scenario_data.scenes )
            let stage = this.build_stage( bot, scenes )
            let commands = this.build_commands( bot, scenario_data.commands )
            let events = this.build_events( bot, scenario_data.events )
            let hear_data = this.build_hears( bot, scenario_data.hears )
            let action_data = this.build_actions( bot, scenario_data.actions )

            return {
              stage,
              commands,
              events,
              hear_data,
              action_manager
            }
          },
          build_stage( ctx, scenes ){
            let stage = new Telegraf.Stage( scenes, { ttl: 999 } )
            ctx.use(Telegraf.session())
            ctx.use(stage.middleware())
            return stage
          },
          build_scenes ( bot, scenes_data ) {
            let scenes = []

            forEach( scenes_data, ( scene_data, index )=>{
              scene_data = smart_values_manager.resolve_value( scene_data )
              if ( isArray( scene_data ) ) {
                scenes = scenes.concat( this.build_scenes( bot, scene_data ) )
              } else if ( isObject( scene_data ) ) {
                let scene = this.build_scene( bot, scene_data )
                scenes.push( scene || null )
              }
              
            } )

            return scenes;
          },
          build_scene ( bot, scene_data ) {
            let scene = new Telegraf.BaseScene( scene_data.id )

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
            forEach( commands, ( data, index )=> ctx.command( data.id, this.build_callback( data.cb ) ) )
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
              let action_id = smart_values_manager.resolve_value( data.text )
              let callback = this.build_callback( data.cb )

              ctx.action( action_id, (ctx)=>{
                callback( ctx )
              })
            } )
          },

          build_callback ( config ) {

            let $config = smart_values_manager.resolve_value( config, this )

            if ( isArray( $config ) ) {
              let callbacks = []

              forEach( $config, ( cb_data, index )=>{
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
            return $config.bind( this )
          },
        }
})
</script>
<style lang="less">
  .programed_bot {
    
  }
</style>