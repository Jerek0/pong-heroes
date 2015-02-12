/**
 * Created by jerek0 on 10/02/2015.
 */
// CONFIG
var jsonConfig = require('./config.json'),
    url = jsonConfig.url,
    port = jsonConfig.port;

// LOADING DEPENDENCIES
var http = require('http');
var server = http.createServer();
var io = require('socket.io')(server);

// CLASSES & CONNECTIONS
var ServerManager = require('./classes/ServerManager');

// AND LAUNCHING SERVER
server.listen(port, url, function() {
    console.log('Server launched on '+url+':'+port);
    ServerManager.init(io);
});