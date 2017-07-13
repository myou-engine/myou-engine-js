if ((typeof window === "undefined" || window === null) && typeof global !== "undefined") {
    global.window = global;
}
if(typeof process === "undefined") var process = {browser: true};
if(process.browser || process.android){
    //Webpack code
    module.exports = require('./dist/myou.js');
}else {
    //Electron code
    var req = eval('require');
    req('coffee-script/register');
    module.exports = req('./pack.coffee');
}
