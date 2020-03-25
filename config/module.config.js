module.exports = env=> {

	return {
		rules: [
			{
        test: /\.less$/,
        use: [
					{
						loader: "vue-style-loader"
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
					runtimeCompiler: true
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
							indentedSyntax: true // optional
						},
						// Requires sass-loader@^8.0.0
						options: {
							implementation: require('sass'),
							sassOptions: {
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
					{
						loader: "vue-style-loader"
					},
					{
						loader: 'css-loader'
					},
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
