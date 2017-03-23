if ((typeof window === "undefined" || window === null) && typeof global !== "undefined") {
    global.window = global;
}
if(process.browser || process.android){
    //Webpack code
    if(!window.fetch){
        require('whatwg-fetch');
    }
    module.exports = require('./noco-loader!./pack.coffee');
}else {
    //Electron code
    var req = eval('require');
    req('coffee-script/register');
    module.exports = req('./pack.coffee');
}
