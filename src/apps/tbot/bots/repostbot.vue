<template>
  <program_wrapper
        title="Repost Bot"
        class="repostbot_wrapper"
        grid_template_prop="1fr / 1fr 1fr"
  >
        <webogram_agent
                ref="webogram_agent"
                @updates="on_ripper_update"
                @message="on_webogram_message"
        />
        <postbot
                ref="postbot"
                :bot_config="bot_config"
                schedule_file_path="rpb.tasks.json"
        />
  </program_wrapper>
</template>
<script lang="js">

import logger from "apps/tbot/components/logger"
import postbot from "apps/tbot/bots/postbot"

import program_wrapper from "apps/tbot/components/program_wrapper"
import webogram_agent from "apps/tbot/components/webogram_agent"
import PromiseQueue from "apps/default/lib/PromiseQueue.js"
import forEach from "lodash/forEach"
import tbot_config from "secret/tbot.json"


export default {
  name: "App",
  components: { program_wrapper, webogram_agent, postbot, logger },
  props: [ "bot_config" ],
  data () {
    return {
      bot_commands: ["hi", "start", "echo"],
      post_interval: 2 * 60 * 1000,
      promise_queue: null
    }
  },
  computed: {
    tbot_config () {
      return this.$store.getters.tbot_config
    }
  },
  mounted () {
    this.promise_queue = new PromiseQueue()
    window.repostbot = this
  },
  methods: {
          on_webogram_message ( payload ) {
            if ( payload.type === "message.downloaded" ) {
              this.on_message_dl( payload )
              return
            }

            if ( payload && payload.message ) {
              switch ( payload.message.type ) {
                case "text":
                  // this.$refs.postbot.add_task( +new Date() + 5000, {
                  //   type: "post",
                  //   text: payload.message.text,
                  //   targets: ["@stonedpics", "@ooruell", "@cpalearctic"]
                  // });
                break;  
                case "photo":
                  console.log(payload)
                break;
                case "group":
                  this.$refs.webogram_agent.send_data( "message.download_media", {
                    context: payload,
                    save_path: "temp/tbot/repostbot/pics"
                  } )
                  // this.$refs.postbot.add_task( +new Date() + 5000, {
                  //   type: "post",
                  //   text: payload.message.text,
                  //   targets: ["@stonedpics", "@ooruell", "@cpalearctic"]
                  // });
                break;
                
              } 
            }
          },
          on_message_dl ( payload ) {
            console.log(payload)
            if ( payload.message.photo ) {
              this.$refs.postbot.add_task( +new Date() + 5000, {
                type: "post",
                photo: {
                  url: payload.message.photo.local_path
                },
                targets: ["@stonedpics", "@ooruel", "@cpalearctic"]
              } )
            } else if ( payload.message.mediagroup ) {
              let mediagroup = []
              forEach( payload.message.mediagroup, ( media_data )=>{
                mediagroup.push( {
                  type: "photo",
                  url: media_data.local_path,
                  caption: media_data.data.caption
                } )
              } )

              console.log(mediagroup)

              this.$refs.postbot.add_task( +new Date() + 5000, {
                type: "post",
                mediagroup,
                targets: ["@stonedpics", "@ooruel", "@cpalearctic"]
              } )
            }

            console.log(payload)
          }, 
          log ( text_message, type ) {
                  this.$refs.logger.log(text_message, type)
          },
          on_bot_command ( payload ) {
                  console.log(payload)
          },
          on_ripper_update() {}
  }
}

</script>
<style lang="less">
  .repostbot_wrapper > .container > .content {

  }
</style>