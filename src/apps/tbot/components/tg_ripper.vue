<template>
        <div class="tg_ripper">
          <div class="w-100 h-100 flex-column">
            <div class="header">TG RIPPER</div>
            <div class="tg_ripper_info w-100 h-100 flex-row">
              <logger ref="logger" class="w-100 h-100"/>
            </div>
          </div>
          
        </div>
</template>

<script lang="js">

import Vue from "vue"
import logger from "./logger"

export default Vue.extend({
        name: "tg_ripper",
        mixins: [],
        components: { logger },
        props: {},
        data () {
          return {
            browser_window: null
          }
        },
        watch: {},
        computed: {

        },
        mounted () {
          window.tg_ripper = this
          
          let browser_window = window.electron_window_manager.get_window_match_url("webogram", true)

          if (!browser_window) {
            browser_window = window.electron_window_manager.create_window({
              id: "tg_ripper",
              url: "https://webogram.ru/#/im",
              width: 800,
              extra_preload: "src/apps/tbot/extra/electron_tg_ripper.js"
            })
          }

          this.browser_window = browser_window

          ipc.on(`window_${ browser_window.id }.response`, this.on_webogram_response)
          ipc.on(`window_${ browser_window.id }.request`, this.on_webogram_request)
          ipc.on(`window_${ browser_window.id }.message`, this.on_webogram_message)
        },
        destroyed () {},
        methods: {
          log ( text_message, type ) {
            this.$refs.logger.log(text_message, type)
          },
          on_webogram_response ( event, data ) {
            // console.log(data)
          },
          on_webogram_request ( event, data ) {
            // console.log(data)
          },
          on_webogram_message ( event, payload ) {
            this.log(`message: ${payload.type}: ${payload.text||""}`, "message")

            if ( payload.type === "update" ) this.on_ripper_update( event, payload )
          },
          on_ripper_update ( event, payload ) {
            this.log(`update: ${payload.data.chat_caption} (${ payload.data.updates.length })`, "update");
            this.$emit("updates", {
              chat_caption: payload.data.chat_caption,
              updates: payload.data.updates
            })
          }, 
          send_data ( event_type, data ) {
            if ( this.browser_window ) {
              this.browser_window.send( event_type, {
                source_id: remote.getCurrentWindow().id,
                data,
              } )
            }
          }
        }
})
</script>
<style lang="less">
  .tg_ripper {
    border: 2px solid #353535;
    padding: 16px;

    overflow: hidden;

    .logger {
      .line {
        &[data-type="message"] {
          color: #ff6a9a;
        }

        &[data-type="update"] {
          color: #6ae3ff;
        }
      }
    }

    .header {
      width: 100%;
      height: 32px;
    }
    .tg_ripper_info {
      
    }
  }
</style>