<template>
        <div class="app flex-row">
                <tg_ripper
                        ref="tg_ripper"
                />
                <bot
                        ref="bot"
                        @command="on_bot_command"
                        :commands_prop="bot_commands"
                        :BOT_API_TOKEN="telegram_config.bot.API_TOKEN"
                />
        </div>
</template>
<script lang="js">



import tg_ripper from "./components/tg_ripper"
import bot from "./components/bot"


export default {
        name: "App",
        components: { tg_ripper, bot },
        data () {
                return {
                        bot_commands: ["hi", "start", "echo"]
                }
        },
        computed: {
                telegram_config () {
                        return this.$store.getters.telegram_config
                }
        },
        mounted () {

        },
        methods: {
                on_bot_command ( payload ) {
                        console.log(payload)
                } 
        }
}

</script>
<style lang="less">
        .app {
                display: flex;
                flex-direction: row;
                position: absolute;
                left: 0;
                top: 0;
                overflow: hidden;
        }
</style>