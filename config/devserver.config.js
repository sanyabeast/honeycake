const path = require("path")
const CWD = process.cwd()

module.exports = env=>{

	return {
		contentBase: path.join(CWD, 'dist'),
		compress: true,
		port: 9000,
		host: "localhost",
		hot: true,
		historyApiFallback: true,
    noInfo: true
	}
}