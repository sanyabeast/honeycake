<template>
        <div class="logger">
          
          <div class="log flex-column-reverse">
              <div
                class="line"
                v-for="(item, index) in state.log"
                v-bind:data-type="item.type"
                :key="index">

                <div class="text_content" v-html="item.text_content"/>

              </div>
            </div>
        </div>
</template>

<script lang="js">

import Vue from "vue"
export default Vue.extend({
        name: "logger",
        mixins: [],
        components: {},
        props: {},
        data () {
          return {
            state: {
              log: []
            }
          }
        },
        watch: {},
        computed: {},
        mounted () {},
        destroyed () {},
        methods: {
          log ( text_message, type ) {
            this.state.log.push({
              type,
              text_content: text_message
            })

            this.state.log = this.state.log.slice(Math.max(this.state.log.length - 20, 0), this.state.log.length)


          },
        }
})
</script>
<style lang="less">
  .logger {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    .log {
        font-size: 12px;
        font-weight: 300;
        font-family: monospace;
        width: 100%;
        height: auto;
      }

      .line {
        &.red {
          color: #ff6a6a;
        }

        &.purple {
          color: #e16aff;
        }

        &.blue {
          color: #6aa6ff;
        }

        &.cyan {
          color: #6affba;
        }

         &.yellow {
          color: #e1ff6a;
        }

        &.amber {
          color: #ffb66a;
        }
      }
  }
</style>