import tree_iterator from 'tree-iterate'
import forEach from "lodash/forEach"

export default {
        state: {
                app_name: process.env.APP_NAME,
                apps_list: [],
                apps_list_updating: false
        },
        actions: {
                update_apps_list ( $store ) {
                        let tree = directory_tree(path.resolve(process.CWD, "src/apps"))
                        console.log(tree)

                        function contains_file(name, dir_data){
                                let result = false 

                                forEach(dir_data.children, (child)=>{
                                        if (child.name === name) result = true
                                })

                                return result
                        }

                        let projects = []

                        tree_iterator(tree, (node_data)=>{
                                if (node_data.type === "directory" && contains_file("manifest.json", node_data)){
                                        let manifest = JSON.parse(fs.readFileSync(path.resolve(node_data.path, "manifest.json"), "utf-8"))
                                        projects.push({
                                                path: node_data.path,
                                                name: node_data.name,
                                                size: node_data.size,
                                                manifest
                                        })
                                }
                        })

                        $store.state.apps_list = projects
                } 
        }
        
}