const axios = require('axios').default;

function build_form(data) {
        const form = new FormData()
        for ( const key in data ) {
                form.append(key, data[key]);
        }
        return form
}

export default {
        state: {
                app_name: process.env.APP_NAME,
                weather_data: {
                        current: null,
                        forecast: null
                }
        },
        actions: {
                update_weather_data ( store ) {
                        let data = {
                                current: null,
                                forecast: null
                        }

                        axios.request({
                                method: "post",
                                url: "https://api.openweathermap.org/data/2.5/weather",
                                params: {
                                        q: "kiev",
                                        appid: "d4acf7aa6cf7f34a2c10ade7cb03940a"
                                }
                        })
                        .then(function (response) {
                                data.current = response.data
                                store.state.weather_data = data
                        })

                        axios.request({
                                method: "post",
                                url: "https://api.openweathermap.org/data/2.5/weather",
                                params: {
                                        q: "kiev",
                                        appid: "d4acf7aa6cf7f34a2c10ade7cb03940a"
                                }
                        })
                        .then(function (response) {
                                data.forecast = response.data
                                store.state.weather_data = data
                        })
                },
                update_twitter_data () {
                        
                }
        }
}