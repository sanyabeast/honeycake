<template>
        <div class="tg_ripper">

        </div>
</template>

<script lang="js">

import Vue from "vue"
export default Vue.extend({
        name: "tg_ripper",
        mixins: [],
        components: {},
        props: {},
        data () {
          return {
            browser_window: null
          }
        },
        watch: {},
        computed: {

        },
        mounted () {
          window.tg_ripper = this
          
          let browser_window = window.electron_window_manager.get_window_match_url("https://webogram.ru/#/im")

          if (!browser_window) {
            browser_window = window.electron_window_manager.create_window({
              id: "tg_ripper",
              url: "https://webogram.ru/#/im",
              width: 800,
              extra_preload: "src/apps/tbot/extra/electron_tg_ripper.js"
            })
          }

          this.browser_window = browser_window

          ipc.on(`window_${ browser_window.id }.response`, this.on_webogram_response)
          ipc.on(`window_${ browser_window.id }.request`, this.on_webogram_response)
        },
        destroyed () {},
        methods: {
          on_webogram_response ( event, data ) {
            console.log(data)
          },
          on_webogram_request ( event, data ) {
            console.log(data)
          },
          send_data ( event_type, data ) {
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
  .tg_ripper {
    // position: absolute;
    left: 0;
    top: 0;
    width: 1000px;
      height: 1000px;
      zoom: 0.5;
    iframe {
      border: 2px solid #353535;
      width: 100%;
      height: 100%;
      transform-origin: top left;
    }
  }
</style>