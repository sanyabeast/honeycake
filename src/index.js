let basic_styles = require("./style.less")

import Vue from "vue"
import Vuex from "vuex"
import createPersistedState from "vuex-persistedstate"
import generic_plugin from "./plugins/generic.plugin.js"

console.log(Vuex, generic_plugin)

Vue.use(Vuex)
Vue.use(generic_plugin)

console.log(window.app_config)

let app_component = require(`apps/${ process.env.APP_NAME }/app`).default
let core_store_config = require("./store/index").default
let store = require(`apps/${ process.env.APP_NAME }/store/index`).default
let app = new Vue({
  components: { app_component },
  template: "<div class='root'<app_component ref='app'/></div>",
  el: "#app",
  store: new Vuex.Store({
    ...core_store_config,
    ...store,
    plugins: [createPersistedState()]
  })
})

if ( !process.env.production ) {
  (window).app = app;
  (window).store = app.$store
}
