module.exports = env => {

	return {
		process: {
			env: {
				"NODE_ENV": JSON.stringify(env.NODE_ENV),
				"production": JSON.stringify(env.production),
				"APP_NAME": JSON.stringify(env.APP_NAME),
				"CWD": JSON.stringify(process.cwd())
			},
		},					
	}
}