<template>
<ProgramWrapper
  title="Telegraf Bot"
  class="telegraf_bot"
  
>
  <logger 
    title="Events Log"
    ref="logger"
  />
  <ProgramWrapper
    title="Storage Monitor"
    class="storage_monitor"
  >
    <Logger 
      title="Events Log"
      ref="storage_monitor_logger"
      
    />
  </ProgramWrapper>
</ProgramWrapper>
</template>

<script lang="js">

import EvalWizard from "apps/default/lib/evalwizard"
import ProgramWrapper from "apps/tbot/components/program_wrapper"
import Vue from "vue"
import transform from "lodash/transform"
import get from "lodash/get"
import set from "lodash/set"
import forEach from "lodash/forEach"
import isArray from "lodash/isArray"
import isString from "lodash/isString"
import isNumber from "lodash/isNumber"
import isObject from "lodash/isObject"
import unset from "lodash/unset"
import map from "lodash/map"
import find from "lodash/find"
import Logger from "./logger"
import debounce from "lodash/debounce"
import merge from "lodash/merge"
import chunk from "lodash/chunk"
import toPairs from "lodash/toPairs"
import keys from "lodash/keys"
import values from "lodash/values"
import sum from "lodash/sumBy"


let lodash_map = map
let lodash_find = find
let lodash_merge = merge
let lodash_chunk = chunk
let lodash_toPairs = toPairs
let lodash_keys = keys
let lodash_values = toPairs


