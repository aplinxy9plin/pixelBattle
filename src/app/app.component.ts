import { Component } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {CustomNotification, NotifyService} from './notify/notify.service';
import {SocketService} from './socket-service/socket.service';

@Component({
  selector: 'app-root',
  animations: [
    trigger('openClose', [
      state('open', style({
        transform: 'translateY(0%)',
      })),
      state('closed', style({
        transform: 'translateY(-100%)',
      })),
      transition('open => closed', [
        animate('0.2s')
      ]),
      transition('closed => open', [
        animate('0.2s')
      ]),
    ]),
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'pixelBattle';
  notification = "fd";
  isNotificationOpen = false;
  notificationStyle = "";
  timer = 4;

  constructor(notify: NotifyService, socketService: SocketService) {
    notify.message.subscribe((m: CustomNotification) => {
      switch (m.type) {
        case 0 : {
          this.notificationStyle = 'background-color: #484848;';
          break;
        }
        case 1 : {
          this.notificationStyle = 'background-color: #BB2A13;';
          break;
        }
        case 2 : {
          this.notificationStyle = 'background-color: #4DB413;';
        }
      }
      this.timer = 4;
      this.startTimer();
      this.isNotificationOpen = true;
      this.notification = m.message;
    });
  }

  startTimer(){
    setTimeout(()=>{
      if(this.timer > 0){
        this.startTimer();
        this.timer --;
      }else {
        this.isNotificationOpen = false;
      }
    },1000)
  }
}
