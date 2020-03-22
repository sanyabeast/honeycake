const path = window.path = require("path");
const fs = window.fs = require("fs");
window.require = require;
window.process = {
  env: process.env
}