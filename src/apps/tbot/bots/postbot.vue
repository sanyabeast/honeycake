<template>
        <div class="postbot bot flex-column">
                <div class="postbot_section">
                        <div class="header">POSTBOT</div>
                        <logger ref="logger"/>
                </div>
                <div class="modules flex-row w-100">
                        <tg_ripper
                                ref="tg_ripper"
                                @updates="on_ripper_update"
                        />
                        <bot
                                ref="bot"
                                @command="on_bot_command"
                                :commands_prop="bot_commands"
                                :BOT_API_TOKEN="tbot_config.bot.API_TOKEN"
                        />
                </div>
        </div>
</template>
<script lang="js">

import logger from "apps/tbot/components/logger"

import tg_ripper from "apps/tbot/components/tg_ripper"
import bot from "apps/tbot/components/bot"
import PromiseQueue from "apps/default/lib/PromiseQueue.js"
import forEach from "lodash/forEach"
import tbot_config from "secret/tbot.json"


export default {
        name: "App",
        components: { tg_ripper, bot, logger },
        data () {
                return {
                        bot_commands: ["hi", "start", "echo"],
                        post_interval: 15 * 60 * 1000,
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
          window.postbot = this
        },
        methods: {
                log ( text_message, type ) {
                        this.$refs.logger.log(text_message, type)
                },
                on_bot_command ( payload ) {
                        console.log(payload)
                },
                on_ripper_update ( payload ) {
                        console.log(payload)

                        forEach(payload.updates, ( data )=>{
                                let media_group = []
                                forEach(data.post_data.images, (image_data)=>{
                                       media_group.push({
                                               type: "photo",
                                               url: image_data.file_name
                                       })
                                })
                                
                                if (media_group.length === 1) {
                                        this.promise_queue.add((r)=>{
                                                this.log(`task: image (${payload.chat_caption}, ${media_group[0].url})`, "task")
                                                setTimeout(()=>{
                                                        this.$refs.bot.send_image(tbot_config.press.channel_id, media_group[0].url)
                                                        r()
                                                }, this.post_interval)
                                        });
                                } else {
                                        this.promise_queue.add((r)=>{
                                                this.log(`task: mediagroup (${payload.chat_caption})`, "task")
                                                
                                                setTimeout(()=>{
                                                        this.$refs.bot.send_media_group(tbot_config.press.channel_id, media_group)
                                                        r()
                                                }, this.post_interval)
                                        })
                                }

                                
                        })

                }
        }
}

</script>
<style lang="less">
        .postbot {
                display: flex;
                flex-direction: column;
                position: absolute;
                left: 0;
                top: 0;
                overflow: hidden;
                padding: 8px;

                
                
                .postbot_section {
                        display: flex;
                        flex-direction: column;
                        height: 50%;
                        width: 100%;
                        overflow: hidden;

                        .header {
                                width: 100%;
                                height: 32px;
                        }
                        
                        .programed_bot {
                                height: calc(100% - 32px);
                        }

                        > .logger {
                                height: 100%;
                                width: 100%;
                                border: 2px solid #353535;
                                padding: 8px;
                                margin: 8px 0;

                                .line {
                                        &[data-type="message"] {
                                                color: #ff6a9a;
                                        }

                                        &[data-type="task"] {
                                                color: #6ae3ff;
                                        }
                                }
                        }
                        
                }

                .modules {
                        height: 50%;
                        width: 100%;
                        display: flex;
                        flex-direction: row;

                        > div {
                                width: 50%;
                                height: 100%;
                                margin-right: 8px;

                                &:last-child {
                                        margin-right: 0;
                                }
                        }
                }
        }
</style>