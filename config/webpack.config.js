

const CWD = process.cwd()
/*generic tools*/
const colors = require("colors")
const path = require('path')
const webpack = require("webpack")
/*plugins*/
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
/*subconfigs*/
let html_plugin_config = require("./html_plugin.config")
let module_config = require("./module.config")
let define_config = require("./define.config")
let provide_config = require("./provide.config")
let devserver_config = require("./devserver.config")

console.log(`process.cwd: ${ process.cwd() } `.yellow);
console.log(`__dirname: ${ __dirname } `.yellow);

module.exports = env => {
	return {
		devtool: env.production ? "#eval-source-map" : false,
		entry: './src/index.js',
			mode: env.production === true ? "production" : "development",
			devServer: devserver_config(),
		output: {
			filename: 'bundle.js',
			path: path.resolve(CWD, `dist/${ (env.APP_NAME||"").replace(/\//gm, "_") }/${ env.production ? "prod" : "dev" }`),
		},
		plugins: [
			new webpack.ProgressPlugin((percentage, message, ...args)=>{
				console.log(`webpack: ${message}`.cyan, percentage.toString().green)
			}),
			new webpack.DefinePlugin(define_config(env)),
			new webpack.ProvidePlugin(provide_config(env)),
			new VueLoaderPlugin(),
			new HtmlWebpackPlugin(html_plugin_config(env)),
		],
		module: module_config(env),
		resolve: {
			extensions: ['.ts', '.js', '.vue', '.json'],
			alias: {
				"vue": 'vue/dist/vue.js'
			}
		},
		performance: {
			hints: false
		},
	}
};