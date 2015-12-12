module.exports = {
	entry: './src/main.js',
	output: {
		filename: 'js/bundle.js'
	},
	module: {
		loaders: [
			{test: /\.js$/, loader: 'babel-loader'}
		]
	}
};
