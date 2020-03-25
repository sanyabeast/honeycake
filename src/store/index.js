
let app_manifest = require(`apps/${ process.env.APP_NAME }/manifest.json`)
const WINDOW_ID = ("remote" in window ) ? remote.getCurrentWindow().id : null

export default {
  state: {
    core: {
      app_manifest
    },
  },
  actions: {
    "core.electron.create_window" ( store, params ) {
      if ( "electron_window_manager" in window ) {
        window.electron_window_manager.create_window( params )
      }
    },
    "core.electron.ipc.emit" ( store, data ) {
      if ( "electron_window_manager" in window ) {
        electron_window_manager.emit( WINDOW_ID, data )
      }
    },
    "core.electron.ipc.on" ( store, data ) {
      if ( "electron_window_manager" in window ) {
        electron_window_manager.on( data.window_id, data.event_name, data_callback )
      }
    }
  }
}