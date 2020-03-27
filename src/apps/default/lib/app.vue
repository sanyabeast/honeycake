<template>
        <div class="app" v-html="$store.state.core.app_manifest.title"></div>
</template>
<script lang="js">

console.log("bar")
export default {
        name: "App"
}

</script>
<style lang="less">

</style>