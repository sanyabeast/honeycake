<template>
  <program_wrapper
    title="Logger"
    class="logger"

  >
    <list
      :reverse="true"
    >
      <div
        class="item"
        v-for="(item, index) in state.log"
        v-bind:data-type="item.type"
        :key="index">

        <div class="text_content" v-html="item.text_content"/>

      </div>
    </list>
  </program_wrapper>
       
</template>

<script lang="js">

import program_wrapper from "apps/tbot/components/program_wrapper"
import list from "apps/tbot/components/list"

import Vue from "vue"
export default Vue.extend({
        name: "logger",
        mixins: [],
        components: { program_wrapper, list },
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

            this.state.log = this.state.log.slice(Math.max(this.state.log.length - 100, 0), this.state.log.length)


          },
        }
})
</script>
<style lang="less">
  .logger {

    .list {
       
      .item {
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
}
</style>