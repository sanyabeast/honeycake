const CWD = process.cwd()
const child_process = require("child_process")
const colors = require("colors")
const args = require("args-parser")(process.argv)
const defaultTo = require("lodash/defaultTo")
const fs = require("fs")
const path = require("path")
const webpack_config = require(path.resolve(process.cwd(), "./config/webpack.config.js"))(process.env)
const mkdirp = require('mkdirp')
const copydir = require("copy-dir");
const rmdir = require('rmdir');
const forEach = require("lodash/forEach");
const merge = require("lodash/merge");
const keys = require("lodash/keys")
const package_object = require(path.resolve(process.cwd(), "package.json"))

let json_cache = {

}

class ActionManager {
        match_any_regexp ( string, regexps ) {
                let result = false
        
                forEach(regexps, (r, i)=>{
                        if (string.match(new RegExp(r, "gm"))) {
                                result = true
                        }
                })
        
                return result
        }
        
        run_term_process ( command, options ) {
                let c = child_process.exec(
                        command,
                        { cwd: CWD },
                        (error,stdout,stderr)=>{
                                if (error){
                                        console.log(`${options.caption} ERROR: `[options.color], error)
                                }
                        }
                )
        
                c.stdout.on('data', function(data) {
                        console.log(`${options.caption}: `[options.color], data.toString().trim()); 
                });
        }
        
        remove_dir ( dir, force ) {
                let result = false
                if (this.match_any_regexp(dir, package_object.protected_projects) && !force){
                        console.log("ACTION: ".yellow, `removing default project permitted - ${dir}`)
                        result = true
                } else {
                        rmdir(dir)
                }
        
                return result
        }

        resolve_app_path ( app_name ) {
                return path.normalize(path.join(CWD, `src/apps/${ app_name }`))
        }
        
        run_action(args) {
                let project_id = args.p
                let use_electron = args.electron
                let action = args.a
                let name = args.n
                let caption = "WEBPACK"
                let color = "red"
                let node_env = args.nenv === "prod" ? "production" : "development"
                let new_project_path = null
                let existing_project_path = null
                let command = null
                let force = args.force
                let target = "web"
                let app_manifest = null

                
        
                if (name) {
                        new_project_path = this.resolve_app_path(name)
                }
        
                if (project_id) {
                        existing_project_path = this.resolve_app_path(project_id);
                        let app_manifest = this.read_app_manifest( project_id );

                        if ( typeof app_manifest.target === "string" ) {
                                target = process.env.WEBPACK_TARGET = app_manifest.target
                        }
                }
        
                console.log(`ACTION: `.yellow, `${action}`)
        
                process.env.CWD = process.cwd();
                process.env.NODE_ENV = node_env
                process.env.production = node_env === "production"
                process.env.APP_NAME = project_id
        
                if (action !== "none" ) {
                        switch ( action ) {
                                case "build":
                                        if ( fs.existsSync(existing_project_path) ) {
                                                command = `webpack --config config/webpack.config.js  --env.NODE_ENV=${node_env} --env.${node_env} --env.APP_NAME=${ project_id } --env.WEBPACK_TARGET=${ target }`
                                        } else {
                                                console.log(`project "${ project_id } does not exist"`.yellow)
                                        }
                                break;
                                case "start":
                                        if ( fs.existsSync(existing_project_path) ) {
                                                command = `webpack-dev-server --config config/webpack.config.js --env.NODE_ENV=${node_env} --env.${node_env} --env.APP_NAME=${ project_id }  --env.WEBPACK_TARGET=${ target }`
                
                                        } else {
                                                console.log(`project "${ project_id } does not exist"`.yellow)
                                        }
                                break;
                                case "create":
                                        caption = "ACTION";
                                        color = "yellow";
                                        command = null ;             
                                        let is_protected = false;                          
                                        console.log(new_project_path, existing_project_path);
                
                                        if (!project_id){
                                                project_id = "default/hello"
                                                console.log("ACTION: ".yellow, "source project was not provided, fallback to 'default/hello'");
                                                existing_project_path = this.resolve_app_path(project_id)
                                        }
                
                                        if (fs.existsSync(new_project_path)){
                                                is_protected = this.remove_dir(new_project_path, force);
                                        }
                                        
                                        if (!is_protected || (is_protected && force)){
                                                mkdirp.sync(new_project_path);
                                                console.log("ACTION: ".yellow, `copying content from ${existing_project_path}
                                        
        to
        ${new_project_path}`);
                                                copydir.sync(existing_project_path, new_project_path, {});
                                                this.push_app_manifest( name, {
                                                        title: this.capitalize(name)
                                                } )
                                        }
                                break;
                                case "delete":
                                        caption = "ACTION"
                                        color = "yellow"
                                        command = null
                                        
                                        if (!this.remove_dir(existing_project_path, force)){
                                                console.log("ACTION: ".yellow, `removed directory - ${existing_project_path}`)
                                        }
                                break;
                                default:
                        }
                }
                        
                if (command !== null) {
                        try {
                                console.log("ACTION: ".yellow, `running command 
                                ${command}
                                ...`)
        
                                this.run_term_process(command, {
                                        caption,
                                        color
                                })
                        } catch ( err ) {
                                console.log("ACTION ERROR: ".yellow, err)
                        }
        
                } else {
                        console.log("ACTION: ".yellow, "skipping command...")
                }
        
                
                if ( use_electron ) {
                        caption = "ELECTRON"
                        color = "blue"

                        if ( fs.existsSync(path.join(CWD, `src/apps/${ project_id }/electron.js`)) ) {
                                process.env.APP_ELECTRON_PRELOAD = path.join(CWD, `src/apps/${ project_id }/electron.js`)
                        }
                        
                        console.log("ACTION: ".yellow, "using electron...")
        
                        this.run_term_process(`npm run electron url=http://${webpack_config.devServer.host}:${webpack_config.devServer.port}`, {
                                caption,
                                color
                        })
                }
                //
        
                
                
        }

