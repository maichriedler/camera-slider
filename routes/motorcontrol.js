var gpio = require("onoff").Gpio;

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var app = require('../app.js');

var pins = [];

// shutter pin
shutPin = new gpio(10,'out');
  shutPin.writeSync(0);

module.exports = {
  motorRun: function (motorConf, socket) {

    var status = app.status;

    /// BEGIN
    var stepPins = [5,6,13,19];
    var pinNumber = stepPins.length;
    var stepCounter = 0;
    var timeout = motorConf.pTime || 0.01;
    var stepCount = 8;
    var totCount = 0;
    var direction = motorConf.direction;

    Seq = [];
    Seq[0] = [1,0,0,0];
    Seq[1] = [1,1,0,0];
    Seq[2] = [0,1,0,0];
    Seq[3] = [0,1,1,0];
    Seq[4] = [0,0,1,0];
    Seq[5] = [0,0,1,1];
    Seq[6] = [0,0,0,1];
    Seq[7] = [1,0,0,1];

    // Motorpins
    for(var i=0; i<pinNumber; i++){
      pins[i] = new gpio(stepPins[i], 'out');
    }

    function stepping() {
      if (app.status === 'running' && totCount < motorConf.steps) {
        //console.log(motorConf.shutInt, timeout, totCount);

        if (motorConf.mode === 'auto' && (totCount % (1000*motorConf.shutInt/timeout) === 0)) {
            //    console.log(totCount % (motorConf.shutInt/timeout));
        shutPin.writeSync(1);
          setTimeout(function(){
            shutPin.writeSync(0);
            }, 500);
        }

        for (var pin = 0; pin<4; pin++){
          if(Seq[stepCounter][pin] != 0){
            pins[pin].writeSync(1);
          } else{
            pins[pin].writeSync(0);
          }
        }
        stepCounter += direction;
        if (stepCounter==stepCount){
          stepCounter = 0;
        }
        if (stepCounter<0){
          stepCounter = stepCount-1;
        }

        totCount++;

        setTimeout(function() {
          stepping();
        }, timeout);

      } else {
        module.exports.motorStop(motorConf, socket); //stop the motor
      }

    }

    stepping();

  },

  motorStop : function (motorConf, socket) {
    pins[0].writeSync(0);
    pins[1].writeSync(0);
    pins[2].writeSync(0);
    pins[3].writeSync(0);

    motorConf.state = 'stopped';
    console.log('status:' + motorConf.state);
    socket.emit('MotorStopped');

    return motorConf;
  },

  shutterTrig : function () {
    {
      shutPin.writeSync(1);
      setTimeout(function(){
        shutPin.writeSync(0);
      }, 500);
    }
  }
};
/*
module.exports = motorControl;
module.exports = motorStop; */
