const path = require("path")

const { ActionManager } = require(path.resolve(process.cwd(), "scripts/action.js"))
const action_manager = window.action_manager = new ActionManager()
const set = require("lodash/set");
const get = require("lodash/get");
const unset = require("lodash/unset");


module.exports = {
  set ( scope, property, value ) {
    if ( "action_manager" in window ) {
      let data = window.action_manager.read_json( `temp/${scope}` )
      set(data, property, value)
      window.action_manager.write_json(`temp/${scope}.json`, data )
    }
  },
  get (scope, property, value ) {
    if ( "action_manager" in window ) {
      let data = window.action_manager.read_json( `temp/${scope}.json` )
      return get(data, property)
    }
  },
  remove ( scope, property ) {
    let data = window.action_manager.read_json( `temp/${scope}` )
      unset(data, property)
      console.log(data)
      window.action_manager.write_json(`temp/${scope}.json`, data )
  }
}