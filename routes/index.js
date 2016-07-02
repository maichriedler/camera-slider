var express = require('express');
var router = express.Router();
var PythonShell = require('python-shell');
var gpio = require("onoff").Gpio;

// GET home page.
router.get('/', function(req, res, next) {
  res.render('index');
//res.sendFile('index2.html');
});

router.post('/send_save', function(req, res, next){
	var obj = {};
	console.log('body: ' + JSON.stringify(req.body));
  obj = req.body;
  console.log(obj.speed, obj.state);
	res.send(req.body);

if (obj.state === 'start') {
    //use GPIO pin numbers
  var stepPins = [5,6,13,19];
  var pinNumber = stepPins.length;
  var pins = [];
  var stepCounter = 0;
  var timeout = 0.01;
  var stepCount = 8;

  Seq = [];
  Seq[0] = [1,0,0,0];
  Seq[1] = [1,1,0,0];
  Seq[2] = [0,1,0,0];
  Seq[3] = [0,1,1,0];
  Seq[4] = [0,0,1,0];
  Seq[5] = [0,0,1,1];
  Seq[6] = [0,0,0,1];
  Seq[7] = [1,0,0,1];

  for(var i=0; i<pinNumber; i++){
    pins[i] = new gpio(stepPins[i], 'out');
  }

  var step = function(){
    for(var pin = 0; pin<4; pin++){
      if(Seq[stepCounter][pin] != 0){
        pins[pin].writeSync(1);
      }else{
        pins[pin].writeSync(0);
      }
    }
    stepCounter += 1
    if (stepCounter==stepCount){
      stepCounter = 0;
    }
    if (stepCounter<0){
      stepCounter = stepCount;
    }
    while (obj.state === 'start')
    setTimeout( function(){step()}, timeout );
  }

  step();
}


});

module.exports = router;
