var port = process.argv.slice(2)[0] || 8000;
require("shelljs/global");
cd("build");
exec("node ../../../node_modules/http-server/bin/http-server -o -p " + port);