export default Vue.extend({
  name: "bot",
  mixins: [],
  components: { Logger, ProgramWrapper },
  props: ["BOT_API_TOKEN", "commands_prop", "database_file"],
  data () {
    return {
      evalwizard_vars: {
        data: null,
        ctx: null,
        map,
        find,
        merge,
        chunk,
        to_pairs: toPairs,
        keys,
        values,
        sum,
        log: ( d )=> console.log( 'eval log', d ),
        set_temp: ( p, v )=> this.set_temp( p, v ),
        get_temp: ( p )=> this.get_temp( p ),
        only_letters: ( string )=> string.match(/[a-zA-Zа-яА-Я\s]+/gm)[0] || "...",
        only_number: ( string )=> string.match(/\d+(\.|)+(\d+|)/)[0] || 0,
        split: ( string, sep, index )=> string.split(sep)[index],
        num: ( val ) => Number( val )
      },
      extra_commands: [
        "help",
        "me",
        "userscount"
      ],
      database_object: {},
      auto_launch: true,
      state: {
        log: []
      },
      ctx_mock: {
        from: {},
        message: { text: "mock" }
      }
    }
  },
  watch: {},
  computed: {},
  mounted () {
    window.bot = this
    this.evalwizard = window.evalwizard = new EvalWizard( {
      context: this,
      intermediate_code: `
        this.log("telegraf bot...");

        let timestamp = "t_" + (+new Date()).toString()
        let msg = ctx.message;
        let from = ctx.from;
        let userdata = ()=> this.get_user_data( ctx );
        let match = ctx.match ? ctx.match.input : ""
        let get_fullname = ()=>{ return this.get_full_contact_name( ctx.from ) };
        let set = ( p, v ) => { return this.set_user_value( ctx, p, v ) };
        let unset = ( p, v ) => { return this.unset_user_value( ctx, p ) };
        let get = ( p, v ) => { return this.get_user_value( ctx, p ) };
        let reply = ( message, extra )=> { this.send_text( ctx.from.id, message, extra ) }
      `
    } )

    
    this.read_temp()
    let bot = this.bot = new Telegraf(this.BOT_API_TOKEN)

    this.save_temp = debounce(()=>{
      this.log(`saving datatabase file (${this.database_file})`, "system")
      action_manager.write_json( this.database_file, this.database_object )
    }, 2000)

    /*!test*/
    // this.log("init commands...", "system");
    // this.commands_prop.concat(this.extra_commands).forEach((item, index)=>{
    //   this.bot.command(item, this.on_command)
    // })

    
    if ( this.auto_launch ) {
      this.launch()
    }

  },
  destroyed () {},
  methods: {
    apply_template ( string, ctx ) {
        return this.eval( "`" + string + "`", ctx )
    },
    eval ( post_code, ctx ) {
      return this.evalwizard.eval( post_code, set( this.evalwizard_vars, "ctx", ctx ) )
    },
    get_users_list () {
      let users_list = this.get_temp("users") || {};
      return users_list;
    },
    get_users_count () {
      return keys( this.get_users_list() ).length
    },
    broadcast ( message ) {
      let ulist = this.get_users_list();

      forEach(ulist, ( user_data )=>{

        this.send_text( user_data.id, this.apply_template( message, {
          from: user_data,
          message: {}
        } ) )
      })
    },
    update_storage_monitor_data ({ scope, prop, direction, user, value } ) {
      this.$refs.storage_monitor_logger.log( `${scope} | ${ user || "..." } | ${ direction === 1? "READ" : "WRTE" } | ${ prop || "..." } | ${ value || "..." }` )
    },
    get_user_data ( telegraf_ctx ) {
        this.log("requested self data", "user_data")
        let loaded_user_data = this.get_temp( `users.id_${ telegraf_ctx.from.id }` )

        if ( !loaded_user_data ) {
          loaded_user_data = this.resolve_user_data( telegraf_ctx )
        }
        return loaded_user_data
    },  
    get_user_value ( telegraf_ctx, prop_path ) {
      this.log("getting user data", "user_data")
      this.update_storage_monitor_data({ scope: "user", user: this.resolve_user_caption(telegraf_ctx), prop: prop_path, direction: 1 })
      let user_data = this.get_user_data( telegraf_ctx )
      let value = get( user_data, `bot_data.${ prop_path }` )
      return value
    },
    set_user_value ( telegraf_ctx, prop_path, value ) {
      this.log("setting user data", "user_data")
      this.update_storage_monitor_data({ scope: "user", user: this.resolve_user_caption(telegraf_ctx), prop: prop_path, value: value, direction: -1 })
      let user_data = this.get_user_data( telegraf_ctx )
      set( user_data, `bot_data.${ prop_path }`, value )
      this.set_temp( `users.id_${telegraf_ctx.from.id}`, user_data )
    },
    unset_user_value( telegraf_ctx, prop_path ) {
      this.log("unsetting user data", "user_data")
      let user_data = this.get_user_data( telegraf_ctx )
      unset( user_data, `bot_data.${ prop_path }` )
      this.set_temp( `users.id_${telegraf_ctx.from.id}`, user_data )
    },
    resolve_user_caption ( telegraf_ctx ) {
      return telegraf_ctx.from.username || telegraf_ctx.from.id
    },
    resolve_user_data ( telegraf_ctx ) {
      if ( this.get_temp( `users.id_${ telegraf_ctx.from.id }` ) ) {
        return this.get_temp( `users.id_${ telegraf_ctx.from.id }` )
      }

      let user_data = {
        id: telegraf_ctx.from.id,
        is_bot: telegraf_ctx.from.is_bot,
        first_name: telegraf_ctx.from.first_name,
        last_name: telegraf_ctx.from.last_name,
        username: telegraf_ctx.from.username,
        language_code: telegraf_ctx.from.language_code,
      }

      this.log("creating user data...", "user_data")
      this.set_temp( `users.id_${telegraf_ctx.from.id}`, user_data )
      return user_data
    } , 
    save_temp () {
      
    },
    read_temp () {
      this.log(`reading datatabase file (${this.database_file})`, "system")
      this.database_object = action_manager.read_json( this.database_file )
      return this.database_object
    },
    set_temp ( path, value ) {
      this.log(`setting datatabase data (${path}, ${value})`, "system")
      set( this.database_object, path, value );
      this.save_temp()
    }, 
    get_temp ( path ) {
      this.log(`reading datatabase data ${ path }`, "system")
      return get( this.database_object, path )
    },
    unset_temp ( path ) {
      this.log(`unsetting datatabase data (${path}, ${value})`, "system")
      unset( this.database_object, path );
      this.save_temp()
    }, 
    init_events () {
      let bot = this.bot
      bot.on("update", this.on_update)
      bot.on("message", this.on_message)
      bot.on("action", this.on_action)
      bot.on("text", this.on_text)

    },
    enter_scene ( ctx, scene_name ) {
      this.log("enter scene")
        return ctx.scene.enter( scene_name )
    },
    leave_scene ( ctx ) {
      this.log("leave scene")
      return ctx.scene.leave()
    },
    launch () {
      this.init_events()
      setTimeout(()=>{
        this.bot.launch()
      }, 1000)
    },
    stop () {
      this.bot.stop()
    },
    log ( text_message, type ) {
      this.$refs.logger.log(text_message, type)
    },
    /**callbacks */
    on_message ( telegraf_ctx ) {
      let message_type = this.get_message_type( telegraf_ctx );
      this.log(`recieved message from ${this.get_full_contact_name(telegraf_ctx.from)} - "${ this.get_short_message(telegraf_ctx.message.text, 16) }"`, "recieved")
      this.resolve_user_data( telegraf_ctx )
      
    },
    on_text ( telegraf_ctx ) {
      this.log("Bot text")
    },
    on_update ( telegraf_ctx ) {
      this.log("Bot update")
    },
    on_command ( telegraf_ctx ) {
      this.log(`Command "${ telegraf_ctx.message.text.replace(/\//gm, "") }" from ${ telegraf_ctx.from.first_name } ${telegraf_ctx.from.last_name}`, "command")

      this.$emit("command", {
        command_type: telegraf_ctx.message.text.replace(/\//gm, ""),
        telegraf_ctx
      })


    },
    on_action ( telegraf_ctx ) {
      this.log(`action "${  telegraf_ctx.message.text.replace(/\//gm, "") }" from ${ telegraf_ctx.from.first_name } ${telegraf_ctx.from.last_name}`, "action")

        this.$emit("action", {
          action_type:  telegraf_ctx.message.text.replace(/\//gm, ""),
          telegraf_ctx
        })
    },
    /*sending*/
    send_help ( telegraf_ctx ) {
      telegraf_ctx.replyWithHTML(`<b>Availabale commands:</b>\n${ this.object_to_string( this.commands_prop.concat(this.extra_commands), ( key, value )=>{
        return `/${ value }\n`
      } ) }`)
    },
    send_text ( chat_id, text, extra ) {
      if ( isNumber(text) ) text = text.toString()
      this.log(`sending message to ${ chat_id } - "${this.get_short_message(text)}"`, "sending")
      if ( extra ) extra.parse_mode = "HTML"
      if ( extra && extra.text ) text = extra.text
      if ( text.length === 0 ) text = "...";
      this.bot.telegram.sendMessage( chat_id, text, extra || Telegraf.Extra.HTML() )
    },
    send_photo ( chat_id, image_data, extra ) {
      this.log(`sending image to ${ chat_id } - "${image_data.url}"`, "sending")
      if ( extra ) extra.parse_mode = "HTML"
      this.bot.telegram.sendPhoto( chat_id, {
        source: image_data.url,
      }, extra )
    },
    send_mediagroup ( chat_id, media ) {
      let media_group = transform(media, (result, value, key)=>{
        result[key] = {
          type: value.type,
          media: {
            // source: value.url
            source: value.url
          },
          caption: value.caption
        }
      })
      this.bot.telegram.sendMediaGroup( chat_id, media_group )
    },  
    /*utils*/
    get_message_type ( telegraf_ctx ) {
      let message = telegraf_ctx.message
      let type = ""
      let is_forwarded = telegraf_ctx.message && isObject( telegraf_ctx.message.forward_from_chat )
      let has_entities = telegraf_ctx.message &&    isArray( telegraf_ctx.message.entities )
      let is_mediagroup = false

      if ( telegraf_ctx.message ) {
        if ( isString(message.media_group_id) ) is_mediagroup = true;
        if ( isObject(message.sticker) ) type = "sticker";
        if ( isString(message.text) ) type = "text";
        if ( isArray(message.photo) ) type = "photo"
        if ( isObject(message.video) ) type = "video"
        if ( isObject(message.location) ) type = "location"
      }
      
      return {
        type,
        is_forwarded,
        has_entities,
        is_mediagroup
      }
    },
    get_short_message ( text, length ) {
      text = text || ""

      if (text < length) {
        return text
      } else {
        return `${text.substring(0, length)}...`
      }
    },
    get_full_contact_name ( data ) {
      return `${data.first_name} ${data.last_name}`
    },
    object_to_string ( object, line_format ) {
      let result = ""
      if (!line_format) line_format = ( key, value )=>{
        return `<b>${ key }</b>: <i>${ value }\n</i>`
      }

      forEach( object, ( value, key )=>{
        result+=line_format(key, value)
      } )

      return result
    },
    object_to_markup ( object ) {
      return Telegraf.Markup.keyboard( (this.object_to_pairs( object )) )
      .oneTime()
      .resize()
      .extra()
    },
    object_to_pairs ( object ) {
      let result = []
      forEach(object, ( value, key )=>{
        result.push([ JSON.stringify(key), JSON.stringify(value) ])
      })
      return result
    },
    random_from_args () {
      let args = [...arguments]
      return args[Math.floor(Math.random() * args.length)]
    },
   
    /*markup*/
    create_inline_keyboard ( data ) {
      let kb_data = []
      if ( isArray( data ) ) {
        forEach(data, ( item_data, item_id )=>{
          if ( isArray( item_data ) ) {
            let buttons = []
            forEach( item_data, ( data, id )=>{
              let split = data.split("@@")
              let action_id 
              let action

              if ( split.length > 1 ) {
                action_id = split[0]
                action = split[1]
              } else {
                action_id = action = data
              }

              buttons.push( Telegraf.Markup.callbackButton( action_id, action ) )
            } )
            kb_data.push( buttons )
            return
          }

          let split = item_data.split("@@")
          let action_id 
          let action

          if ( split.length > 1 ) {
            action_id = split[0]
            action = split[1]
          } else {
            action_id = action = item_data
          }


          kb_data.push( [Telegraf.Markup.callbackButton( action_id, action )] )
        })
      } else {
        forEach(data, ( item_data, item_id )=>{
          if ( isArray( item_data ) ) {
            let buttons = []
            forEach( item_data, ( data, id )=>{
              let split = data.split("@@")
              let action_id 
              let action

              if ( split.length > 1 ) {
                action_id = split[0]
                action = split[1]
              } else {
                action_id = action_id = data
              }


              buttons.push( Telegraf.Markup.callbackButton( action_id, action ) )
            } )
            kb_data.push( buttons )
            return
          }
          let split = item_data.split("@@")
          let action_id 
          let action

          if ( split.length > 1 ) {
            action_id = split[0]
            action = split[1]
          } else {
            action_id = action = item_data
          }

          kb_data.push( [Telegraf.Markup.callbackButton( action_id, action )] )
        })
      }

      return Telegraf.Markup.inlineKeyboard( kb_data )
    }
  }
})
</script>
<style lang="less">
  .telegraf_bot {
   
    .logger {
      background: linear-gradient(90deg, #986262 0%, #bb907b 100%);

      .header {
        background: #d42f2f!important;
        color: wheat!important;
      }

      .container {
        background: #f5e6bb!important;
        color: wheat!important;
      }
      .item {
        &[data-type="sending"] {
          color: #33259e;
          background: #ce9cff;
        }

        &[data-type="command"] {
          color: #00586d;
          background: #8cdaff;
        }

        &[data-type="action"] {
          color: #6ae3ff;
        }

        &[data-type="recieved"] {
          color: #710268;
          background: #cea4f9;
        }

        &[data-type="system"] {
          color: #444444;
          background: #d0d0d0;
        }

        &[data-type="user_data"] {
          color: #8c6f00;
          background: #ffd473;
        }
      }
    }

    .storage_monitor {
      .header {
        background: #008654!important;
        color: #eee!important;
      }

      .container {
        background: #00435d!important;
      }

      .content {
        > div {
          display: flex;
          align-items: center;
          justify-self: center;
        }
      }
    }

  }
</style>