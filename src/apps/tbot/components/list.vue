<template>
        <div 
            class="list"
            v-bind:style="{ flexDirection: reverse ? `flex-column-reverse` : `flex-column` }"
        >
            <slot></slot>
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
        methods: {}
})
</script>
<style lang="less">
  .list {
      display: flex;
      flex-direction: column;
      align-items: stretch;

      .item {
        background: white;
        border: 0px solid black;
        border-radius: 6px;
        margin: 4px 0;
        padding: 4px;
        color: #7a7a7a;
      }
  }
</style>