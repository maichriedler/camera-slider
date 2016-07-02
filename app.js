var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var shell = require('shelljs');
var gpio = require("onoff").Gpio;

var routes = require('./routes/index');
var users = require('./routes/users');

var motorcontrol = require('./routes/motorcontrol.js')

var status;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
app.get('/', function(req, res, next) {
  res.render('index');
});
app.use('/users', users);

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.on('writing', function(motorConf) {
    status = motorConf.state;
    exports.status = status;

    console.log(status, motorConf.steps, motorConf.pTime);
    socket.broadcast.emit('updateValues', motorConf); // updates the displayed motor parameter on all clients

    console.log('status:' + status);

    motorcontrol.motorRun(motorConf, socket); // calls the script to run the motor
  });

  socket.on('shut', function(motorConf) { // send: trigger the camera shutter
    motorcontrol.shutterTrig(motorConf);
  });

  // shut down command is sent and raspberry pi is shut down
  socket.on('shutdown', function(motorConf) {
    motorcontrol.motorStop(motorConf, socket);
    console.log('shutdown executed');
    shell.exec('sudo killall node'); // kill node server
    shell.exec('sudo shutdown -h now'); // shut down
  });

});

module.exports = app;


server.listen(3001);
