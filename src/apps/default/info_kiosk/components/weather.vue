<template>
        <div class="weather"> 
          <div v-if="weather_data.current" class="current_temp flex-row" >
            <div class="sky">
              <div class="icon"></div>
            </div>
            <div class="data flex-column">
              <div class="top_line flex-row">
                <div 
                  class="temp" 
                  v-html="`${ kelvin_to_celsius(weather_data.current.main.temp) }°`"/>
                <div 
                  class="feels_like" 
                  v-html="`(${ kelvin_to_celsius(weather_data.current.main.feels_like) }°)`"/>  
              </div>
              <div 
                class="range" >
                <span v-html="`${ kelvin_to_celsius(weather_data.current.main.temp_min) }°`"/>
                -
                <span v-html="`${ kelvin_to_celsius(weather_data.current.main.temp_max) }°`"/>
              </div>
            </div>
          </div>
        </div>
</template>

<script lang="js">

import Vue from "vue"
import { mapState } from "vuex"

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
        computed: {
          ...mapState({
            weather_data: s=>s.weather_data
          })
        },
        mounted () {
          this.$store.dispatch("update_weather_data")
        },
        destroyed () {},
        methods: {
          kelvin_to_celsius ( kelvin ) {
            return (kelvin - 273.15).toFixed(0)
          }
        }
})
</script>
<style lang="less">
  .weather {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #111;
    padding: 32px;

    .sky {
      .icon {
        width: 250px;
        height: 250px;
        margin-top: 12px;
        background-size: calc(250px*5);
        background-image: url(~res/default/info_kiosk/pics/free-weather-icons-png-1-transparent.png)
      }
    }

    .current_temp {
      .top_line {
        align-items: flex-end;

        .temp {
          font-size: 200px;
        }

        .feels_like {
          font-size: 72px;
          color: #5b5b5b;
          margin-bottom: 48px;
          margin-left: 8px;
        }
      }

      .range {
        color: #5b5b5b;
        font-size: 40px;
        border-top: 4px solid #313131;

        span:first-child {
          color: #3c7a81;
        }

        span:last-child {
          color: #813c3c;
        }
      }

    }

    
    
  }
</style>