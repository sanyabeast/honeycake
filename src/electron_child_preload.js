const path = require("path")
const temp = window.temp = require(path.resolve(process.cwd(), "scripts/temp.js"))
const { remote } = require("electron")
let extra_preload = temp.get("core", "electron.child.extra_preload")

const ipc = window.ipc = require('electron').ipcRenderer;
const current_window = window.current_window = remote.getCurrentWindow()

let requests = {}

ipc.on("request", ( event, payload )=>{
  if ( payload.source_id === current_window.id ) return

  console.log("REQUEST", event, payload)
  ipc.send( "response", {
    id: payload.id,
    type: "response",
    data: {
      test: true
    }
  } )
})

ipc.on("message", ( event, payload )=>{
  if ( payload.source_id === current_window.id ) return

  console.log("MESSAGE", event, payload)
})

ipc.on("response", ( event, payload )=>{
  if ( payload.source_id === current_window.id ) return

  let id = payload.id
  let request_data = requests[id]

  if (request_data && request_data.callback) {
    request_data.callback(payload)
  }

  console.log("RESPONSE", event, payload)
})

window.send = function( event_type, data ) {
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