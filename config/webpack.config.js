

const CWD = process.cwd()
/*generic tools*/
const colors = require("colors")
const path = require('path')
const webpack = require("webpack")
/*plugins*/
const HtmlWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const CopyPlugin = require('copy-webpack-plugin');
const node_externals = require('webpack-node-externals');
/*subconfigs*/
let html_plugin_config = require("./html_plugin.config")
let module_config = require("./module.config")
let define_config = require("./define.config")
let provide_config = require("./provide.config")
let devserver_config = require("./devserver.config")


module.exports = env => {
	return {
		target: env.WEBPACK_TARGET,
		
		devtool: !env.production ? "#eval-source-map" : false,
		entry: [ "@babel/polyfill", "./src/index.js" ],
			mode: env.production === true ? "production" : "development",
			devServer: devserver_config(),
		output: {
			filename: 'bundle.js',
			path: path.resolve(CWD, `dist/${ (env.APP_NAME||"").replace(/\//gm, "__") }/${ env.production ? "prod" : "dev" }`),
		},
		plugins: [
			new webpack.ProgressPlugin((percentage, message, ...args)=>{
				console.log(`webpack: ${message}`.cyan, percentage.toString().green)
			}),
			new webpack.DefinePlugin(define_config(env)),
			new webpack.ProvidePlugin(provide_config(env)),
			new VueLoaderPlugin(),
			new HtmlWebpackPlugin(html_plugin_config(env)),
			new CopyPlugin([
				{ from: 'res', to: 'res' }
			]),
		],
		module: module_config(env),
		resolve: {
			extensions: ['.ts', '.js', '.vue', '.json'],
			alias: {
				'vue$': 'vue/dist/vue.esm.js',
				'root': path.resolve(process.cwd()),
				"res": path.resolve(process.cwd(), "res"),
				"lib_app": path.resolve(process.cwd(), "src/apps/default/lib"),
				"secret": path.resolve(process.cwd(), "secret"),
				"apps": path.resolve(process.cwd(), "src/apps"),
			}
		},
		performance: {
			hints: false
		},
	}
};