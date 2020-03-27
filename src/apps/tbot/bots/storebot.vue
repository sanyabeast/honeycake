<template>
  <div class="storebot bot">
    <div class="postbot_section">
      <div class="header">STOREBOT</div>
      <programed_bot
        ref="bot"
        @command="on_bot_command"
        :commands_prop="bot_commands"
        :scenario="bot_config.scenario"
        :BOT_API_TOKEN="bot_config.bot_api_token"
      />
    </div>
  </div>
</template>

<script lang="js">

import Vue from "vue"
import programed_bot from "apps/tbot/components/programed_bot"

export default Vue.extend({
        name: "storebot",
        mixins: [],
        components: { programed_bot },
        props: [ "bot_config" ],
        data () {
          return {
            bot_commands: [
              "start"
            ]
          }
        },
        watch: {},
        computed: {},
        mounted () {
          console.log(this.bot_config)
        },
        destroyed () {},
        methods: {
          on_bot_command ( payload ) {
            console.log( payload )
          }
        }
})
</script>
<style lang="less">
  .storebot {
    .postbot_section {
      height: 100%;
      .programed_bot {
        height: 100%;
      }
    }
  }
</style>