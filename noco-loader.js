// This loader replaces each require(*.coffee) by require(./noco-loader.js!*.coffee)
// and compile the result to JS.
// Its purpose is to avoid adding any code in the webpack.config.js of the parent project.

var coffee = require('coffee-script');
var path = __filename.replace(/\\/g,'/');
var exp = RegExp(/require([\(,',",\s]*)(.*\.coffee[\),',",\s]*)/g)
var has_coffee_config = false;

module.exports = function(source, map) {
    var matches = source.match(exp);
    if(matches != null){
        for (i = 0; i < matches.length; i++) {
            var match = matches[i];
            if(match.indexOf('!') != -1){continue};
            var replace = match.replace(exp,'require$1' + path + '!$2');
            source = source.replace(match,replace);
        }
    }

    if(/(^|\n)var /.test(source))
        has_coffee_config = true;

    if(!has_coffee_config)
        source = coffee.compile(source);
    this.cacheable(true)
    this.callback(null, source, map);
};
