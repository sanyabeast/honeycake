<template>
        <div class="twitter">
          
        </div>
</template>

<script lang="js">

import Vue from "vue"

export default Vue.extend({
        name: "twitter",
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
          this.$store.dispatch("update_twitter_data")
        },
        destroyed () {}
})
</script>
<style lang="less">
  .twitter {
    
  }
</style>