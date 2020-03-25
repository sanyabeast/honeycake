import  telegram_config from "secret/telegram.json"

export default {
        state: {
                app_name: process.env.APP_NAME
        },
        getters: {
                telegram_config () {
                        return telegram_config
                }
        }
}