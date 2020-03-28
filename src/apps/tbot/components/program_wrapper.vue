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
            console.log(module_nodes)

            return module_nodes.length
          }
        },
        mounted () {},
        destroyed () {},
        methods: {}
})
</script>
<style lang="less">
  .program_wrapper {
      display: flex;
      background: #00000029 ;
      padding: 8px;
      justify-content: stretch;
      align-items: stretch;
      border-radius: 24px;
      width: 100%;
      height: 100%;
      

      .container {
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #7a79b5;

        .header {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #dad0d0;
          height: 24px;
          border-bottom: 2px dotted #b4b4b4;
          color: #3c3c3c;
          font-size: 14px;
     

          .text {
            font-family: 'Biryani', sans-serif;
          }
        }

        .content {
          height: calc(100% - 24px);
          overflow: auto;
          display: grid;
          grid-gap: 16px;
          padding: 16px 8px;
        }
      }

      .program_wrapper {
        display: flex;
        background: #ffbfbf;
        padding: 8px;
        justify-content: stretch;
        align-items: stretch;
        border-radius: 24px;

        &:nth-child(2n){
          background-color: #a5c9ff;
        }

        &:nth-child(3n){
          background-color: #74ff47;
        }

        &:nth-child(4n){
          background-color: #ffe047;
        }

        &:nth-child(5n){
          background-color: #ffa981;
        }
      
        .program_wrapper .container {
          background-color: #d6e7db;
        }

        .program_wrapper {
           &:nth-child(5n){
            background-color: #a5c9ff;
          }

          &:nth-child(4n){
            background-color: #74ff47;
          }

          &:nth-child(3n){
            background-color: #ffe047;
          }

          &:nth-child(2n){
            background-color: #ffa981;
          }
        
        }

        .container {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #ffe1d7;

          .header {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #dad0d0;
            height: 24px;
            border-bottom: 2px dotted #b4b4b4;
            color: #3c3c3c;
            font-size: 14px;
      

            .text {
              font-family: 'Biryani', sans-serif;
            }
          }

          .content {
            height: calc(100% - 24px);
            overflow: auto;
          }
        }
      }

  }
</style>