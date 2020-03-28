<template>
        <div class="app flex-column">
                <!-- <electron_app
                        ref="browser_window"
                        url="http://localhost:9000"
                        :width="800"
                        :no_restore="true"
                        :user_default_preload="true"
                /> -->
                <postbot v-if="run_postbot"/>
                <storebot 
                        v-if="run_storebot"
                        :bot_config="tbot_config.bots.galaxy_market"
                />
        </div>
</template>
<script lang="js">

import postbot from "apps/tbot/bots/postbot"
import storebot from "apps/tbot/bots/storebot"
import electron_app from "lib_app/components/electron_app"

console.log(55,electron_app)

import tbot_config from "secret/tbot.json"


export default {
        name: "App",
        components: { postbot, storebot, electron_app },
        data () {
                return {
                        run_postbot: true,
                        run_storebot: false,
                }
        },
        computed: {
                tbot_config () {
                        return tbot_config
                }
        },
        mounted () {

        },
        methods: {
                
        }
}

</script>
<style lang="less">

        .app {
                display: flex;
                flex-direction: column;
                position: absolute;
                left: 0;
                top: 0;
                overflow: hidden;
                padding: 8px;
                
                > .bot {
                        border: 2px solid #6e6e6e;
                        width: 700px;
                        height: 700px;
                        background-color: #121119;
                }
        }
</style>