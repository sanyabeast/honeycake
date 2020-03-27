const CWD = process.cwd()
const path = require("path")

module.exports = env=> {

        return {
                title: "Yet Another Applicetion",
                meta: {viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no'},
                favicon: "res/icon.png",
                template: path.join(CWD, `static/index.html`)
        }
}