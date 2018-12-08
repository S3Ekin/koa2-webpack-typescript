let autoprefixer= require("autoprefixer");
let cssnano = require("cssnano");

module.exports = {
 ident: 'postcss',
 plugins: [
	autoprefixer({
		browsers: [
			'>10%',
			'last 2 versions',
			'Firefox ESR',
			'not ie < 9',
		],

	}),
	cssnano({
		 	preset: ['default',{
				/*discardUnused:[
					{fontFace:true},
					{keyframes:false},
					{namespace:false},
					{counterStyle:false},
	            ]*/
		 	}],
            reduceIdents: false,
            zindex:false //防止编译时z-index 被改变
	})
 ],
}