/*
 * @Author: RXC 呉見華
 * @Date: 2020-01-14 17:20:06
 * @LastEditTime : 2020-01-14 17:23:52
 * @LastEditors  : RXC 呉見華
 * @Description: 动画加载服务
 */

import { Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

interface Spinner {
  name: string;
  loading: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private loadingSubject = new Subject<Spinner>();

  constructor() {}

  getLoding(): Observable<Spinner> {
    return this.loadingSubject.asObservable();
  }

  show(name: string) {
    this.loadingSubject.next({ name: name, loading: true });
  }

  hide(name: string) {
    this.loadingSubject.next({ name: name, loading: false });
  }
}
