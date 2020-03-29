const path = require("path")
const PromiseQueue = require(path.resolve(process.cwd(), "src/apps/default/lib/PromiseQueue.js"))
const promise_queue = window.promise_queue = new PromiseQueue()
const tbot_config = require(path.resolve(process.cwd(), "secret/tbot.json"))
const find = require("lodash/find")
const get = require("lodash/get")
const set = require("lodash/set")
const unset = require("lodash/unset")
const isObject = require("lodash/isObject")
const isArray = require("lodash/isArray")
const isString = require("lodash/isString")
const isNumber = require("lodash/isNumber")
const isUndefined = require("lodash/isUndefined")
const transform = require("lodash/transform")
const forEach = require("lodash/forEach");
const ripper_config = tbot_config.ripper
const request = window.request = require("request")
const fs = require("fs")
const randomstring = require("randomstring");
const { ActionManager } = require(path.join(process.cwd(), "scripts/action.js"));
const MD5 = window.md5 = require("./md5.js")
const mkdirp = require("mkdirp")

const action_manager = new ActionManager()
const { waitForTheElement } = require('wait-for-the-element');
let channel_data = action_manager.read_json("temp/tbot/channel_data.json") || {}

const BOTTING_SPEED_X = 1
const TAG = "TG_RIPPER"
const GROUPED_MESSAGE_AWAIT_TIMEOUT = 2000
const MESSAGE_PROCESS_AWAIT_TIMEOUT = 8000
const PHOTO_SIZE_RESOLVE_TIMEOUT = 2000

/*events*/
const { createNanoEvents } = require('nanoevents')
const emitter = createNanoEvents()

/*tgripper*/
window.emit = function ( event_name, payload ) {
  emitter.emit( `hook.${ event_name }`, payload )
}

window.log = function () {
  let args = [ ...arguments ]
  args.unshift( "color:#dc4646" )
  args.unshift( "%cTGWORKER:" )
  console.log.apply( console, args )
}

class TGWorker {

  constructor () {
    this.contacts = {
      user_manager: {
        $users: {},
        users: {},
        usernames: {},
        user_access: {}
      },
      chat_manager: {
        $chats: {},
        chats: {},
        usernames: {},
        chat_access: {}
      },
    }

    this.grouped_messages = {}
    this.resolved_messages = {}

    

    this.file_manager = null;
    this.mtp_file_manager = null;
    
    emitter.on( "hook.update.message", ( event )=>{
      // log(event);
      switch ( event._ ) {
        case "message":
          if ( isUndefined( event.fromID ) ) {
            if ( isNumber( event.retry_index ) && event.retry_index > 10 ) {
              log( "message: retry count exceeded", event );
              return
            }

            setTimeout( ()=>{
              log("retry in 500ms");
              event.retry_index = isNumber( event.retry_index ) ? ( event.retry_index + 1 ) : 0
              emitter.emit( "hook.update.message", event ) 
            }, 1000 )
            return;
          }

          this.process_message( event ).then( ( event )=>{
            if ( event === null ) {
              log( `event is null`, event )
              return
            }
            emitter.emit( "telegram.message", {
              type: "telegram.message",
              ...event
            })
          } )

          break;
        case "updateShortMessage":

            this.process_message( event ).then( ( event )=>{
              if ( event === null ) {
                log( `event is null`, event )
                return
              }
              emitter.emit( "telegram.message", {
                type: "telegram.message",
                ...event
              })
            } )

          break;
        case "new_session_created":
          emitter.emit( "telegram.session.start", {
            type: "telegram.session.start",
            first_msg_id: event.first_msg_id,
            unique_id: event.unique_id,
          } )

          send( "message", {
            type: "session.start",
            data: event
          } );

          break;
        case "updateShort":
          if ( event.update ) {
            emitter.emit( "hook.update.message", {
              type: "hook.update.message",
              ...event.update,
              date: event.date
            } )
          }
          break;
        case "updateUserTyping":
          if ( event.action && event.action._ === "sendMessageTypingAction" ) {
            emitter.emit( "telegram.typing.start", {
              type: "telegram.typing.start",
              from_id: event.user_id,
              date: event.date,
            } )
          }
        case "updates": 
          if ( isArray( event.updates ) ) {
            forEach( event.updates, ( update_data )=> {
              emitter.emit( "hook.update.message", {
                ...update_data,
                data: event.data
              } )
            } )
          }
          
          break;  
        case "updateNewMessage":
          if ( isObject( event.message ) ) emitter.emit( "hook.update.message", event.message )
          break;
        case "updateNewChannelMessage":
          if ( isObject( event.message ) ) emitter.emit( "hook.update.message", event.message )
          break;
           
      }
    } )

    emitter.on( "hook.user_manager.init", ( event )=>{
      this.contacts.user_manager = {
        $users: {},
        users: event.users,
        usernames: event.usernames,
        user_access: event.user_access
      }
    
    } )

    emitter.on( "hook.chat_manager.init", ( event )=>{
      this.contacts.chat_manager = {
        $chats: {},
        chats: event.chats,
        usernames: event.usernames,
        chat_access: event.user_access
      }
    } )

    emitter.on( "hook.file_manager", ( event )=>{
      log("file_manager", event)
      this.file_manager = event
    } )

    emitter.on( "hook.mtp_file_manager", ( event )=>{
      log("mtp_file_manager", event)
      this.mtp_file_manager = event
    } )


    /*test*/
    emitter.on( "telegram.message.text", ( payload )=>{

      log( `"telegram.message.text" (${ payload.from.username || payload.from.title })` )
      
      send( "message", {
        type: "message.text",
        data: payload
      } );

    } )

    /** */
    emitter.on( "telegram.message", ( payload )=>{

      log( `"telegram.message" (${ payload.from.username })` )

      send( "message", {
        type: "message",
        data: payload
      } );
    } )


    emitter.on( "telegram.typing.start", ( payload )=> log( payload ) )
    emitter.on( "telegram.session.start", ( payload )=> log( payload ) )

    log("success")
    
  }

