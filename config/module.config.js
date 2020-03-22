module.exports = env=> {

	return {
		rules: [
			{
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader', 
          },
          {
            loader: 'less-loader',
          }
        ],
      },
			{
        test: /\.vue$/,
				loader: 'vue-loader',
				options: { 
					hot: true,
					loaders: {
						// Since sass-loader (weirdly) has SCSS as its default parse mode, we map
						// the "scss" and "sass" values for the lang attribute to the right configs here.
						// other preprocessors should work out of the box, no loader config like this necessary.
						'scss': 'vue-style-loader!css-loader!sass-loader',
						'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
					}
				}
			},
			{
				test: /\.s(c|a)ss$/,
				use: [
					'vue-style-loader',
					'css-loader',
					{
						loader: 'sass-loader',
						// Requires sass-loader@^7.0.0
						options: {
							implementation: require('sass'),
							fiber: require('fibers'),
							indentedSyntax: true // optional
						},
						// Requires sass-loader@^8.0.0
						options: {
							implementation: require('sass'),
							sassOptions: {
								fiber: require('fibers'),
								indentedSyntax: true // optional
							},
						},
					},
				]
			},
			{
				test: /\.(js$)/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: ['@babel/plugin-proposal-object-rest-spread']
					}
				}
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader',
				],
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: [
					'file-loader',
				],
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: [
					'file-loader',
				],
			},
			{
				test: /\.xml$/,
				use: [
					'xml-loader',
				],
			},
			{
				test: /\.yaml$/,
				use: [
					'yaml-loader',
				],
			},
			{
				test: /\.coffee$/,
				use: [
					'coffee-loader',
				],
			},
		],
	}
}
