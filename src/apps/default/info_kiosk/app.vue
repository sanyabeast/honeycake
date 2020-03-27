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
        @import (css) url('https://fonts.googleapis.com/css?family=IBM+Plex+Sans:400,500,600,700&display=swap&subset=cyrillic');
        
        .app {
                font-family: 'IBM Plex Sans', sans-serif;
                font-weight: 700;
                color: #eee;
                background: #111;
                width: 100%;
                height: 100%;
                position: relative;

                .anim_scale_we {
                        animation: scale_we 1s ease;
                }

                @keyframes scale_we {
                        0% {
                                transform: scale(0.0001);
                        }

                        1% {
                                transform: scale(0.0001);
                        }
                }
        }
</style>