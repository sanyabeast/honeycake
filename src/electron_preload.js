const path = window.path = require("path");
const fs = window.fs = require("fs");
const directory_tree = window.directory_tree = require("directory-tree");
const jsonfile = window.jsonfile = require("jsonfile");
const ActionManager = require(path.resolve(process.cwd(), "scripts/action.js"))

window.require = require;
window.action_manager = new ActionManager()
window.process = {
  env: process.env
}