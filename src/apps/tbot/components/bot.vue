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
import logger from "./logger"

export default Vue.extend({
        name: "bot",
        mixins: [],
        components: { logger },
        props: ["BOT_API_TOKEN", "commands_prop"],
        data () {
          return {
            state: {
              log: []
            }
          }
        },
        watch: {},
        computed: {},
        mounted () {
          window.bot = this
          this.bot = new Telegraf(this.BOT_API_TOKEN)

          this.commands_prop.forEach((item, index)=>{
            this.bot.command(item, ( telegraf_ctx )=>{
              this.log(`Command "${ item }" from ${ telegraf_ctx.from.first_name } ${telegraf_ctx.from.last_name}`, "command")

              this.$emit("command", {
                command_type: item,
                telegraf_ctx
              })
            })
          })

          this.bot.on("update", (r)=>{
            console.log(r)
          })
          this.bot.on("message", this.on_bot_message)
          this.bot.on("text", this.on_bot_text)
          this.bot.launch()
        },
        destroyed () {},
        methods: {
          log ( text_message, type ) {
            this.$refs.logger.log(text_message, type)
          },
          on_bot_text ( telegraf_ctx ) {
            console.log(arguments, this)
            this.log("Bot text")
          },
          get_short_message ( text, length ) {
            if (text < length) {
              return text
            } else {
              return `${text.substring(0, length)}...`
            }
          },
          get_contact_name ( data ) {
            return `${data.first_name} ${data.last_name}`
          },
          on_bot_message ( telegraf_ctx ) {
            this.log(`recieved message from ${this.get_contact_name(telegraf_ctx.from)} - "${ this.get_short_message(telegraf_ctx.message.text, 16) }"`, "recieved")
            console.log(arguments, this)
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

         &[data-type="recieved"] {
          color: #6aff83;
        }
      }
    }

    .bot_info {
      
    }
  }
</style>