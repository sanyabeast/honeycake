<template>
<program_wrapper
        title="Postbot"
        class="postbot"
>
        <programed_bot
                ref="telegraf_bot"
                @command="on_bot_command"
                :commands_prop="bot_commands"
                :BOT_API_TOKEN="bot_config.bot_api_token"
                :scenario="bot_config.scenario"
        />
</program_wrapper>

</template>
<script lang="js">

import logger from "apps/tbot/components/logger"
import program_wrapper from "apps/tbot/components/program_wrapper"
import programed_bot from "apps/tbot/components/programed_bot"
import PromiseQueue from "apps/default/lib/PromiseQueue.js"
import forEach from "lodash/forEach"
import debounce from "lodash/debounce"

export default {
  name: "App",
  components: { programed_bot, logger, program_wrapper },
  props: [ "bot_config", "schedule_file_path" ],
  data () {
    return {
      bot_commands: ["hi", "start", "echo"],
      promise_queue: null,
      schedule: {
        tasks: {},
        timeouts: {}
      }
    }
  },
 
  mounted () {
        console.log(this.bot_commands)

        let saved_schedule = window.action_manager.get_json( `temp/tbot/${ this.schedule_file_path }`, "schedule" )
        console.log( saved_schedule )
        forEach( saved_schedule, ( task, date )=>{
                this.add_task( Number(date), task );
        } )

        this.save_file = debounce(()=>{
                window.action_manager.set_json( `temp/tbot/${ this.schedule_file_path }`, `schedule`, this.schedule.tasks )
        }, 2000)
        this.promise_queue = new PromiseQueue()
        window.postbot = this
  },
  methods: {
          log ( text_message, type ) {
                  this.$refs.logger.log(text_message, type)
          },
          on_bot_command () {console.log(arguments)},
          run_task ( task_data, date ) {
                  this.remove_task( date )
                console.log(task_data) 
          },
          defer_task( date, task ) {
                if ( date < (+new Date()) ) {
                        return true
                }

                this.schedule.timeouts[date] = setTimeout(() => {
                        this.run_task( task, date )
                }, ( date - (+new Date()) ));

                return false;
          },
          add_task ( date, task ) {
                this.schedule.tasks[ date ] = task
                let is_exceeded = this.defer_task( date, task )

                if ( is_exceeded ){
                        delete this.schedule.tasks[ date ]
                }

                this.save_file()
          },
          remove_task( date ) {
                delete this.schedule.tasks[ date ]
                this.save_file()
          },
          clear_schedule () {
                  this.schedule.tasks = {}
                  forEach( this.schedule.timeouts, ( timeout_id, date )=>{
                          clearTimeout( timeout_id )
                  } )
          },
          save_file () {
                  
          }
  }
}

</script>
<style lang="less">

</style>