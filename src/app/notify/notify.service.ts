import {EventEmitter, Injectable} from '@angular/core';

export class CustomNotification {
  type: number;
  message: string;
  constructor(type = 0, message = "") {
    this.type = type;
    this.message  = message;

  }
}
@Injectable({
  providedIn: 'root'
})
export class NotifyService {
  message = new EventEmitter<CustomNotification>();
  constructor() {

  }
  error(message: string){
    this.message.emit(new CustomNotification(1, message))
  }

  notification(message: string){
    this.message.emit(new CustomNotification(0, message))
  }

  success(message: string){
    this.message.emit(new CustomNotification(2, message))
  }
}
