<template>
  <program_wrapper
    title="Webogram Agent"

  >
    <logger ref="logger"/>
    <program_wrapper
      title="Electron App"
      class="electron_app"
    >
      <ElectronApp
        ref="electron_app"
        url="http://localhost:8000/app/index.html"
        :width="800"
        :height="600"
        extra_preload="src/apps/tbot/extra/webogram_agent.node.js"
        @request="on_webogram_request"
        @response="on_webogram_response"
        @message="on_webogram_message"
      />
    </program_wrapper>
    
  </program_wrapper>
 
</template>

<script lang="js">

import program_wrapper from "apps/tbot/components/program_wrapper"
import Vue from "vue"
import logger from "./logger"
import ElectronApp from "lib_app/components/electron_app"

export default Vue.extend({
        name: "webogram_agent",
        mixins: [],
        components: { program_wrapper, logger, ElectronApp },
        props: {},
        data () {
          return {
          }
        },
        watch: {},
        computed: {

        },
        mounted () {
          window.webogram_agent = this
          
          
        },
        destroyed () {},
        methods: {
          log ( text_message, type ) {
            this.$refs.logger.log(text_message, type)
          },
          on_webogram_response ( { event, payload } ) {
            // console.log(payload)
          },
          on_webogram_request ( { event, payload } ) {
            // console.log(payload)
          },
          get_contact_caption ( contact ) {
            return contact.username || contact.title || contact.id
          },
          requst_media_download ( context ) {
            this.send_data( "message.download_media", context )
          },
          on_webogram_message ( { event, payload }) {

            this.$emit( "message", payload.data )

            let data = payload.data

            switch (payload.type) {
              case "message":
                this.log(`message from ${ this.get_contact_caption( data.from ) } ( ${ data.message.type + ( data.message.type === "group" ? ", " + data.message.mediagroup.length : "" ) } )`)
                break;
            
              default:
                this.log(`event: ${ payload.type }`)
                break;
            }

            console.log(payload)
            // if ( payload.type === "update" ) this.on_ripper_update( event, payload )
          },
          on_ripper_update ( event, payload ) {
            this.log(`update: ${payload.data.chat_caption} (${ payload.data.updates.length })`, "update");
            this.$emit("updates", {
              chat_caption: payload.data.chat_caption,
              updates: payload.data.updates
            })
          }, 
          send_data ( event_type, data ) {
            console.log(event_type)
            if ( this.$refs.electron_app ) {
              this.log(`sending event to webogram (${ event_type })`)
              this.$refs.electron_app.send_data( event_type, data )  
            }
          }
        }
})
</script>
<style lang="less">
  .webogram_agent {
    
    .logger {
      .item {
        &[data-type="message"] {
          color: #1894ff;
        }

        &[data-type="message.text"] {
          color: #00fff5;
        }


        &[data-type="update"] {
          color: #6ae3ff;
        }

        &[data-type="session.start"] {
          color: #569933;
        }
        
      }
    }


  }
</style>