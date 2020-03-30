const path = require("path")
const temp = window.temp = require(path.resolve(process.cwd(), "scripts/temp.js"))
const { remote } = require("electron")
let extra_preload = temp.get("core", `electron.child.extra_preload.${ remote.getCurrentWindow().id }`)
let app_config = window.app_config = temp.get("core", `electron.child.app_config.${ remote.getCurrentWindow().id }`)

const ipc = window.ipc = require('electron').ipcRenderer;
const current_window = window.current_window = remote.getCurrentWindow()

let requests = {}

window.send = function( event_type, data ) {
  console.log(`%cELECTRON CHILD WORKER: SEND, ${ event_type }`, "color: #ffbc00; font-weight: bold;", data)
  console.log(`%c~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`, "color: #ffbc00; font-weight: bold;")

  ipc.send( event_type, {
    source_id: current_window.id,
    ...data
  } )

  current_window.send( event_type, {
    source_id: current_window.id,
    ...data
  } )
}

// setInterval(()=>{
//   console.log(1);
//   send("request", {
//     id: 1,
//     data: {test: 1},
//     callback: (r, t)=>console.log(r, t)
//   })
// }, 1000)

window.remote = remote

if (typeof extra_preload === "string") {
  require(path.join(process.cwd(), extra_preload))
}