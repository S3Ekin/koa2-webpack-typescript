import * as webpack from "webpack";
import WebpackNodeConfig from "../nodeConfig/webpack.config" ;

const devConfig = new WebpackNodeConfig("development");
webpack(devConfig).watch({
    aggregateTimeout: 1000
}, (err: Error) => {
	
	if(!err){
			console.log("node编译完成");
	}
	
});



