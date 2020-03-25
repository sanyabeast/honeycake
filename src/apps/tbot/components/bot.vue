<template>
        <div class="bot flex-column">
          <div class="header">BOT</div>
          <div class="bot_info flex-row">
            <div class="log flex-column">
              <div
                v-for="(item, index) in state.log"
                :key="index">

                <div class="text_content" v-html="item.text_content"/>

              </div>
            </div>
          </div>
        </div>
</template>

<script lang="js">

import Vue from "vue"
import transform from "lodash/transform"

export default Vue.extend({
        name: "bot",
        mixins: [],
        components: {},
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
              this.log(`Command "${ item }" from ${ telegraf_ctx.from.first_name } ${telegraf_ctx.from.last_name}`)

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
          log ( text_message ) {
            this.state.log.push({
              text_content: text_message
            })
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
            this.log(`recieved message from ${this.get_contact_name(telegraf_ctx.from)} - "${ this.get_short_message(telegraf_ctx.message.text, 16) }"`)
            console.log(arguments, this)
          },
          send_message ( chat_id, text ) {
            this.log(`sending message to ${ chat_id } - "${this.get_short_message(text)}"`)
            this.bot.telegram.sendMessage( chat_id, text )
          },
          send_image ( chat_id, image_url ) {
            this.log(`sending image to ${ chat_id } - "${image_url}"`)
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
    margin: 0 16px;
    width: 500px;
    height: 500px;
    .header {
      width: 100%;
      height: 32px;
    }
    .bot_info {
      .log {
        font-size: 12px;
        font-weight: 300;
        font-family: monospace;
      }
    }
  }
</style>