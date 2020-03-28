

const ipc = window.ipc = require('electron').ipcRenderer;

const get = require("lodash/get")
const set = require("lodash/set")
const unset = require("lodash/unset")
const find = require("lodash/find")
const path = window.path = require("path");
const fs = window.fs = require("fs");
const directory_tree = window.directory_tree = require("directory-tree");
const jsonfile = window.jsonfile = require("jsonfile");
const { ActionManager } = require(path.resolve(process.cwd(), "scripts/action.js"))
const { remote } = require('electron')
const randomstring = require("randomstring");
const windowManager = remote.require('electron-window-manager');

const temp = require(path.resolve(process.cwd(), "scripts/temp.js"))

if (process.env.APP_ELECTRON_PRELOAD) {
  require(process.env.APP_ELECTRON_PRELOAD)
}

window.remote = remote;

window.require = require;
const action_manager = window.action_manager = new ActionManager()
/*temp*/

window.temp = temp

class ElectronWindowManager {
  windows = {};
  events = {};
  create_window ( params ) {
    let id = params.id || randomstring.generate({
      length: 32,
      charset: 'alphabetic'
    });

   
    let preload_script = path.join(process.env.CWD, `/src/electron_child_preload.js`);

    console.log(params)

    if ( params.use_default_preload ) {
      preload_script  =  path.join(process.env.CWD, `/src/electron_preload.js`);
    }

    console.log(preload_script)

    let browser_window = this.windows[id] = new remote.BrowserWindow( {
      width: 600,
      height: 600,
      
      nodeIntegration: true,
      nodeIntegrationInWorker : true,
      nodeIntegrationInSubFrames: true,
      experimentalFeatures: true,
      webPreferences: {
        preload: preload_script,
        webSecurity: false,
      },
      ...params
    } )

    if ( params.extra_preload ) {
      temp.set("core", `electron.child.extra_preload.${browser_window.id}`, params.extra_preload )
    } else {
      temp.remove(`core`, `electron.child.extra_preload.${browser_window.id}` )
    }

    if ( params.app_config ) {
      temp.set("core", `electron.child.app_config.${browser_window.id}`, params.app_config )
    } else {
      temp.remove(`core`, `electron.child.app_config.${browser_window.id}` )
    }

    
    browser_window.loadURL(`${params.url}`)

    return browser_window
  }

  get_window_match_url ( url, use_regexp ) {
    if (use_regexp){
      return find(remote.BrowserWindow.getAllWindows(), (w)=> w.getURL().match(new RegExp(url, "gm"))) || null
    } else {
      return find(remote.BrowserWindow.getAllWindows(), (w)=> w.getURL() === url) || null
    }

  } 
  
}

window.electron_window_manager = new ElectronWindowManager()

window.process = {
  env: process.env
}