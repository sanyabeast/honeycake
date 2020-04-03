<template>
        <div class="app flex-row">
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

                        v-for="(item, index) in storebots"
                        :key="index"
                        :bot_config="item"
                        class="storebot_program"
                />

                <folderpostbot
                        v-if="run_folderpostbot"
                        :bot_config="tbot_config.bots.repostman"
                        database_path="secret/tbot/folderpostbot/db1"
                />
        </div>
</template>
<script lang="js">

import folderpostbot from "apps/tbot/bots/folderpostbot"
import repostbot from "apps/tbot/bots/repostbot"
import storebot from "apps/tbot/bots/storebot"
import electron_app from "lib_app/components/electron_app"
import filter from "lodash/filter"

console.log(55,electron_app)

import tbot_config from "secret/tbot.json"


export default {
        name: "App",
        components: { folderpostbot, repostbot, storebot, electron_app },
        data () {
                return {
                        run_repostbot: false,
                        run_storebot: true,
                        run_folderpostbot: false
                }
        },
        computed: {
                bots_config () {
                        return this.tbot_config.bots
                },
                tbot_config () {
                        return tbot_config
                },
                storebots () {
                        return filter( this.bots_config, ( data )=> data.type === "storebot" )
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
                width: 100%;
                .app {
                        display: flex;
                        flex-direction: row;
                        position: absolute;
                        left: 0;
                        top: 0;
                        overflow: hidden;
                        padding: 8px;
                        background: #1b1b1b;
                        width: 100%;
                        display: grid;
                        grid-template-rows: 1fr 1fr;
                        grid-template-columns: 1fr 1fr;
                        grid-gap: 16px;
                        
                        > .repostbot_wrapper {
                                width: 50%;
                                height: 700px;
                        }

                        > .storebot_program {
                                width: 100%;
                                height: 100%;
                        }
                }
        }
</style>