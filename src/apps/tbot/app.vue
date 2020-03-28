<template>
        <div class="app flex-column">
                <!-- <electron_app
                        ref="browser_window"
                        url="http://localhost:9000"
                        :width="800"
                        :no_restore="true"
                        :user_default_preload="true"
                /> -->
                <repostbot 
                        v-if="run_repostbot"
                        :bot_config="tbot_config.bots.repostman"
                />
                <storebot 
                        v-if="run_storebot"
                        :bot_config="tbot_config.bots.galaxy_market"
                />
        </div>
</template>
<script lang="js">

import repostbot from "apps/tbot/bots/repostbot"
import storebot from "apps/tbot/bots/storebot"
import electron_app from "lib_app/components/electron_app"

console.log(55,electron_app)

import tbot_config from "secret/tbot.json"


export default {
        name: "App",
        components: { repostbot, storebot, electron_app },
        data () {
                return {
                        run_repostbot: true,
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

        body {
                .app {
                        display: flex;
                        flex-direction: column;
                        position: absolute;
                        left: 0;
                        top: 0;
                        overflow: hidden;
                        padding: 8px;
                        background: #ddd;
                        
                        > .repostbot_wrapper {
                                width: 900px;
                                height: 700px;
                        }
                }
        }
</style>