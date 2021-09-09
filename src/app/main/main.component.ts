import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { ColorSketchModule } from 'ngx-color/sketch';
import {PickerData, Styles} from './util/styles';
import {CustomNotification, NotifyService} from '../notify/notify.service';
import {SocketService} from '../socket-service/socket.service';
import {Time} from '@angular/common';
import {MyTimer} from './util/MyTimer';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  // imports: [
  //   ColorSketchModule, // added to imports
  // ],
})

export class MainComponent implements OnInit {

  isMouseDown = false;
  canvasWidth = 100;

  timeMillis = 0;

  gameH = 100;
  gameW = 50;

  pixelSize = 0;

  timer: MyTimer = new MyTimer();

  dx = 0;
  dy = 0;
  lastMove = [0, 0];

  selected = [-1, -1];

  grey = '240,240,240';

  prevDiff: number = 0;

  maxPixelSize = 100;

  testColor = "#fff"

  image: Array<Array<string>> = [];

  styles: Styles = new Styles();
  picker: PickerData = new PickerData();

  @ViewChild('canvasElement', {static: true}) canvas: ElementRef<HTMLCanvasElement> | undefined;
  ctx: CanvasRenderingContext2D | null = null;

  constructor(private notifyService: NotifyService, private socket: SocketService) {}

  ngOnInit(): void {
    this.restoreState();
    this.setColorToViewer(this.picker.get());
    this.socket.connect();
    this.socket.onImage = (arr) => {
      this.image = arr;
      this.gameH = arr.length;
      this.gameW = arr[0].length;
      this.initCanvas();
      this.drawImage();
    };
    this.socket.onChange = (str) => {
      let g = str.split("|");
      this.image[+g[0]][+g[1]] = g[3];
      this.drawImage();
    };
    this.socket.onChangeMulti = (str) => {
      str.forEach(i => {
        let g = i.split("|");
        this.image[+g[0]][+g[1]] = g[3];
      });
      this.drawImage();
    };
    this.timer.start(0);
  }

  touchstart(evt: TouchEvent) {
    if(evt.touches.length > 1){
      this.prevDiff = Math.abs(evt.touches[0].clientX - evt.touches[1].clientX);
    }
    if(evt.touches.length > 0){
      this.isMouseDown = true;
      this.lastMove = [evt.touches[0].clientX, evt.touches[0].clientY]
    }
  }

  touchmove(evt: TouchEvent) {
    if(evt.touches.length > 1){
      this.touchZoomOut(evt)
    }
    if (this.isMouseDown) {
      this.dx += evt.touches[0].clientX - this.lastMove[0];
      this.dy += evt.touches[0].clientY - this.lastMove[1];
      this.lastMove = [evt.touches[0].clientX, evt.touches[0].clientY];

    }
    this.saveState();
    this.drawImage();
  }

  touchEnd(evt: TouchEvent) {
    this.isMouseDown = false;
  }

  mouseMove(evt: MouseEvent) {
    if (this.isMouseDown) {
      this.dx += evt.x - this.lastMove[0];
      this.dy += evt.y - this.lastMove[1];
      this.lastMove = [evt.x, evt.y];
      this.drawImage();
      this.saveState();
    }
  }

  restoreState(){
    let ps = localStorage.getItem("ps");
    let dy = localStorage.getItem("dy");
    let dx = localStorage.getItem("dx");
    if (ps != null) {
      this.pixelSize = +ps;
    }
    if (dy != null) {
      this.dy = +dy;
    }
    if (dx != null) {
      this.dx = +dx;
    }
  }

  async saveState(){
    let t = Math.floor(Date.now());
    if(t - this.timeMillis > 500){
      localStorage.setItem("dx", this.dx+"");
      localStorage.setItem("dy", this.dy+"");
      localStorage.setItem("ps", this.pixelSize+"");
      this.timeMillis = t
    }
  }

