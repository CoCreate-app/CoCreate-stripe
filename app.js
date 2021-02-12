const express = require('express');
const app = express();
const path = require('path');
const config = require('./config.json');
const redis = require('socket.io-redis');
const port = process.env.PORT || 3000;
const socketController = require('./src/socket.js');
const server = require('http').createServer(app);

var io = require('socket.io')(server);


io.adapter(redis(config.redis));

socketController.socket(io);

global.appRoot = path.resolve(__dirname);

server.listen(port, () => {
  console.log('server is running on port', server.address().port);
});

module.exports = app;
