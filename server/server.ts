import app from "./app";
import * as http from "http";
import * as webpack from "webpack";
import WebpackWebConfig from "../webConfig/webpack.config" ;

const opn = require("opn");
const webpackDevMiddle = require("koa-webpack-dev-middleware");
const webpackHotMiddle = require("koa-webpack-hot-middleware");

let  currentApp = app.callback();

const server = http.createServer(currentApp);
const config = new WebpackWebConfig("development");

const devServer = {
							noInfo: false,
							quiet: false,
							// watchOptions: {
							// 	aggregateTimeout: 900,
							// 	poll: true
							// },
							// publicPath: "./public",
					//		serverSideRender: false,
	};


	const hot = {
		// log: false,
	 //  heartbeat: 2000,
		 overlayStyles:{
			 	color:"red",
			 	fontSize:20
		 },
		 overlayWarnings:true,
	   path: "/__webpack_hmr",
	};
const compiler = webpack(config);
app.use(webpackDevMiddle(compiler,devServer));
app.use(webpackHotMiddle(compiler,hot));




server.listen(3012,()=>{
	console.log("成功启动3012");
	opn('http://localhost:3012/', {app: ['chrome']});
});


if(module.hot){

	module.hot.accept("./app.ts",()=>{
			server.removeListener("request",currentApp);
			currentApp = app.callback();
			server.on("request",currentApp);
	});
}


