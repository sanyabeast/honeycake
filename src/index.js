let basic_styles = require("./style.less")

import Vue from "vue"
import Vuex from "vuex"
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import createPersistedState from "vuex-persistedstate"

Vue.use(Vuex)
Vue.use(Vuetify)

let app_component = require(`./apps/${ process.env.APP_NAME }/app`).default
let store = require(`./apps/${ process.env.APP_NAME }/store/index`).default

let app = new Vue({
        components: { app_component },
        template: "<div class='root'<app_component ref='app'/></div>",
        el: "#app",
        vuetify: new Vuetify({

        }),     
        store: new Vuex.Store({
                ...store,
                plugins: [createPersistedState()]
        })
})

if ( !process.env.production ) {
        (window).app = app;
        (window).store = app.$store
}
