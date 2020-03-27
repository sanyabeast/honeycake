<template>
        <div>
                <div class="apps_list">
                        <div
                                v-for="(item, index) in $store.state.apps_list"
                                :key="index"
                                v-html="item.manifest.title"/>
                </div>
        </div>
</template>
<script lang="js">

console.log("bar")
export default {
        name: "App",
        computed: {
               
        },
        mounted () {
                this.$store.dispatch("update_apps_list")
        }
}

</script>
<style lang="less">

</style>