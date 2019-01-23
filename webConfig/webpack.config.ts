import * as webpack from "webpack";
import * as path from "path";
import {Configuration} from "webpack";

const cleanWebpackPlugin = require("clean-webpack-plugin");
const copyPlugin = require("copy-webpack-plugin");
const StyleLint =require("stylelint-webpack-plugin");
const  MiniCssExtractPlugin = require("mini-css-extract-plugin");
const htmlPlugin = require("html-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

class WebpackWebConfig implements Configuration{

	target:Configuration["target"] = "web";
	mode:Configuration["mode"] = "production";
	devtool:Configuration["devtool"] = "inline-source-map";
	entry = [path.resolve("./","src/index.ts")];
	output = {
		path:path.resolve("./","public"),
		filename:"js/[name].js"
	};
	module = {
		rules:[
			{
				test:/\.tsx?$/,	
				exclude:/node_modules/,
				use:[
					{
						loader:"ts-loader",
						options:{
					//		  transpileOnly: true,
                configFile: path.resolve("./", 'webConfig/tsconfig.json')
						}
					}
				]
			},
			{
				test:/\.(sc|sa|c)ss$/,
				exclude: /node_modules/,
				use:[
			//			 env === "production" ? MiniCssExtractPlugin.loader : "style-loader",
						 "style-loader",
						{
							loader:"css-loader",
						},
						{
							loader:"postcss-loader",
							options:{
							  config:{
							  	  path: path.resolve("./", 'postcss.config.js')
							  }	
							}
						},
						{
							loader:"sass-loader",
						},
				]	
			}
		]
	};
	resolve = {
		extensions:[".ts",".js",".json"],
		modules: ['node_modules'],
	  plugins: [new TsconfigPathsPlugin({configFile: "./tsconfig.json"})],
		alias: { //配置绝对路径的文件名
            css: path.resolve("./", 'src/css'),
            js: path.resolve("./", 'src/js'),
            assert: path.resolve("./", 'src/assert'),
    },
	};

	plugins = [
	//	new webpack.NoEmitOnErrorsPlugin(),
		new copyPlugin([{
			from:path.resolve("./","src/assert"),
			to:path.resolve("./","public/assert"),
		}]),
		new StyleLint({
				context:path.join("./","src"),
        configFile: path.resolve("./", 'stylelint.config.js'),
        files: "css/*.scss",
        failOnError: false,
        quiet: true,
        errored:true,
        syntax: 'scss',
        fix:true,	
		}),
		new htmlPlugin({
			title:"koa",
			filename:"index.html",
			inject:"body",
			template:path.resolve("./","src/index.html"),
		//	chunks:""
		})
	];

	constructor(mode:Configuration["mode"]){

		this.mode = mode ;

		if(mode === "development"){

			this.entry.push("webpack-hot-middleware/client?noInfo=true&reload=true");
	//		this.entry.push("webpack/hot/poll?1000");cnpm

			const devPlugin = [
				new webpack.HotModuleReplacementPlugin(),
			  new webpack.NamedModulesPlugin(), //热更新时显示更新的模块的名字，默认是模块的id 	
			];

			this.plugins.push(...devPlugin);

		}else{

			const devPlugin = [
						new cleanWebpackPlugin(["dist"],{
							root:path.resolve("./","public")
						}),
						new MiniCssExtractPlugin({
							filename:"css/[name].[hash].css",
							chunkFilename:"[id].[hash].css",
						}),	
			];

			this.plugins.push(...devPlugin);
		}



	}



}


export default WebpackWebConfig ;