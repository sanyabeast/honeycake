<template>
        <div class="program_wrapper">
            <div class="container">
              <div class="header">
                <div class="text" v-html="title"/>
              </div>
              <div 
                class="content" 
                ref="content"
                v-bind:style="{
                  gridTemplate: grid_template
                }"
              >
                <slot></slot>
              </div>
            </div>
        </div>
</template>

<script lang="js">

import Vue from "vue"
import { TweenMax } from "gsap"
import debounce from "lodash/debounce"

export default Vue.extend({
        name: "program_wrapper",
        mixins: [],
        components: {},
        props: ["title", "grid_template_prop"],
        data () {
          return {

          }
        },
        watch: {},
        computed: {
          grid_template() {
            if (this.grid_template_prop) return this.grid_template_prop
            let modules_count = this.modules_count
            
            switch ( modules_count ) {
              case 1: 
                return `1fr / 1fr`
              case 2: 
                return `1fr/ 1fr`
            } 
          },
          modules_count () {
            if ( !this.$el ) {
              return 1
            }

            let module_nodes = this.$el.querySelectorAll(".content > div")

            return module_nodes.length
          }
        },
        mounted () {
          this.scroll_down = debounce(()=>{
            TweenMax.fromTo( this.$refs.content, 0.15, {
              scrollTop: this.$refs.content.scrollTop,
            }, {
              scrollTop: this.$refs.content.scrollHeight - this.$refs.content.getBoundingClientRect().height
            } )
          }, 250)
        },
        destroyed () {},
        methods: {
          scroll_down () {
            
          }
        }
})
</script>
<style lang="less">
  .program_wrapper {
      display: flex;
      background: #484848;
      background: linear-gradient(90deg, #629867 0%, #7bb8bb 100%);
      padding: 2px;
      justify-content: stretch;
      align-items: stretch;
      border-radius: 6px;
      width: 100%;
      height: 100%;
      overflow: hidden;
      box-shadow: 0px 4px 32px -14px #2b1900;

      .container {
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #757575;
        background: linear-gradient(90deg, hsl(210, 23%, 47%) 0%, #967193 100%);
        overflow: hidden;

        .header {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #e8e8e8;
          background: linear-gradient(90deg, rgb(215, 235, 255) 0%, rgb(255, 237, 244) 100%);
          height: 36px;
          border-bottom: 1px solid #c7c7c7;
          color: #5f5f5f;
          font-size: 16px;

          .text {
            font-family: 'Biryani', sans-serif;
          }
        }

        .content {
          height: calc(100% - 36px);
          overflow: auto;
          display: grid;
          grid-gap: 16px;
          padding: 16px 8px;
        }
      }

      .program_wrapper {
        .header {
          background: #d8d8d8;
          border-color: #969696;
          background: linear-gradient(90deg, #dcd0d0 0%, #e3d9df 100%);
          color: #404040;
          height: 32px;
          font-size: 14px;
        }

        .container {
          background: #efefef;
        }

        .content {
          height: calc(100% - 32px);
        }
      }

      .program_wrapper .program_wrapper  {
        .header {
          background: #bdbdbd;
          border-color: #949494;
          background: linear-gradient(90deg, #dcd0d0 0%, #e3d9df 100%);
          color: #191919;
          height: 28px;
        }

        .container {
          background: #e0e0e0;
          background: linear-gradient(90deg, hsl(147, 100%, 94%) 0%, #fdfff2 100%);
        }

        .content {
          height: calc(100% - 28px);
        }
      }
      
      .program_wrapper .program_wrapper .program_wrapper  {
        .header {
          background: #949494;
          border-color: #636363;
          background: linear-gradient(90deg, #7b6565 0%, #99a5af 100%);
          color: #ffffff;
          height: 24px;
          font-size: 12px;
        }

        .container {
          background: white;
          background: linear-gradient(90deg, hsl(0, 0%, 100%) 0%, #ffe8f1 100%);
        }
        
        .content {
          height: calc(100% - 24px);
        }
      }

  }
</style>