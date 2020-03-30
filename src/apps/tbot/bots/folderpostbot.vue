<template>
    <program_wrapper
        title="Folder-Postbot"
        class="folderpostbot"
        grid_template_prop="1fr / 1fr 1fr"
    >
        <logger
                ref="logger"
        />
        <postbot
                ref="postbot"
                :bot_config="bot_config"
                schedule_file_path="rpb.tasks.json"
        />
    </program_wrapper>
</template>

<script lang="js">

import Vue from "vue"

import logger from "apps/tbot/components/logger"
import postbot from "apps/tbot/bots/postbot"
import program_wrapper from "apps/tbot/components/program_wrapper"
import forEach from "lodash/forEach"

export default Vue.extend({
        name: "folderpostbot",
        mixins: [],
        components: { program_wrapper, logger, postbot },
        props: [ "bot_config", "database_path" ],
        data () {
          return {
              posts: {}
          }
        },
        watch: {},
        computed: {},
        mounted () {
            window.fpb = this
            this.connect_db( this.database_path )
        },
        destroyed () {},
        methods: {
            connect_db( path ) {
                let tree = directory_tree( this.database_path )
                if ( !tree ) {
                    window.mkdirp.sync( this.database_path )
                    let tree = directory_tree( this.database_path )
                }

                forEach( tree.children, ( child )=>{
                    if ( child.type === "directory" ) {
                        if ( child.name === "posts" ) {
                            this.load_posts_data( child )
                        }

                    }
                } )

            },

            load_posts_data ( dir_data ) {
                forEach( dir_data.children, ( post_data )=> this.load_post( post_data ) )
            },
            load_post( data ) {
                let post_data = {}
                let photos = null
                let name = data.name
                let type = null
                let text = null

                forEach( data.children, ( file_data )=>{

                    if ( file_data.name === "posted" ) {
                        post_data.posted = true
                    }

                    if ( file_data.extension === ".tag" ) {
                        let tags = file_data.name.replace(".tag", "").split( " " )
                        post_data.tags = tags
                    }

                    if ( file_data.extension.match(/.(jpg)$/) ) {
                        photos = photos || []
                        photos.push({
                            path: file_data.path,
                            name: file_data.name
                        })
                    }

                    if ( file_data.extension.match(/.(txt)$/) ) {
                        text = file_data.path
                    }

                    if ( photos !== null ) {
                        if ( photos.length === 1 ) {
                            type = "photo"
                            post_data.photo = photos[0]
                        } else if ( photos.length > 1 ) {
                            type = "group"
                            post_data.photos = photos
                        }
                    }
                    if ( text !== null ) type = "text"

                    post_data.type = type
                    post_data.name = name
                } )

                this.posts[ name ] = post_data
            }
        }
})
</script>
<style lang="less">
  .folderpostbot {
    
  }
</style>