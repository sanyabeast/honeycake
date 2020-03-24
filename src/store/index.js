let app_manifest = require(`apps/${ process.env.APP_NAME }/manifest.json`)

export default {
  state: {
    core: {
      app_manifest
    }
  }
}