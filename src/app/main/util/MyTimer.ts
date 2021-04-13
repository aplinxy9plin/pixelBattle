export class MyTimer {
  secondsLeft = 10;
  constructor(time: number = 10) {
    this.secondsLeft = time
  }

  start(time: number = 10){
    this.secondsLeft = time;
    this.tick();
  }

  tick() {
    this.secondsLeft--;
    if(this.secondsLeft <= 0){
      return
    }
    setTimeout(()=> {this.tick()}, 1000)
  }
}
