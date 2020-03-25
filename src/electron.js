


const {app, BrowserWindow} = require('electron')
const path = require('path')
const args = require("args-parser")(process.argv)
const forEach = require("lodash/forEach")
const find = require("lodash/find")

let app_manifest = {
  title: "Yet another TEMPLATE clone"
}

if (process.env.APP_NAME !== undefined && process.env.APP_NAME !== "undefined" ) {
  app_manifest = require(path.join(process.env.CWD, `src/apps/${ process.env.APP_NAME }/manifest.json`))
}

console.dir(app_manifest)

function createWindow () {
  const mainWindow = new BrowserWindow({
    title: app_manifest.title,
    width: 1200,
    height: 1000,
    nodeIntegration: true,
    nodeIntegrationInWorker : true,
    nodeIntegrationInSubFrames: true,
    experimentalFeatures: true,
    webPreferences: {
      preload: path.join(process.env.CWD, '/src/electron_preload.js'),
      webSecurity: false,
      
    }
  })

  mainWindow.maximize()

  console.log(args.url)
  mainWindow.loadURL(args.url)
  mainWindow.openDevTools()
  
}


app.whenReady().then(createWindow)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})


// In main process.
const { ipcMain } = require('electron')
const ipc = ipcMain
ipc.on('request', (event, arg) => {
  BrowserWindow.getAllWindows().forEach((browser_window)=>{
    if ( arg.source_id !== browser_window.id ) {
      browser_window.send("request", arg)
      browser_window.send(`window_${ arg.source_id }.request`, arg)
    }
  })
})

ipc.on('response', (event, arg) => {
  BrowserWindow.getAllWindows().forEach((browser_window)=>{
    if ( arg.source_id !== browser_window.id ) {
      browser_window.send("response", arg)
      browser_window.send(`window_${ arg.source_id }.response`, arg)
    }
  })
})


// setInterval(()=>{
//   BrowserWindow.getAllWindows().forEach((browser_window)=>{
//     browser_window.send("async-message", {kek: 1, bla: 2 })
//   })
// }, 1000)