import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';

class App extends React.Component {
	constructor(props){
		super(props);
    
    /* state explanations: 
      - breakLength: the value displayed below "Break Length".
      - sessionLength: the value displayed below "Session Length".
      - timer: it's the timer. there is a function below called.
      displayTime() that will format this into minutes and seconds.
      - currentTimerType: this is the value displayed above the timer.
      when the session timer hits 0, the timer will reset to the time
      displayed on Break Length, then once this hits 0 it goes to
      Session Length time, effectively looping (and giving periods
      of rest to the user).
      - isTimerRunning: exists so that certain buttons do not function
      while the timer is running, as well as having a state that keeps
      track of whether our timer is running or not.
      - intervalId: this exists for our timer so that it accurately
      counts down one second at a time, we will (dot)cancel this state
      whenever we want to pause the timer.
    */
    this.state = {
      breakLength: 5,
      sessionLength: 25,
      timer: 1500,
      currentTimerType: 'Session',
      isTimerRunning: 'stopped',
      intervalId: ''
    }
    this.setBreakValue = this.setBreakValue.bind(this);
    this.changeLengthController = this.changeLengthController.bind(this);
    this.setSessionValue = this.setSessionValue.bind(this);
    this.displayTime = this.displayTime.bind(this);
    this.resetTimer = this.resetTimer.bind(this);
    this.playOrPause = this.playOrPause.bind(this);
    this.playTimer = this.playTimer.bind(this);
    this.timerTick = this.timerTick.bind(this);
    this.timerStatus = this.timerStatus.bind(this);
    this.switchTimerType = this.switchTimerType.bind(this);
    this.beep = this.beep.bind(this);
  }
  
  
  /* function executed when the increment, or decrement button for
  "Break Length" box are pressed. the function below is when "Session Length"
  buttons are pressed.
  First param: timerType, it may seem weird to pass 'Session'
  for a button pressed in the Break Length box, however if this
  is not done, we will (for example) edit the current time 'Session'
  when we change Break Length, which is the opposite of what we want.
  Second param: we target specificly the button we pressed, and
  carry its current value into our next function.
  Third param: our current length state of associated lengthController
  Fourth param: the name of the state we will be altering*/
  setBreakValue(event) {
    this.changeLengthController('Session', event.currentTarget.value, this.state.breakLength, 'breakLength');
  }
  
  setSessionValue(event) {
    this.changeLengthController('Break', event.currentTarget.value, this.state.sessionLength, 'sessionLength');
  }
  
  /*
    this function covers the increment/decrement of the associated length.
    we first check if the timer is running -- and if it is we don't allow the
    current lengths to be altered;
    and then we just compare the timerType state to the passed in timerType.
    the reason why this matters, is because if the current displayed length
    (at the bottom) matches the break/session length we pressed, we want the
    timer value to update.
    To give an example: lets say we add time to break length while 'Session'
    is displayed, we see that the if statement will return true, 
    (because 'Session' = 'Session'), so we dont alter the live timer.
  */
  changeLengthController(timerType, crementType, currentLength, stateToEdit) {
    if(this.state.isTimerRunning === 'running') return;
    if(this.state.currentTimerType === timerType) {
      if(crementType === "-" && currentLength !== 1) {
        this.setState({
          [stateToEdit]: currentLength - 1
        });
      }
      else if(crementType === "+" && currentLength !== 60) {
        this.setState({
          [stateToEdit]: currentLength + 1
        });
      }
    }
    else {
      if(crementType === "-" && currentLength !== 1) {
        this.setState({
          [stateToEdit]: currentLength - 1,
          timer: currentLength * 60 - 60
        });
      }
      else if(crementType === "+" && currentLength !== 60) {
        this.setState({
          [stateToEdit]: currentLength + 1,
          timer: currentLength * 60 + 60
        });
      }
    }
  }
  
  /*
     formats timer state so that it displays XX:XX, we have some if else
     statements for when minutes/seconds < 10 to display 0X:0X
  */
  
