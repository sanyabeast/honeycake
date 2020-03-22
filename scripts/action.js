
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
const package_object = require(path.resolve(process.cwd(), "package.json"))

// console.log(webpack_config.devServer.host)
console.log("ACTION:".yellow, JSON.stringify(args).cyan);

run_action(args)

function match_any_regexp ( string, regexps ) {
        let result = false

        forEach(regexps, (r, i)=>{
                if (string.match(new RegExp(r, "gm"))) {
                        result = true
                }
        })

        return result
}

function run_term_process ( command, options ) {
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

function remove_dir ( dir, force ) {
        let result = false
        if (match_any_regexp(dir, package_object.protected_projects) && !force){
                console.log("ACTION: ".yellow, `removing default project permitted - ${dir}`)
                result = true
        } else {
                rmdir(dir)
        }
        
        return result
}

function run_action(args) {
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

        if (name) {
                new_project_path = path.normalize(path.join(CWD, `src/apps/${ name }`));
        }

        if (project_id) {
                existing_project_path = path.normalize(path.join(CWD, `src/apps/${ project_id }`));
        }

        console.log(`ACTION: `.yellow, `${action}`)

        

        switch ( action ) {
                case "build":
                        if ( fs.existsSync(existing_project_path) ) {
                                command = `webpack --config config/webpack.config.js  --env.NODE_ENV=${node_env} --env.${node_env} --env.APP_NAME=${ project_id }`

                        } else {
                                console.log(`project "${ project_id } does not exist"`.yellow)
                        }
                break;
                case "start":
                        if ( fs.existsSync(existing_project_path) ) {
                                command = `webpack-dev-server --config config/webpack.config.js --env.${node_env}=development --env.${node_env} --env.APP_NAME=${ project_id }`

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
                                existing_project_path = path.normalize(path.join(CWD, `src/apps/${ project_id }`));
                        }

                        if (fs.existsSync(new_project_path)){
                                is_protected = remove_dir(new_project_path, force);
                        }
                        
                        if (!is_protected || (is_protected && force)){
                                mkdirp.sync(new_project_path);
                                console.log("ACTION: ".yellow, `copying content from ${existing_project_path}
                        
to
${new_project_path}`);
                        copydir(existing_project_path, new_project_path, {});
                        }
                break;
                case "delete":
                        caption = "ACTION"
                        color = "yellow"
                        command = null
                        
                        if (!remove_dir(existing_project_path, force)){
                                console.log("ACTION: ".yellow, `removed directory - ${existing_project_path}`)
                        }
                break;
                default:
        }
                
        if (command !== null) {
                try {
                        console.log("ACTION: ".yellow, `running command 
                        ${command}
                        ...`)

                        run_term_process(command, {
                                caption,
                                color
                        })
                } catch ( err ) {
                        console.log("ACTION ERROR: ".yellow, err)
                }

        }

        
        if ( use_electron ) {
                caption = "ELECTRON"
                color = "blue"
                
                console.log("ACTION: ".yellow, "using electron...")

                run_term_process(`npm run electron url=http://${webpack_config.devServer.host}:${webpack_config.devServer.port}`, {
                        caption,
                        color
                })
        }
        //

        
        
}

module.exports = run_action