<template>
        <div class="app flex-column">
                <postbot 
                        v-if="run_postbot"
                />
                <storebot 
                        v-if="run_storebot"
                        :bot_config="tbot_config.bots.galaxy_market"
                />
        </div>
</template>
<script lang="js">

import postbot from "apps/tbot/bots/postbot"
import storebot from "apps/tbot/bots/storebot"

import tbot_config from "secret/tbot.json"


export default {
        name: "App",
        components: { postbot, storebot },
        data () {
                return {
                        run_postbot: false,
                        run_storebot: true,
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
                        width: 500px;
                        height: 500px;
                        background-color: #121119;
                }
        }
</style>