  displayTime() {
    let minutes = Math.floor(this.state.timer / 60);
    let seconds = this.state.timer - minutes * 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return minutes + ':' + seconds;
  }
  
  
  /*
    function executed when play/pause button is pressed
    if the timer is not running, we turn on the timer (changing its
    state to running) and execute playTimer function.
    if the timer isnt running, we pause the timer instead, and stop
    the timer from counting down with intervalId
  */
  playOrPause() {
    let timerControl = this.state.isTimerRunning === 'stopped' ? (
    this.playTimer(), 
    this.setState({
      isTimerRunning: 'running'
    })
    ) : (
      this.setState({
      isTimerRunning: 'stopped'
      }), 
      this.state.intervalId && this.state.intervalId.cancel()
    );
  }
  
  
  /*
    accurateInterval is from another codepen for more accurate seconds.
    every 1000ms, we change intervalId state by executing timerTick
    function and timerStatus function
  */
  playTimer() {
    this.setState({
        intervalId: window.accurateInterval(() => {
          this.timerTick();
          this.timerStatus();
      }, 1000)
    });
  }
  
  
  // reduces timer by 1
  timerTick() {
    this.setState({
      timer: this.state.timer - 1
    });
  }
  
  
  /*
    if the timer hits 0, we swap the timerType, and play the timer (but
    pausing the timer first).
    if the current timer type is session, then we will be swapping it to break
    and vice versa.
  */
  timerStatus() {
    let timer = this.state.timer;
    this.beep(timer);
    if(timer < 1) {
      if(this.state.currentTimerType === 'Session') {
        this.state.intervalId && this.state.intervalId.cancel();
        this.playTimer();
        this.switchTimerType(this.state.breakLength * 60, 'Break');
      }
      else {
        this.state.intervalId && this.state.intervalId.cancel();
        this.playTimer();
        this.switchTimerType(this.state.sessionLength * 60, 'Session');
      }
      /*this.state.currentTimerType == 'Session' ? (
        this.state.intervalId && this.state.intervalId.cancel(),
        this.playTimer(),
        this.switchTimerType(this.state.breakLength * 60, 'Break')
      ) : (
        this.state.intervalId && this.state.intervalId.cancel(),
        this.playTimer(),
        this.switchTimerType(this.state.sessionLength * 60, 'Session')
      );*/
    }
  }
  
  
  /*
    play a beep when the timer hits 0, this beep is from Peter Weinberg,
    credited where the id beep element is.
  */
  beep(_timer) {
    if(_timer === 1) {
      document.getElementById("beep").play();
    }
  }
  
  /*
    swap timer type, sets timer length
  */
  switchTimerType(timerLength, timerType) {
    this.setState({
      currentTimerType: timerType,
      timer: timerLength,  
    });
  }
  
  /*
    function executed if reset button is pressed.
    resets the audio source/pauses it if playing, resets all states to default
    values and pauses the timer countdown.
  */
  resetTimer() {
    const audio = document.getElementById("beep");
    audio.pause();
    audio.currentTime = 0;
    this.setState({
      breakLength: 5,
      sessionLength: 25,
      timer: 1500,
      currentTimerType: 'Session',
      intervalId: '',
      isTimerRunning: 'stopped'
    });
    this.state.intervalId && this.state.intervalId.cancel();
  }
 
	render() {
		return (
			<div className="app">
        <div className="main-title">25 + 5 Clock</div>
        
        <LengthController controllerLabel="break-label" controllerLabelText="Break Length" decrement="break-decrement" length="break-length" increment="break-increment" lengthValue={this.state.breakLength} setValue={this.setBreakValue}/>
        
        <LengthController controllerLabel="session-label" controllerLabelText="Session Length" decrement="session-decrement" length="session-length" increment="session-increment" lengthValue={this.state.sessionLength} setValue={this.setSessionValue}/>
        
        <div className="timer">
          <div className="timer-wrapper">
            <div id="timer-label">{this.state.currentTimerType}</div>
            <div id="time-left">{this.displayTime()}</div>
          </div>
        </div>
        
        <div className="timer-control">
          <button id="start_stop" onClick={this.playOrPause}>
            <i className="fa fa-play fa-2x"></i>
            <i className="fa fa-pause fa-2x"></i>
          </button>
          <button id="reset" onClick={this.resetTimer}>
            <i className="fa fa-refresh fa-2x"></i>
          </button>
        </div>
        
        <audio id="beep" preload="auto" src="https://www.peter-weinberg.com/files/1014/8073/6015/BeepSound.wav"></audio>
			</div>
		)
	}
}
// AUDIO SRC IS FROM Peter Weinberg, the shortened link is https://goo.gl/65cBl1 but it does not work on codepen, so full link is used

// component responsible for creating Session Length & Break Length
class LengthController extends React.Component {
  render(){
    return(
      <div className="length-control" style={this.props.borderEdit}>
        <div id={this.props.controllerLabel}>
          {this.props.controllerLabelText}
        </div>
        <button className="btn-level" 
          id={this.props.decrement} 
          value="-" 
          onClick={this.props.setValue} >
          <i className="fa fa-arrow-down fa-2x"></i>
        </button>
        <div className="btn-level" 
          id={this.props.length}>
          {this.props.lengthValue}
        </div>
        <button className="btn-level" 
          id={this.props.increment} 
          value="+"
          onClick={this.props.setValue}>
          <i className="fa fa-arrow-up fa-2x"></i>
        </button>
      </div>
    )
  }
}


(function() {
  window.accurateInterval = function(fn, time) {
    var cancel, nextAt, timeout, wrapper;
    nextAt = new Date().getTime() + time;
    timeout = null;
    wrapper = function() {
      nextAt += time;
      timeout = setTimeout(wrapper, nextAt - new Date().getTime());
      return fn();
    };
    cancel = function() {
      return clearTimeout(timeout);
    };
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return {
      cancel: cancel
    };
  };
}).call(this);


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


