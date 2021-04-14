import {Injectable, OnInit} from '@angular/core';
import {CustomNotification, NotifyService} from '../notify/notify.service';
import {environment} from '../../environments/environment';

export class Message {
  type : string = "";
  data : any = "";

  constructor(type: string, data: any) {
    this.data = data;
    this.type = type;
  }
  json(): string{
    return JSON.stringify(this)
  }
}

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnInit{
  url = (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + "//"+environment.host+"/socket/";
  ws: WebSocket | null = null;
  key = "";
  constructor(private notifyService: NotifyService) {}

  ngOnInit(): void {}

  connect(){
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      this.notifyService.success("connected");
      this.ws?.send(new Message("key", this.getKey()).json())
    };
    this.ws.onclose = () =>  {
      this.notifyService.error("connection closed reconnect in 5 sec");
      setTimeout(()=> this.reconnect(), 5000)
    };
    this.ws.onmessage = (data) => {
      let m = JSON.parse(data.data);
      switch (m.type) {
        case "image":
          this.onImage(JSON.parse(m.data));
          break;
        case "change":
          this.onChange(m.data);
          break;
        case "changemulti":
          this.onChange(m.data);
          break;
        case "error":
          this.notifyService.error(m.data);
      }
    }
  }

  sendCoordinates(x: number, y: number, color: string){
    this.ws?.send(new Message("setvalue", `${x}|${y}|${this.getKey()}|${color}`).json())
  }

  onImage = (data: string[][]) =>{};
  onChange = (data: string) =>{};
  onChangeMulti = (data: string[]) =>{};

  reconnect(){
    this.notifyService.error("reconnecting");
    this.connect()
  }

  makeId(length: number): string{
    let result           = [];
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() *
        charactersLength)));
    }
    return result.join('');
  }

  getKey(): string {
    if(this.key == ""){
      let key = localStorage.getItem("socketKey");
      if(key == null){
        key = this.makeId( 15);
        localStorage.setItem("socketKey", key);
        return key
      }else {
        return key
      }
    }else{
      return this.key
    }
  }
}
