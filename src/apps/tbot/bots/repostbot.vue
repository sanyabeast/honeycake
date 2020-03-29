<template>
  <program_wrapper
        title="Repost Bot"
        class="repostbot_wrapper"
        grid_template_prop="1fr / 1fr 1fr"
  >
        <webogram_agent
                ref="webogram_agent"
                @updates="on_ripper_update"
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

import program_wrapper from "apps/tbot/components/program_wrapper"
import webogram_agent from "apps/tbot/components/webogram_agent"
import postbot from "apps/tbot/bots/postbot"
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