  touchZoomOut(evt: TouchEvent){
    let curDiff = Math.abs(evt.touches[0].clientX - evt.touches[1].clientX);
    let curDiffY = Math.abs(evt.touches[0].clientY - evt.touches[1].clientY);
    if (this.prevDiff > 0) {
      if (curDiff > this.prevDiff) {
        this.pixelSize += (curDiff - this.prevDiff)/this.gameH;
        if(this.pixelSize > this.maxPixelSize){
          this.pixelSize = this.maxPixelSize;
        }
      }
      if (curDiff < this.prevDiff) {
        this.pixelSize -= (this.prevDiff - curDiff)/this.gameH;
        if(this.pixelSize < 1){
          this.pixelSize = 1
        }
      }
    }
  }

  zoomOut() {
    if(this.pixelSize < this.maxPixelSize){
      this.pixelSize = this.pixelSize * 1.1;
      this.drawImage();
      this.saveState();
    }
  }

  zoomIn() {
    if (this.pixelSize > 2) {
      this.pixelSize = Math.floor(this.pixelSize * 0.9);
      this.drawImage();
      this.saveState();
    }
  }

  mouseDown(evt: MouseEvent) {
    this.isMouseDown = true;
    this.lastMove = [evt.x, evt.y]
  }

  mouseUp(evt: MouseEvent) {
    this.isMouseDown = false;
    this.selected = this.getPixelLocation(evt.x, evt.y);
    this.drawImage()
  }

  initCanvas() {
    if (this.canvas !== undefined) {
      this.ctx = this.canvas.nativeElement.getContext('2d');
      this.canvas.nativeElement.width = window.innerWidth;
      this.canvas.nativeElement.height = window.innerHeight;
      this.canvasWidth = this.canvas.nativeElement.width;
      this.canvas.nativeElement.addEventListener("touchstart", (t: TouchEvent)=> this.touchstart(t));
      this.canvas.nativeElement.addEventListener("touchmove", (t: TouchEvent)=> this.touchmove(t));
      this.canvas.nativeElement.addEventListener("touchend", (t: TouchEvent)=> this.touchEnd(t));
    }
    this.pixelSize = this.canvasWidth / this.gameH;
    this.drawImage();
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  drawImage() {
    if (this.ctx != null) {
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = 0; i < this.gameH; i++) {
        for (let j = 0; j < this.gameW; j++) {
          this.ctx.fillStyle = 'rgb(' + this.image[i][j] + ')';
          this.ctx.fillRect(i * this.pixelSize + this.dx, j * this.pixelSize + this.dy, this.pixelSize, this.pixelSize);
          if (this.pixelSize > 10) {
            if(this.selected[0] == i && this.selected[1] == j){
              this.ctx.strokeStyle = 'rgb(0,0,0)';
            }else{
              this.ctx.strokeStyle = 'rgb(255,255,255)';
            }
            this.ctx.strokeRect(i * this.pixelSize + this.dx, j * this.pixelSize + this.dy, this.pixelSize, this.pixelSize);
          }
        }
      }
    }
  }

  randomColor(): string {
    return `${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)}`
  }

  getPixelLocation(x: number, y: number): Array<number>{
    return [Math.floor((x - this.dx) / this.pixelSize), Math.floor((y - this.dy) / this.pixelSize)]
  }

  setColorToViewer(d: any){
    // console.log(d)
    // console.log(d?.color?.hex)
    this.styles.coloPickerStyle = d?.color?.rgb.r + "," + d?.color?.rgb.g + "," + d?.color?.rgb.b
  }

  setToPixel(){
    console.log('pressed')
    if(this.selected[0] > -1 && this.selected[0] < this.gameH && this.selected[1] > -1 && this.selected[1] < this.gameW ){
      let c = this.styles.coloPickerStyle;
      console.log(this.styles.coloPickerStyle)
      this.timer.start(3);
      this.socket.sendCoordinates(this.selected[0], this.selected[1], c);
      this.drawImage();
    }
  }
}


