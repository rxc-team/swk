/*
 * @Description: websocket服务
 * @Author: RXC 呉見華
 * @Date: 2019-10-10 10:18:25
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-07-03 10:42:13
 */
import { NgEventBus } from 'ng-event-bus';
import { interval, Subject } from 'rxjs';

import { Injectable } from '@angular/core';
import { AuthService } from '@api';
import { environment } from '@env/environment';
import { Store } from '@ngxs/store';
import { RefreshMessage } from '@store';
import { I18NService } from '../i18n/i18n.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  messageSubject: Subject<any>; // subject对象,用于发送事件
  private url; // 默认请求的url
  private webSocket: WebSocket; // websocket对象
  connectSuccess = false; // websocket 连接成功
  period = 60 * 1000 * 5; // 5分钟检查一次
  serverTimeoutSubscription = null; // 定时检测连接对象
  reconnectFlag = false; // 重连
  reconnectPeriod = 5 * 1000; // 重连失败,则5秒钟重连一次
  reconnectSubscription = null; // 重连订阅对象
  runTimeSubscription; // 记录运行连接subscription
  runTimePeriod = 60 * 10000; // 记录运行连接时间

  constructor(private auth: AuthService, private store: Store, private eventBus: NgEventBus, private i18n: I18NService) {
    this.messageSubject = new Subject();
    // console.log('开始心跳检测');
    // 进入程序就进行心跳检测,避免出现开始就连接中断,后续不重连
    this.heartCheckStart();
    this.calcRunTime();
  }

  /**
   * 发送消息
   * @param message 发送消息
   */
  sendMessage(message) {
    this.webSocket.send(message);
  }

  /**
   * 创建新连接
   * @param user 要连接的用户
   */
  connect(user) {
    // get location host
    const host = window.location.host;

    if (environment.production) {
      // set ws protocol when using http and wss when using https
      const pprotocol = window.location.protocol.replace('https', 'wss');
      // websocket instantiation
      const purl = `${pprotocol}//${host}/ws/${user}`;
      if (!!purl) {
        this.url = purl;
      }
      this.createWebSocket();
      return;
    }

    // set ws protocol when using http and wss when using https
    const protocol = window.location.protocol.replace('http', 'ws');
    // websocket instantiation
    const url = `${protocol}//${host}/ws/${user}`;
    if (!!url) {
      this.url = url;
    }
    // 创建websocket对象
    this.createWebSocket();
  }

  /**
   * 创建连接
   */
  createWebSocket() {
    const token = this.auth.getToken();
    // 如果没有建立过连接，才建立连接并且添加时间监听
    this.webSocket = new WebSocket(`${this.url}?token=${token.access_token}`);
    // 建立连接成功
    this.webSocket.onopen = e => this.onOpen(e);
    // 接收到消息
    this.webSocket.onmessage = e => this.onMessage(e);
    // 连接关闭
    this.webSocket.onclose = e => this.onClose(e);
    // 异常
    this.webSocket.onerror = e => this.onError(e);
  }

  /**
   * 连接打开
   * @param e 打开事件
   */
  onOpen(e) {
    // console.log('websocket 已连接');
    // 设置连接成功
    this.connectSuccess = true;
    // 如果是重连中
    if (this.reconnectFlag) {
      // 1.停止重连
      this.stopReconnect();
      // 2.重新开启心跳
      this.heartCheckStart();
      // 3.重新开始计算运行时间
      this.calcRunTime();
    }
  }

  /**
   * 接受到消息
   * @param event 接受消息事件
   */
  onMessage(event) {
    // console.log('接收到的消息', event.data);
    // 将接受到的消息发布出去
    const message = JSON.parse(event.data);
    // console.log('接收到消息时间', new Date().getTime());
    if (message.msg_type === 'job') {
      this.eventBus.cast('refresh-job', message);
      return;
    }
    // 动态刷新多语言
    if (message.msg_type === 'lang') {
      this.i18n.updateDynamicLangData();
      return;
    }

    this.store.dispatch(new RefreshMessage());

    this.messageSubject.next(message);
  }

  /**
   * 连接关闭
   */
  private onClose(e) {
    // console.log('连接关闭', e);
    // console.log(this.webSocket);
    this.connectSuccess = false;
    this.webSocket.close();
    this.webSocket = null;
    // 停止心跳检测
    this.heartCheckStop();
    // 关闭时开始重连
    this.reconnect();
    this.stopRunTime();
    // throw new Error('webSocket connection closed:)');
  }

  /**
   * 连接异常
   */
  private onError(e) {
    // 出现异常时一定会进onClose,所以只在onClose做一次重连动作
    // console.log('连接异常', e);
    this.connectSuccess = false;
    // throw new Error('webSocket connection error:)');
  }

  /**
   * 开始重新连接
   */
  reconnect() {
    // 如果已重连,则直接return,避免重复连接
    if (this.connectSuccess) {
      this.stopReconnect();
      // console.log('已经连接成功,停止重连');
      return;
    }
    // 如果正在连接中,则直接return,避免产生多个轮训事件
    if (this.reconnectFlag) {
      // console.log('正在重连,直接返回');
      return;
    }
    // 开始重连
    this.reconnectFlag = true;
    // 如果没能成功连接,则定时重连
    this.reconnectSubscription = interval(this.reconnectPeriod).subscribe(async val => {
      // console.log(`重连:${val}次`);
      this.createWebSocket();
    });
  }

  /**
   * 停止重连
   */
  stopReconnect() {
    // 连接标识置为false
    this.reconnectFlag = false;
    // 取消订阅
    // console.log('重连状态：', this.reconnectSubscription);
    if (this.reconnectSubscription) {
      // console.log('取消重连');
      this.reconnectSubscription.unsubscribe();
    }
  }

  /**
   * 开始心跳检测
   */
  heartCheckStart() {
    this.serverTimeoutSubscription = interval(this.period).subscribe(val => {
      // 保持连接状态,重置下
      console.log(this.webSocket);
      if (this.webSocket != null && this.webSocket.readyState === 1) {
        // console.log(val, '连接状态，发送消息保持连接');
      } else {
        // 停止心跳
        this.heartCheckStop();
        // 开始重连
        this.reconnect();
        // console.log('连接已断开,重新连接');
      }
    });
  }

  /**
   * 停止心跳检测
   */
  heartCheckStop() {
    // 取消订阅停止心跳
    // console.log('心跳状态：', this.serverTimeoutSubscription);
    if (this.serverTimeoutSubscription) {
      // console.log('已经取消心跳检查');
      this.serverTimeoutSubscription.unsubscribe();
    }
  }

  /**
   * 开始计算运行时间
   */
  calcRunTime() {
    this.runTimeSubscription = interval(this.runTimePeriod).subscribe(period => {
      // console.log('运行时间', `${period}分钟`);
    });
  }

  /**
   * 停止计算运行时间
   */
  stopRunTime() {
    if (this.runTimeSubscription) {
      this.runTimeSubscription.unsubscribe();
    }
  }
}
