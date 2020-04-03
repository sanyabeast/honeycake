<template>
<program_wrapper
  title="Storebot"
  class="storebot"
>
    <programed_bot
      ref="bot"
      @command="on_bot_command"
      :commands_prop="bot_commands"
      :scenario="bot_config.scenario"
      :database_file="bot_config.database_file"
      :BOT_API_TOKEN="bot_config.bot_api_token"
    />
</program_wrapper>

</template>

<script lang="js">

import Vue from "vue"
import program_wrapper from "apps/tbot/components/program_wrapper"
import programed_bot from "apps/tbot/components/programed_bot"

export default Vue.extend({
        name: "storebot",
        mixins: [],
        components: { program_wrapper, programed_bot },
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
    
  }
</style>