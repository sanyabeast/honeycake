module.exports = env => {

	return {
		process: {
			"env.NODE_ENV": JSON.stringify(env.NODE_END),
			"env.production": JSON.stringify(env.production),
			"env.APP_NAME": JSON.stringify(env.APP_NAME)
		}
					
	}
}