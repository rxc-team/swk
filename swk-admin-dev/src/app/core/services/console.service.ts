/*
 * @Description: websocket服务
 * @Author: RXC 呉見華
 * @Date: 2019-10-10 10:18:25
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-07-03 10:42:13
 */
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConsoleService {
  private socket: Socket;
  constructor() {}

  connect(uid: string) {
    // get location host
    const host = window.location.host;
    const protocol = window.location.protocol;

    this.socket = io(`${protocol}//${host}`, {
      transports: ['websocket'],
      query: {
        uid: uid
      }
    });
  }

  onMessage() {
    return new Observable(observer => {
      this.socket.on('log', msg => {
        const data = JSON.parse(msg);
        observer.next(data);
      });
    });
  }
  onError() {
    return new Observable(observer => {
      this.socket.on('err', msg => {
        observer.next(msg);
      });
    });
  }
}
