<template>
        <div class="app">
                <weather/>
                <twitter/>
        </div>
</template>

<script lang="js">

import weather from "./components/weather"
import twitter from "./components/twitter"

import Vue from "vue"
export default Vue.extend({
        name: "app",
        mixins: [],
        components: { weather, twitter },
        props: {},
        data () {
          return {

          }
        },
        watch: {},
        computed: {},
        mounted () {},
        destroyed () {}
})
</script>
<style lang="less">
  .app {
    
  }
</style>