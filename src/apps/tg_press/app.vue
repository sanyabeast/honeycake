<template>
        <div class="app" v-html="$store.state.core.app_manifest.title"></div>
</template>
<script lang="js">

import  telegram_config from "secret/telegram.json"
import TDClient from "tdweb"

export default {
        name: "App",
        mounted () {
                console.log(TDClient)
                // let client = new TDClient.init({})
        }
}

</script>
<style lang="less">
        .app {

}
</style>