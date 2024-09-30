/**
 * Response统一处理
 */

import { NgEventBus } from 'ng-event-bus';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CookieService } from 'ngx-cookie-service';
import { Observable, of } from 'rxjs';
import { mergeMap, timeout } from 'rxjs/operators';

import {
    HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpResponseBase
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Store } from '@ngxs/store';

import { I18NService } from '../i18n/i18n.service';

export interface ResponseBody {
  status: number;
  message: string;
  data: any;
}

/** 超时时间 */
const DEFAULTTIMEOUT = 240000;

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {
  constructor(private injector: Injector, private store: Store) {}

  get notify(): NzNotificationService {
    return this.injector.get(NzNotificationService);
  }

  get i18n(): I18NService {
    return this.injector.get(I18NService);
  }

  get eventBus(): NgEventBus {
    return this.injector.get(NgEventBus);
  }
  get cookie(): CookieService {
    return this.injector.get(CookieService);
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      timeout(DEFAULTTIMEOUT),
      mergeMap((event: any) => {
        return this.handleData(event);
      })
    );
  }

  private handleData(ev: HttpResponseBase): Observable<any> {
    if (ev instanceof HttpResponse) {
      const body: ResponseBody = ev.body;

      const token = ev.headers.get('X-CSRF-Token');
      if (token) {
        this.cookie.set('csrf_token', token, 0, '/');
      }

      if (body.status === undefined || body.status === null) {
        return of(ev);
      }
      switch (body.status) {
        case 0:
          // 表示没有任何错误，可以返回结果
          return of(new HttpResponse(Object.assign(ev, { body: body.data })));
        // case 1:
        //   // 表示有逻辑处理错误,在appinterceptor中处理
        case 2:
          // 表示直接返回后台的错误信息
          this.notify.warning(this.i18n.translateLang('common.message.warningTitle'), body.message);
          return of(new HttpResponse(Object.assign(ev, { body: body })));

        default:
          this.notify.error(this.i18n.translateLang('common.message.errorTitle'), this.i18n.translateLang('common.message.error.E_007'));
          // 继续抛出错误中断后续所有 Pipe、subscribe 操作，因此：
          // this.http.get('/').subscribe() 并不会触发
          return of(ev);
      }
    } else {
      return of(ev);
    }
  }
}
