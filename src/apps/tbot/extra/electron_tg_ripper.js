const path = require("path")
const PromiseQueue = require(path.resolve(process.cwd(), "src/apps/default/lib/PromiseQueue.js"))
const promise_queue = window.promise_queue = new PromiseQueue()
const telegram_config = require(path.resolve(process.cwd(), "secret/telegram.json"))
const find = require("lodash/find")
const get = require("lodash/get")
const set = require("lodash/set")
const transform = require("lodash/transform")
const forEach = require("lodash/forEach");
const ripper_config = telegram_config.ripper
const request = window.request = require("request")
const fs = require("fs")
const randomstring = require("randomstring");
const { ActionManager } = require(path.join(process.cwd(), "scripts/action.js"));
const MD5 = window.md5 = require("./md5.js")
const mkdirp = require("mkdirp")

const action_manager = new ActionManager()

const { waitForTheElement } = require('wait-for-the-element');

let channel_data = action_manager.read_json("temp/tbot/channel_data.json") || {}

const BOTTING_SPEED_X = 10

class TGRipperWorker {
  constructor () {
    let element = waitForTheElement('.im_dialog ', {
      timeout : 30000
    }).then((e, a)=>{
      this.init()
    })
  }

  data = {
    current_channel_index: 0,
    current_action: 0,
    actions: ["set_active_chat", "check_chat_updates", "increment_active_chat", "wait"]
  };

  get current_channel_caption () {
    return ripper_config.tracking_channels[this.data.current_channel_index].caption
  }

  next_action () {
    let current_action = this.data.current_action

    this.data.current_action++

    if ( this.data.current_action > this.data.actions.length - 1 ) {
      this.data.current_action = 0
    }

    switch(this.data.actions[current_action]) {
      case "set_active_chat": this.set_active_chat();
      break;
      case "check_chat_updates": this.check_chat_updates();
      break;
      case "increment_active_chat": this.increment_active_chat();
      break;
      case "wait": this.wait();
      break;
    }

    
  }

  init() {
    this.next_action()
  }

  write_blob_to_file ( blob_url, save_path, extension ) {
    let name = randomstring.generate({
      length: 32,
      charset: 'alphabetic'
    });

    let file_name = `${md5(blob_url)}${extension}`;
    save_path = `${save_path}/${extension.replace(".", "")}`

    if (!fs.existsSync(path.join(process.cwd(), `${save_path}/${file_name}`))){
      fetch(blob_url).then((r)=> {
          return r.arrayBuffer()
      } ).then( r => {

          if ( !fs.existsSync(path.join(process.cwd(), `${save_path}`)) ) {
            mkdirp(`${save_path}`)
          }

          fs.writeFileSync(path.join(process.cwd(), `${save_path}/${file_name}`), Buffer.from(r), "binary")
      })
    }

    return `${save_path}/${file_name}`
  }

  check_chat_updates () {
    send("message", { type: `info`, text: "check_chat_updates" })

    let message_nodes = document.querySelectorAll(".im_history_message_wrap")
    let updates = []


    forEach(message_nodes, (node, key)=>{
      let date_node =  node.querySelector(".im_message_date_text")
      
      if (date_node) {
        let timecode = date_node.getAttribute("data-content")
        

        if ( get(channel_data, `${ this.current_channel_caption }.posts.${timecode}`) === undefined ) {
          updates.push({
            timecode,
            post_data: this.collect_post_data( node )
          })

          set(channel_data, `${ this.current_channel_caption }.posts.${timecode}`, updates[updates.length - 1])
        }
      }
    })


    if (updates.length > 0) {
      send("message", {
        type: "update",
        data: {
          chat_caption: this.current_channel_caption,
          updates
        }
      })

      action_manager.write_json("temp/tbot/channel_data.json", channel_data)
    }


    promise_queue.add((r)=>{
      setTimeout(()=>{
        r()
        this.next_action();
      }, 1000 * BOTTING_SPEED_X)
    })
  }

  collect_post_data ( post_node ) {
    let image_nodes = post_node.querySelectorAll(".im_message_photo_thumb img")
    let image_data = []

    forEach(image_nodes, (image_node, index)=>{
      if ( image_node.src ) {
        let file_name = this.write_blob_to_file(image_node.src, "temp/tbot", ".jpg")
        image_data.push({
          src: image_node.src,
          file_name: file_name
        })
        
      }
    })

    return {
      images: image_data
    }
  }

  wait () {
    promise_queue.add((r)=>{
      setTimeout(()=>{
        r();
        this.next_action()
      }, 2000 * BOTTING_SPEED_X)
    })
  }

  increment_active_chat () {
    send("message", { type: `info`, text: `iterate_activee_chat (${this.data.current_channel_index})` })

    this.data.current_channel_index++
    if ( this.data.current_channel_index >= ripper_config.tracking_channels.length ) this.data.current_channel_index = 0

    this.next_action()
  }

  set_active_chat () {
    send("message", { type: `info`, text: `set_active_chat (${this.data.current_channel_index})` })

    promise_queue.add((r)=>{
      let channel_cap = ripper_config.tracking_channels[this.data.current_channel_index].caption
      let button = this.find_contact_button({
        caption: channel_cap
      })
      button.click()

      setTimeout(()=>{
        r()
        this.next_action()
      }, 2000 * BOTTING_SPEED_X)
    })
  }

 

  find_contact_button ( params ) {
    let buttons = window.document.querySelectorAll(".im_dialog  ")
    let result = find(buttons, ( button_node )=> {
      let caption = button_node.querySelector(".im_dialog_peer span").innerHTML.trim()
      return caption === params.caption

    })
  
    return {
      dom: result,
      click: ()=>{
        return this.fire_event(result, "mousedown")
      }
    }
  }

  fire_event(el, etype){
    send("message", {
      type: `element.${ etype }`
    })

    if (el.fireEvent) {
      el.fireEvent('on' + etype);
    } else {
      var evObj = document.createEvent('Events');
      evObj.initEvent(etype, true, false);
      el.dispatchEvent(evObj);
    }
  }
}

window.tg_ripper_worker = new TGRipperWorker()