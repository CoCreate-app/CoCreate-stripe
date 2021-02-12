const express = require('express');
const cluster = require('cluster')
const os = require('os')
const path = require('path');
const config = require('./config.json');
const redis = require('socket.io-redis');
const port = 3000;
const socketController = require('./src/socket.js');

if (cluster.isMaster) {
    const cpuCount = os.cpus().length
    for (let i = 0; i < cpuCount; i++) {
        cluster.fork()
    }
} else {
    const app = express();
    const server = require('http').createServer(app);
    
    var io = require('socket.io')(server);
    
    io.adapter(redis(config.redis));
    
    socketController.socket(io);
    
    global.appRoot = path.resolve(__dirname);
    
    app.use('/', require('./src/routes/index'));
    app.use('/users', require('./src/routes/users'));
    app.use('/api', require('./src/routes/api'));
    app.use('/stripe', require('./src/routes/stripe'));
    
    server.listen(port, () => {
      console.log('server is running on port', server.address().port);
    }); 
}

cluster.on('exit', (worker) => {
    console.log('mayday! mayday! worker', worker.id, ' is no more!')
    // cluster.fork()
})
