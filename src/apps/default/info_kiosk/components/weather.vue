<template>
        <div class="weather">
          <iframe src="https://tweetdeck.twitter.com/"/>
        </div>
</template>

<script lang="js">

import Vue from "vue"

export default Vue.extend({
        name: "weather",
        mixins: [],
        components: {},
        props: {},
        data () {
          return {

          }
        },
        watch: {},
        computed: {},
        mounted () {
          this.$store.dispatch("update_weather_data")
        },
        destroyed () {}
})
</script>
<style lang="less">
  .weather {
    
  }
</style>