import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  isMouseDown = false;
  canvasWidth = 100;

  gameH = 100;
  gameW = 100;

  pixelSize = 0;

  dx = 0;
  dy = 0;
  lastMove = [0,0];

  selected = [-1,-1];

  grey = '240,240,240';

  image: Array<Array<string>> = [];

  @ViewChild('canvasElement', { static: true }) canvas: ElementRef<HTMLCanvasElement> | undefined;
  ctx: CanvasRenderingContext2D | null = null;
  constructor() { }

  ngOnInit(): void {
    this.initCanvas();
  }

  touchstart(evt: TouchEvent){
    if(this.isMouseDown){
      this.dx += evt.touches[0].clientX - this.lastMove[0];
      this.drawImage();
    }
  }



  touchEnd(evt: TouchEvent){
    this.isMouseDown = true;
  }

  mouseMove(evt: MouseEvent){
    if(this.isMouseDown){
      this.dx += evt.x - this.lastMove[0];
      this.dy += evt.y - this.lastMove[1];
      this.lastMove = [evt.x, evt.y];
      this.drawImage();
    }
  }

  zoomOut(){
    this.pixelSize = this.pixelSize * 1.1;
    this.drawImage();
    console.log(this.pixelSize)
  }

  zoomIn(){
    if(this.pixelSize > 2){
      this.pixelSize = Math.floor(this.pixelSize * 0.9);
      this.drawImage();
    }
    console.log(this.pixelSize)
  }

  mouseDown(evt: MouseEvent){
    this.isMouseDown = true;
    this.lastMove = [evt.x, evt.y]
  }

  mouseUp(evt: MouseEvent){
    this.isMouseDown = false;
  }

  initCanvas(){
    if(this.canvas !== undefined){
      this.ctx = this.canvas.nativeElement.getContext('2d');
      this.canvas.nativeElement.width = window.innerWidth;
      this.canvas.nativeElement.height = window.innerHeight;
      this.canvasWidth = this.canvas.nativeElement.width;
      this.canvas.nativeElement.addEventListener("touchstart", this.touchstart)
    }
    this.pixelSize = this.canvasWidth / this.gameH;
    this.image = new Array(this.gameH)
      .fill(null)
      .map(()=>new Array(this.gameW)
        .fill(this.randomColor()));
    this.drawImage();
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async drawImage() {
    if (this.ctx != null) {
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let i = 0; i < this.gameH; i++) {
        for (let j = 0; j < this.gameW; j++) {
          this.ctx.fillStyle = 'rgb(' + this.image[i][j] + ')';
          this.ctx.fillRect(i * this.pixelSize + this.dx, j * this.pixelSize + this.dy, this.pixelSize, this.pixelSize);
          if(this.pixelSize > 10){
            this.ctx.strokeStyle = 'rgb(255,255,255)';
            this.ctx.strokeRect(i * this.pixelSize + this.dx, j * this.pixelSize + this.dy, this.pixelSize, this.pixelSize);
          }
        }
      }
    }
  }

  randomColor(): string{
    return `${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)}`
  }

  pan(){
    console.log("pan")
  }

}
