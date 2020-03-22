const {app, BrowserWindow} = require('electron')
const path = require('path')
const args = require("args-parser")(process.argv)

console.log(args)

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    nodeIntegration: true,
    nodeIntegrationInWorker : true,
    nodeIntegrationInSubFrames: true,
    experimentalFeatures: true,
    webPreferences: {
      preload: path.join(process.cwd(), '/src/electron_preload.js')
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