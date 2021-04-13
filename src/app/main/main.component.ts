import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PickerData, Styles} from './util/styles';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  isMouseDown = false;
  canvasWidth = 100;

  gameH = 100;
  gameW = 50;

  pixelSize = 0;

  dx = 0;
  dy = 0;
  lastMove = [0, 0];

  selected = [-1, -1];

  grey = '240,240,240';

  prevDiff: number = 0;

  maxPixelSize = 100;

  image: Array<Array<string>> = [];

  styles: Styles = new Styles();
  picker: PickerData = new PickerData();

  @ViewChild('canvasElement', {static: true}) canvas: ElementRef<HTMLCanvasElement> | undefined;
  ctx: CanvasRenderingContext2D | null = null;

  constructor() {
  }

  ngOnInit(): void {
    this.initCanvas();
    this.setColorToViewer(this.picker.get());
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
    }
  }

  touchZoomOut(evt: TouchEvent){
    let curDiff = Math.abs(evt.touches[0].clientX - evt.touches[1].clientX);
    let curDiffY = Math.abs(evt.touches[0].clientY - evt.touches[1].clientY);
    if (this.prevDiff > 0) {
      if (curDiff > this.prevDiff) {
        console.log("Pinch moving OUT -> Zoom in");
        this.pixelSize += (curDiff - this.prevDiff)/this.gameH;
        if(this.pixelSize > this.maxPixelSize){
          this.pixelSize = this.maxPixelSize;
        }
      }
      if (curDiff < this.prevDiff) {
        console.log("Pinch moving IN -> Zoom out");
        this.pixelSize -= (this.prevDiff - curDiff)/this.gameH;
        if(this.pixelSize < 1){
          this.pixelSize = 1
        }
      }
    }
  }

  zoomOut() {
    this.pixelSize = this.pixelSize * 1.1;
    this.drawImage();
    console.log(this.pixelSize)
  }

  zoomIn() {
    if (this.pixelSize > 2) {
      this.pixelSize = Math.floor(this.pixelSize * 0.9);
      this.drawImage();
    }
    console.log(this.pixelSize)
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
    this.image = new Array(this.gameH)
      .fill(null)
      .map(() => new Array(this.gameW)
        .fill(this.grey));
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

  setColorToViewer(colorCodes: string){
    this.styles.coloPickerStyle = `background-color: rgb(${colorCodes})`
  }

  setToPixel(){
    if(this.selected[0] > -1 && this.selected[0] < this.gameH && this.selected[1] > -1 && this.selected[1] < this.gameW ){
      this.image[this.selected[0]][this.selected[1]] = this.picker.get();
      this.drawImage();
    }
  }
}


