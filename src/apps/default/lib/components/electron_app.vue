<template>
        <div class="electron_app">hello</div>
</template>

<script lang="js">

import Vue from "vue"
export default Vue.extend({
        name: "electron_app",
        mixins: [],
        components: {},
        props: [
          "id",
          "url",
          "extra_preload",
          "width",
          "height",
          "use_default_preload",
          "no_restore"
        ],
        data () {
          return {
            browser_window: null
          }
        },
        watch: {},
        computed: {},
        mounted () {
          let browser_window;

            if ( this.no_restore !== true ) {
              browser_window =  window.electron_window_manager.get_window_match_url( this.url, true)
            }

          if (!browser_window) {
            browser_window = window.electron_window_manager.create_window({
              url: this.url,
              width: this.width,
              height: this.height,
              extra_preload: this.extra_preload,
              use_default_preload: this.use_default_preload,
            })
          }

          this.browser_window = browser_window

          ipc.on(`window_${ browser_window.id }.response`, this.on_window_response)
          ipc.on(`window_${ browser_window.id }.request`, this.on_window_request)
          ipc.on(`window_${ browser_window.id }.message`, this.on_window_message)

          this.browser_window = browser_window
        },
        destroyed () {},
        methods: {
          on_window_response ( event, payload ) {
            this.$emit( "response", {
              event,
              payload
            } )
          },
          on_window_request ( event, payload ) {
            this.$emit("request", {
              event,
              payload
            } )
          },
          on_window_message ( event, payload ) {
            this.$emit("message", {
              event,
              payload
            } )
          },
          send_data( event_type, data ){
            if ( this.browser_window ) {
              this.browser_window.send( event_type, {
                source_id: remote.getCurrentWindow().id,
                data,
              } )
            }
          }
        }
})
</script>
<style lang="less">
  .electron_app {
    
  }
</style>