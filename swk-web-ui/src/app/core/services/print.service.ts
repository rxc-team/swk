/*
 * @Author: RXC 呉見華
 * @Date: 2020-01-14 17:20:06
 * @LastEditTime : 2020-01-14 17:23:52
 * @LastEditors  : RXC 呉見華
 * @Description: 动画加载服务
 */

import { NgEventBus } from 'ng-event-bus';

import { Injectable } from '@angular/core';

export interface PrintConfig {
  body: string;
  css: string;
}

const a4 = `@media print {
    @page {
      size: A4 portrait;
      margin: 23.3mm 0mm 10mm 7mm;
    }
    .item {
      height: 100%;
      padding: 0;
      width: 245px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
   }
  }`;

const label = `@media print {
    @page {
      size: landscape;
      margin: 0mm 0mm 0mm 0mm;
    }
    .item {
      height: 100%;
      padding: 0;
      width: 245px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
   }
  }`;

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  constructor(private event: NgEventBus) {}

  print(tl: string, id: string, type: string) {
    const title = document.createElement('title');
    const css = document.createElement('style');
    title.textContent = tl;
    css.setAttribute('rel', 'stylesheet');
    switch (type) {
      case 'a4':
        css.textContent = a4;
        break;
      case 'label':
        css.textContent = label;
        break;
      default:
        css.textContent = a4;
        break;
    }
    const printBody = document.querySelector(`#${id}`);
    const body = printBody.innerHTML;

    const div = document.createElement('div');
    div.innerHTML = body;
    div.removeAttribute('hidden');

    const winRef = window.open('', '_blank');
    winRef.document.head.appendChild(title);
    winRef.document.head.appendChild(css);
    winRef.document.body.appendChild(div);

    winRef.print();
    this.event.cast('print:complete', true);
    winRef.close();
  }
}
