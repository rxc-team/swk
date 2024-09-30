/*
 * @Description: 全屏控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-04-22 10:19:56
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2019-09-04 10:51:10
 */

import { filter, map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, HostListener, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TitleService } from '@core';

@Component({
  selector: 'app-fullscreen',
  templateUrl: './fullscreen.component.html',
  styleUrls: ['./fullscreen.component.less']
})
export class FullscreenComponent {
  canvas: any;
  width: number;
  height: number;
  ctx: any;
  points = [];
  @ViewChild('content', { static: true })
  element: ElementRef;

  constructor(
    private title: TitleService,
    private httpClient: HttpClient,
    private router: Router,
    private renderer2: Renderer2,
    private activatedRoute: ActivatedRoute
  ) {
    this.httpClient.get('ping');
    // 路由事件
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter(route => route.outlet === 'primary')
      )
      .subscribe(event => {
        this.title.setTitle();
      });
  }

  /**
   * @description: 添加Canvas到画面
   */
  appendCanvas() {
    this.renderer2.appendChild(this.element.nativeElement, this.canvas);
  }

  /**
   * @description: 获取点
   * @return: 返回点的位置
   */
  getPoint() {
    const x = Math.ceil(Math.random() * this.width),
      y = Math.ceil(Math.random() * this.height),
      r = +(Math.random() * 2).toFixed(4),
      rateX = +(Math.random() * 2 - 1).toFixed(4),
      rateY = +(Math.random() * 2 - 1).toFixed(4);

    return { x, y, r, rateX, rateY };
  }

  /**
   * @description: 开启移动
   */
  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawPoints();
    this.drawLines();
    window.requestAnimationFrame(this.draw.bind(this));
  }

  /**
   * @description: 画点
   */
  drawPoints() {
    this.points.forEach((item, i) => {
      this.ctx.beginPath();
      this.ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2, false);
      this.ctx.fillStyle = '#ccc';
      this.ctx.fill();
      if (item.x > 0 && item.x < this.width && item.y > 0 && item.y < this.height) {
        item.x += item.rateX * (this.width / 10000);
        item.y += item.rateY * (this.width / 10000);
      } else {
        this.points.splice(i, 1);
        this.points.push(this.getPoint());
      }
    });
  }

  /**
   * @description: 判断位置是否相同
   * @return: 返回位置
   */
  dis(x1, y1, x2, y2) {
    const disX = Math.abs(x1 - x2),
      disY = Math.abs(y1 - y2);

    return Math.sqrt(disX * disX + disY * disY);
  }

  /**
   * @description: 画线
   */
  drawLines() {
    const len = this.points.length;
    // 对圆心坐标进行两两判断
    for (let i = 0; i < len; i++) {
      for (let j = len - 1; j >= 0; j--) {
        const x1 = this.points[i].x,
          y1 = this.points[i].y,
          x2 = this.points[j].x,
          y2 = this.points[j].y,
          disPoint = this.dis(x1, y1, x2, y2);

        if (disPoint <= this.width / 10) {
          this.ctx.beginPath();
          this.ctx.moveTo(x1, y1);
          this.ctx.lineTo(x2, y2);
          this.ctx.strokeStyle = '#ccc';
          // 两点之间距离越大，线越细，反之亦然
          this.ctx.lineWidth = 1 - disPoint / (this.width / 10);
          this.ctx.stroke();
        }
      }
    }
  }

  /**
   * @description: 页面初始化
   */
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit(): void {
    this.initCanvas();
    this.draw();
  }

  /**
   * @description: 初始化背景画布
   */
  initCanvas() {
    // this.renderer2.setStyle(this.element.nativeElement, 'width', `${window.innerWidth}px`);
    // this.renderer2.setStyle(this.element.nativeElement, 'height', `${window.innerHeight}px`);
    this.width = window.innerWidth - 10;
    this.height = window.innerHeight - 10;
    this.canvas = this.renderer2.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.zIndex = '1000';
  }

  /**
   * @description: view初始化
   */
  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit(): void {
    this.appendCanvas();
    for (let i = 0; i < 100; i++) {
      this.points.push(this.getPoint());
    }
  }

  /**
   * @description: 画面サイズ再定義
   */
  @HostListener('window:resize')
  resize() {
    this.initCanvas();
    this.draw();
  }
}
