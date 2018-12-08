import * as webpack from "webpack";
import * as path from "path";
import * as nodeExternals from "webpack-node-externals" ;
import {Configuration ,ExternalsElement} from "webpack";

const cleanWebpackPlugin = require("clean-webpack-plugin");
const startServerPlugin = require("start-server-webpack-plugin");

class WebpackNodeConfig implements Configuration{

	target:Configuration["target"] = "node";
	mode:Configuration["mode"] = "production";
	entry = [path.resolve(__dirname,"../server/server.ts")];
	output = {
		path:path.resolve(__dirname,"../dist"),
		filename:"server.js"
	};
	externals:ExternalsElement[] = [];
	module = {
		rules:[
			{
				test:/\.tsx?$/,	
				exclude:/node_modules/,
				use:[
					{
						loader:"ts-loader",
						options:{
							  transpileOnly: true,
                configFile: path.resolve(__dirname, './tsconfig.json')
						}
					}
				]
			}
		]
	};
	resolve = {
		extensions:[".ts",".js",".json"]
	};

	plugins = [
	//	new webpack.NoEmitOnErrorsPlugin(),
		new cleanWebpackPlugin(["dist"],{
			root:path.resolve(__dirname,"../")
		})
	];

	constructor(mode:Configuration["mode"]){

		this.mode = mode ;

		if(mode === "development"){

			this.entry.push("webpack/hot/poll?1000");

			this.externals.push(nodeExternals({
				whitelist:["webpack/hot/poll?1000"]
			}));

			const devPlugin = [
				new webpack.HotModuleReplacementPlugin(),
				new startServerPlugin({
				   	name:"server.js",
				   	signal:false,
				   	nodeArgs:["--inspect"]
				})
			];

			this.plugins.push(...devPlugin);

		}
	}



}


export default WebpackNodeConfig ;