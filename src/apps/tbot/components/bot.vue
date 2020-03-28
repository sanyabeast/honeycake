<template>
        <div class="bot flex-column">
          <div class="header">BOT</div>
          <div class="bot_info flex-row">
            <logger 
              ref="logger"
            />
          </div>
        </div>
</template>

<script lang="js">

import Vue from "vue"
import transform from "lodash/transform"
import get from "lodash/get"
import set from "lodash/set"
import forEach from "lodash/forEach"
import isArray from "lodash/isArray"
import isString from "lodash/isString"
import isObject from "lodash/isObject"
import keys from "lodash/keys"
import unset from "lodash/unset"
import logger from "./logger"

export default Vue.extend({
        name: "bot",
        mixins: [],
        components: { logger },
        props: ["BOT_API_TOKEN", "commands_prop"],
        data () {
          return {
            extra_commands: [
              "start",
              "help",
              "commands",
              "me",
              "echo",
              "userscount"
            ],
            database_object: {},
            database_file: "temp/tbot/bot_0db.json",
            auto_launch: true,
            state: {
              log: []
            }
          }
        },
        watch: {},
        computed: {},
        mounted () {
          window.bot = this
          this.read_temp()
          let bot = this.bot = new Telegraf(this.BOT_API_TOKEN)

          bot.use(Telegraf.log())
          
          /*test*/

          bot.on('inline_query', async ({ inlineQuery, answerInlineQuery }) => {
            const apiUrl = `http://recipepuppy.com/api/?q=${inlineQuery.query}`
            const response = await fetch(apiUrl)
            const { results } = await response.json()
            const recipes = results
              .filter(({ thumbnail }) => thumbnail)
              .map(({ title, href, thumbnail }) => ({
                type: 'article',
                id: thumbnail,
                title: title,
                description: title,
                thumb_url: thumbnail,
                input_message_content: {
                  message_text: title
                },
                reply_markup: Markup.inlineKeyboard([
                  Markup.urlButton('Go to recipe', href)
                ])
              }))
            return answerInlineQuery(recipes)
          })

          bot.on('chosen_inline_result', ({ chosenInlineResult }) => {
            console.log('chosen inline result', chosenInlineResult)
          })

          bot.command('pyramid', (ctx) => {
            return ctx.reply('Keyboard wrap', Telegraf.Extra.markup(
              Telegraf.Markup.keyboard(['one', 'two', 'three', 'four', 'five', 'six'], {
                wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2
              })
            ))
          })

          bot.command('simple', (ctx) => {
            return ctx.replyWithHTML('<b>Coke</b> or <i>Pepsi?</i>')
          })

          bot.command('inline', (ctx) => {
            return ctx.reply('<b>Coke</b> or <i>Pepsi?</i>', Telegraf.Extra.HTML().markup((m) =>
              m.inlineKeyboard([
                m.callbackButton('Coke', 'lol'),
                m.callbackButton('Pepsi', 'kek'),
              ])))
          })

          bot.command('random', (ctx) => {
            return ctx.reply('random example',
              Telegraf.Markup.inlineKeyboard([
                Telegraf.Markup.callbackButton('Coke', 'Coke'),
                Telegraf.Markup.callbackButton('Dr Pepper', 'Dr Pepper', Math.random() > 0.5),
                Telegraf.Markup.callbackButton('Pepsi', 'Pepsi')
              ]).extra()
            )
          })

          /*!test*/
          this.commands_prop.concat(this.extra_commands).forEach((item, index)=>{
            this.log("init commands", "system");
            this.bot.command(item, this.on_command)
          })

          
          if ( this.auto_launch ) {
            this.launch()
          }

        },
        destroyed () {},
        methods: {
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

              this.send_message( user_data.id, this.apply_template( {
                from: user_data,
                message: {}
              }, message ) )
            })
          },
          get_user_data ( telegraf_ctx ) {
              this.log("requested self data", "command")
              let loaded_user_data = this.get_temp( `users.id_${ telegraf_ctx.from.id }` )

              if ( !loaded_user_data ) {
                loaded_user_data = this.update_user_data( telegraf_ctx )
              }
              return loaded_user_data
          },  
          update_user_data ( telegraf_ctx ) {
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

            this.log("creating user data...", "system")
            console.log(user_data)
            this.set_temp( `users.id_${telegraf_ctx.from.id}`, user_data )
            return user_data
          } , 
          save_temp () {
            this.log("saving datatabase file...", "system")
            console.log(this.database_file)
            action_manager.write_json( this.database_file, this.database_object )
          },
          read_temp () {
            this.log("reading datatabase file...", "system")
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
          init_events () {
            let bot = this.bot
            bot.on("update", this.on_update)
            bot.on("message", this.on_message)
            bot.on("action", this.on_action)
            bot.on("text", this.on_text)

          },
          enter_scene ( scene_name ) {
            this.log("enter scene")
              return Telegraf.Stage.enter( scene_name )
          },
          leave_scene () {
            this.log("leave scene")
            return Telegraf.Stage.leave()
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
            console.log(telegraf_ctx.message, telegraf_ctx.from)
            let message_type = this.get_message_type( telegraf_ctx );
            console.log(`Message type:`, message_type)
            this.log(`recieved message from ${this.get_full_contact_name(telegraf_ctx.from)} - "${ this.get_short_message(telegraf_ctx.message.text, 16) }"`, "recieved")
            this.update_user_data( telegraf_ctx )
            
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

            let command_name = telegraf_ctx.message.text.replace(/\//gm, "")

            if ( "commands" === command_name ) {
              this.send_help( telegraf_ctx )
            } else if ( "help" === command_name ) {
              this.send_help( telegraf_ctx )
            } else if ( "me" === command_name ) {
              let user_data = this.get_user_data ( telegraf_ctx );
              telegraf_ctx.replyWithHTML( `You are <i>${user_data.first_name} ${user_data.last_name}</i>`, this.object_to_markup( user_data, null, "\t" ) )
            } else if ( "echo" === command_name ) {
              telegraf_ctx.reply( telegraf_ctx.message.text )
            } else if ( "start" === command_name ) {
              this.update_user_data( telegraf_ctx )
            } else if ( "userscount" === command_name ) {
              telegraf_ctx.replyWithHTML( `👤 👤 👤\nКоличество пользователей: <b>${ this.get_users_count() }</b>` )
            }
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
          send_message ( chat_id, text ) {
            this.log(`sending message to ${ chat_id } - "${this.get_short_message(text)}"`, "sending")
            this.bot.telegram.sendMessage( chat_id, text )
          },
          send_image ( chat_id, image_url ) {
            this.log(`sending image to ${ chat_id } - "${image_url}"`, "sending")
            this.bot.telegram.sendPhoto( chat_id, {
              source: image_url
            } )
          },
          send_media_group ( chat_id, media ) {
            let media_group = transform(media, (result, value, key)=>{
              result[key] = {
                type: value.type,
                media: {
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
            console.log(this.object_to_pairs( object ))
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
          apply_template ( telegraf_ctx, string ) {
            let result = this.eval(`
              let template = result = \`${ string }\`;
            `, telegraf_ctx)

            return result  

          },

          eval ( post_code, telegraf_ctx ) {
            console.log("message type: ", this.get_message_type( telegraf_ctx ));

            let code = `
              let get_fullname = ()=>{ return this.get_full_contact_name( telegraf_ctx.from ) };
              let emoji = this.emoji_list;
              let msg = telegraf_ctx.message;
              let msg_type;

              if (msg) {
                msg_type = ( msg.sticker !== undefined ? "sticker" : "default");
              }
              
              let userdata = function(){ 
                if ( arguments.length > 0 ) {

                } else {
                  return this.get_user_data( telegraf_ctx );
                }
              }.bind(this);
              let set_temp = (p, v)=> this.set_temp(p, v);
              let get_temp = (p)=> this.get_temp(p);
              let rand = this.random_from_args.bind(this.get_short_message)
              
              let from = telegraf_ctx.from;
      
              ${post_code}
            `
            let result = null
            eval(code)
            // // try {
            // //   eval(code)
            // // } catch ( err ) {
            // //   console.error("Evaluating property failed: ", err);
            // }

            return result
          },
          /*markup*/
          inline_kb_list ( data ) {
            let kb_data = []

            if ( isArray( data ) ) {
              forEach(data, ( item_data, item_id )=>{
                kb_data.push( Telegraf.Markup.callbackButton( item_data, item_data ) )
              })
            } else {
              forEach(data, ( item_data, item_id )=>{
                kb_data.push( Telegraf.Markup.callbackButton( item_data, item_id ) )
              })
            }

            return Telegraf.Markup.inlineKeyboard( kb_data ).extra()
          }
        }
})
</script>
<style lang="less">
  .bot {
    border: 2px solid #353535;
    padding: 16px;

    .header {
      width: 100%;
      height: 32px;
    }

    .logger {
      .line {
        &[data-type="sending"] {
          color: #ff6a9a;
        }

        &[data-type="command"] {
          color: #6ae3ff;
        }

        &[data-type="action"] {
          color: #6ae3ff;
        }

         &[data-type="recieved"] {
          color: #6aff83;
        }

        &[data-type="system"] {
          color: #ff5722;
        }
      }
    }

    .bot_info {
      
    }
  }
</style>