        push_app_manifest( app_name, data ) {
                try {

                        let app_manifest = this.read_app_manifest(app_name)
                        app_manifest = merge(app_manifest, data)
                        this.write_app_manifest( app_name, app_manifest )

                } catch ( err ) { console.log("ACTION ERROR: ".yellow, err) }
        }

        read_app_manifest ( app_name ) {
                try {
                        return JSON.parse(fs.readFileSync(`${ this.resolve_app_path(app_name) }/manifest.json`, "utf-8"))
                } catch ( err ) { console.log("ACTION ERROR: ".yellow, err) }
        }

        write_app_manifest ( app_name, app_manifest ) {
                try {
                        fs.writeFileSync(`${ this.resolve_app_path(app_name) }/manifest.json`, JSON.stringify(app_manifest, null, "\t"), "utf-8")
                }  catch ( err ) { console.log("ACTION ERROR: ".yellow, err) }
        }

        capitalize ( input ) {
                return input.replace(/_/gm, " ").replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
        }

        

        read_json ( rel_path ) {
                let abs_path = path.join(CWD, `/${rel_path}`)

                if ( json_cache[rel_path] !== undefined ) {
                        return json_cache[rel_path]
                }

                let data = {}
                if ( fs.existsSync(abs_path) ) {
                        data = JSON.parse(fs.readFileSync(abs_path, "utf-8"))
                } 

                json_cache[rel_path] = data

                return data
        }

        write_json ( rel_path, data ) {
                let abs_path = path.join(CWD, `/${rel_path}`)
                json_cache[rel_path] = data
                console.log(abs_path, data)
                fs.writeFileSync( abs_path, JSON.stringify(data, null, "\t"), "utf-8" )
                return data
        }

}

if (keys(args).length > 0 && typeof args.a === "string") {
        (new ActionManager()).run_action(args)
}


module.exports = {
        ActionManager
}