  resolve_blob_url ( blob, type ) {
    let url = this.file_manager.getUrl(blob, type )
    log("resolve blob url", url)
    return url
  }

  get_photo_data ( photo ) {
     

      log( "get_photo_data" )

      return new Promise ( ( resolve, reject )=>{
        let size_obj = null
        let caption = undefined
        let lower_index_timeout = null

        switch( photo._ ) {
          case "photo":
            let size_index = null
            caption = photo.caption

            if ( isNumber( photo.$size_index ) ) {
              log( `trying to get photo size - ${ photo.$size_index }` )
              size_index = photo.$size_index
            } else {
              size_index = photo.sizes.length - 1
              photo.$size_index = size_index
            }

            size_obj = photo.sizes[ size_index ]

            lower_index_timeout = setTimeout( ()=>{
              log( `lowering photo size index (${ photo.$size_index })` )
              if ( photo.$size_index === 0 ) {
                log( "photo was not resolved", photo )
                resolve( null )
                return;
              }

              photo.$size_index--
              this.get_photo_data( photo ).then( data => resolve( data ) )
              
            }, PHOTO_SIZE_RESOLVE_TIMEOUT )

            break;
            case "photoSize":
              size_obj = photo
              log("resolving photo from photoSize object", photoSize)
            break;
        }

        this.mtp_file_manager.getDownloadedFile(size_obj.location, size_obj).then( ( blob )=>{
          if ( lower_index_timeout !== null )clearTimeout( lower_index_timeout )
          let blob_url = this.resolve_blob_url( blob, "image/jpeg" )

          resolve( {
            url: blob_url,
            size: size_obj,
            caption: caption
          })
        } )

      } ) 

  }

  process_message ( data ) {

    return new Promise ( ( resolve, reject )=>{


      let from_id =  isNumber( data.fromID ) ? data.fromID : data.user_id
      let is_grouped = isString( data.grouped_id )

      let unique_id = `${ from_id }/${ data.id }`
      if ( this.resolved_messages[ unique_id ] && !is_grouped ){
        resolve( null )
      }

      if ( !is_grouped ) {
        this.resolved_messages[ unique_id ] = true
      }

      // console.log( "process_message", data )
  
      
      let result = {
        message: {
          text: data.message,
          type: "text"
        },
        from: this.get_user( from_id )
      }

      if ( is_grouped ) {
        let grouped_id = data.grouped_id
        let group_data = get( this.grouped_messages, `g${ grouped_id }` )
        if ( !group_data ) {
          group_data = {
            id: grouped_id,
            fromID: data.fromID,
            user_id: data.user_id,
            from_id: data.from_id,
            messages: []
          }

          set( this.grouped_messages, `g${ grouped_id }`, group_data )
        }

        group_data.messages.push( data )
        if ( isNumber( group_data.timer_id ) ) clearTimeout( group_data.timer_id )
        group_data.timer_id = setTimeout( ()=>{
          unset( this.grouped_messages, `g${ grouped_id }` )
          this.process_grouped_messages( group_data ).then( data => resolve( data ) )
        }, GROUPED_MESSAGE_AWAIT_TIMEOUT ) 

        return

      }

      if ( data.media ) {
        this.process_media( data.media ).then(( media_data )=>{
          if ( media_data === null ) {
            log("media was not resolved", data.media) 
            resolve( null )
          } else {
            result.message.media = media_data;
            result.message.type = media_data.type
            resolve ( result )
          }
          
        })
      } else {
        resolve( result )
      }

    } )

  
  }

