import  tbot_config from "secret/tbot.json"

export default {
        state: {
                app_name: process.env.APP_NAME
        },
        getters: {
                tbot_config () {
                        return tbot_config
                }
        }
}