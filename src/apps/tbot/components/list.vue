<template>
        <div 
            class="list"
            ref="list"
            v-bind:style="{ flexDirection: reverse ? `column-reverse` : `column` }"
        >
          <transition-group name="list" tag="p">
            <slot></slot>
          
          </transition-group>
        </div>
</template>

<script lang="js">

import Vue from "vue"
export default Vue.extend({
        name: "list",
        mixins: [],
        components: {},
        props: [ "reverse" ],
        data () {
          return {

          }
        },
        watch: {},
        computed: {},
        mounted () {},
        destroyed () {},
        methods: {
          scroll_down () {
            this.$refs.list.scrollTop = this.$refs.list.scrollHeight
          }
        }
})
</script>
<style lang="less">
  .list {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      padding-bottom: 64px;

      .item {
        color: #dc4653;
        background: linear-gradient(90deg, hsl(28, 100%, 82%) 0%, #ffc3c3 100%);
        border: 0px solid black;
        border-radius: 6px;
        margin: 4px 0;
        padding: 4px 8px;
        font-family: 'Ubuntu Mono', monospace;
      }

      .list-item {
      }
      .list-enter-active, .list-leave-active {
        transition: all 1s;
      }
      .list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
        opacity: 0;
        transform: translateY(150px);
      }
  }
</style>