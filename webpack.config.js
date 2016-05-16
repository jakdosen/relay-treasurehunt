/**
 * Created by Gavin.Li on 2016/3/3 0003.
 */
var path = require('path');
var webpack = require('webpack');
module.exports = {
	//devtool: 'cheap-module-eval-source-map',
	context: __dirname + "/public",
	/*output: {
		path: __dirname + '/public/built',
		filename: "[name].[chunkhash].bundle.js",
		chunkFilename: "[name].bundle.js",
		libraryTarget:"umd"
	},*/

	entry: path.resolve(__dirname, 'js', 'app.js'),

	output: {
		path: __dirname + '/public/js/',
		filename: 'app.js',
		publicPath: '/static/'
	},
	plugins: [
	/*	new webpack.optimize.UglifyJsPlugin({
			sourceMap: false
		}),*/
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
	],
	module: {
		loaders: [
			{ test: /\.jsx$/, loader: 'jsx-loader' },
			{
				test: /\.js$/,
				loader: 'babel',
				exclude: /node_modules/,
			},
			{
				test: /\.css?$/,
				loaders: [ 'style', 'raw' ],
				include: __dirname
			}
		]
	},
};