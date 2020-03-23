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
                app_name: process.env.APP_NAME
        },
        actions: {
                update_weather_data () {

                        axios.request({
                                method: "post",
                                url: "https://pogoda.org.ua/ajax/my_cities",
                                data: build_form({
                                        cities: '{"stored":[{"domain":"ua","city_id":"908"}]}'
                                }),
                        })
                        .then(function (response) {
                                console.log(response);
                        })
                },
                update_twitter_data () {
                        
                }
        }
}