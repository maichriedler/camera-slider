$(document).ready(function(){
/*  $('#start').click(function(){
      $.post('/button_cl');
  });
*/
//var socket = io.connect('http://192.168.178.21:3001');
var socket = io.connect('http://10.11.12.1:3001');
var motorConf = {};
var shutInt;

// START is clicked
  $('#start').click(function(e) {
    e.preventDefault();
    var _this = $(this);
    console.log('Button clicked');

    motorConf.pTime = $('#txtSpeed').val() || 0.01;
    motorConf.steps = $('#txtSteps').val() || 1000;
    motorConf.mode = 'manual';

    if ($('#dirLeft').is(":checked"))
    {
      motorConf.direction = -1;
    } else if ($('#dirRight').is(":checked")) {
      motorConf.direction = 1;
    }
    console.log(motorConf.direction);

    if ($(this).val() === 'start') {
      motorConf.state = 'running';
      console.log('start triggered');
      _this.val('stop');
      _this.removeClass("btn-success");
      _this.addClass("btn-danger");
      _this.text(_this.data("text-stop"));
    }
    else {
      console.log('stop triggered');
      motorConf.state = 'stopped';
      _this.val('start');
      _this.removeClass("btn-danger");
      _this.addClass("btn-success");
      _this.text(_this.data("text-start"));
    }

    socket.emit('writing', motorConf);
    console.log(motorConf);

  });

  // SHUTDOWN is clicked
  $('#shutdown').click(function(e) {
    e.preventDefault();
    socket.emit('shutdown', motorConf);
    console.log('shutdown sent');
  });

  // STOP is clicked
  $('#stop').click(function(e) {
    e.preventDefault();
    motorConf.state = 'stopped';
    socket.emit('writing', motorConf);
    console.log('stop');
  });

  // MODE is clicked
  $('.mode-btn').click(function(e) {
    e.preventDefault();
    //$('mode-btn:not(this)').button("disable");
    $('mode-btn:not(this)').prop('disabled', true);
    $('mode-btn:not(this)').removeClass('btn-primary');
    $('mode-btn:not(this)').addClass('btn-secondary');

    var _this = $(this);

    if ($('#dirLeftAuto').is(":checked"))
    {
      motorConf.direction = -1;
    } else if ($('#dirRightAuto').is(":checked")) {
      motorConf.direction = 1;
    }

    motorConf.steps = 100000;
    motorConf.state = 'running';
    motorConf.mode = 'auto';
    motorConf.shutInt = $('#txtShutInt').val() || 5;

    switch (_this.val()) {
      case 'mode1' :  motorConf.pTime = 5;
                      break;
      case 'mode2' :  motorConf.pTime = 10;
                      break;
      case 'mode3' :  motorConf.pTime = 16;
      default :       break;
    }
    socket.emit('writing', motorConf);

  });

  // SHUTTER is clicked
  $('#shutter').click(function(e) {
    e.preventDefault();
    motorConf.mode = 'manual';
    socket.emit('shut', motorConf);
    console.log('shut');
  });


  // getting websockets

  socket.on('MotorStopped', function() {
    $('#start').val('start');
    $('#start').removeClass("btn-danger");
    $('#start').addClass("btn-success");
    $('#start').text($('#start').data("text-start"));
    console.log('Update');
    motorConf.state = 'stopped';
  });


  socket.on('updateValues', function(updateConf){
    $('#txtSpeed').val(updateConf.pTime);
    $('#txtSteps').val(updateConf.steps);

    if (updateConf.state === 'running') {
      motorConf.state = 'stopped';
      //console.log('start triggered');
      $('#start').val('stop');
      $('#start').removeClass("btn-success");
      $('#start').addClass("btn-danger");
      $('#start').text($('#start').data("text-stop"));
      console.log('change appearance');
    }
    else {
      //console.log('stop triggered');
      motorConf.state = 'running';
      $('#start').val('start');
      $('#start').removeClass("btn-danger");
      $('#start').addClass("btn-success");
      $('#start').text($('#start').data("text-start"));
    }
  });
});