  process_grouped_messages ( grouped_data ) {
    return new Promise( ( resolve, reject )=>{
      let count = grouped_data.messages.length
      let current = 0
      let mediagroup = []
      let from_id =  isNumber( grouped_data.fromID ) ? grouped_data.fromID : grouped_data.user_id
      
      log( "processing message group", grouped_data )
      
      forEach( grouped_data.messages, ( message_data )=>{
        log("start processing submessage", message_data)
        this.process_message({
          ...message_data,
          grouped_id: undefined
        }).then( ( data )=>{
          current++
          
          if ( data === null ) {
            log("submessage was not resolved")
          } else {
            log( "submessage", data )
          
            if ( data.message.media ) {
              mediagroup.push( data.message.media )
            }
          }
          
          if ( current === count ) {
            let merge = {
              message: {
                text: message_data.message,
                mediagroup,
                type: "group"
              },
              from: this.get_user( from_id )
            }

            log( "merged message", merge )
            resolve( merge )

          }
        })
      } )

    } )
  }

  process_media ( data ) {
    return new Promise ( ( resolve, reject )=>{
      let retval = {}
      let media_type = null
      
      switch ( data._ ) {
        case "messageMediaPhoto":
          media_type = "photo"
          this.get_photo_data( data.photo ).then( ( photo_data )=>{
            // console.log(photo_data)
            if ( photo_data === null ) {
              resolve( null )
            } else {
              resolve( {
                type: media_type,
                data: {
                  url: photo_data.url,
                  width: photo_data.size.h,
                  height: photo_data.size.w,
                  size: photo_data.size.size,
                  caption: data.caption
                }
              } )
            }            
          } )
        
        break;
        case "document":
          if ( data.sticker === true ) {
            media_type = "sticker"
            this.get_photo_data( data.thumb ).then( ( data )=>{
              console.log(data)
              // resolve( {
              //   type: media_type,
              //   data: {
              //     url: data.url,
              //     width: data.size.h,
              //     height: data.size.w,
              //     size: data.size.size
              //   }
              // } )
            } )
          } else {
            media_type = "document"
            resolve( {
              type: media_type,
              data: {
                access_hash: data.access_hash,
                mime: data.mime_type,
                size: data.size,
                type: data.type,
                file_name: data.file_name
              }
            } )
          }

        break;
        case "messageMediaDocument":
          console.log(444, data.document)
          this.process_media( data.document ).then( d => resolve( d )  )
        break;
      }
      log("process media", data)
    } )
  }

  get_user ( id ) {
    if ( isString(id) ) id = (this.contacts.user_manager.users[ this.user_manager.usernames[ id ] ]) || (this.contacts.chat_manager.chats[ this.chat_manager.usernames[ id ] ]) || null

    let is_human = id > 0

    console.log( is_human )

    if ( is_human ){
      if ( this.contacts.user_manager.$users[ id ] ) return this.contacts.user_manager.$users[ id ]
      this.contacts.user_manager.$users[ id ] = this.create_contact( this.contacts.user_manager.users[ id ] )
      return this.contacts.user_manager.$users[ id ]
    } else {
      id = -id;
      if ( this.contacts.chat_manager.$chats[ id ] ) return this.contacts.chat_manager.$chats[ id ]
      this.contacts.chat_manager.$chats[ id ] = this.create_contact( this.contacts.chat_manager.chats[ id ] )
      return this.contacts.chat_manager.$chats[ id ]
    }
  
  }

  transform_map ( map, t_func ) {
    let result = {}
    return result
  }

  create_contact ( data, id ) {
    if ( data._.match(/chat|chatForbidden/) ) return null

    return {
      first_name: data.first_name,
      username: data.username,
      title: data.title,
      broadcast: data.broadcast,
      participants_count: data.participants_count,
      id: data.id,
      first_name: data.first_name,
      last_name: data.last_name,
      access_hash: data.access_hash
    }
  }

  write_blob_to_file ( blob_url, save_path, extension ) {
    let name = randomstring.generate({
      length: 32,
      charset: 'alphabetic'
    });

    let file_name = `${md5(blob_url)}${extension}`;
    save_path = `${save_path}`

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
}

window.tgworker = new TGWorker()
