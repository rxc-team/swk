/**
 * url统一处理,添加前缀,便于使用代理
 */

import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Observable } from 'rxjs';

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { environment } from '@env/environment';

@Injectable()
export class URLInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  get notify(): NzNotificationService {
    return this.injector.get(NzNotificationService);
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.transURL(req));
  }

  transURL(request: HttpRequest<any>) {
    const url = request.url;

    // 本地资源，文件服务器资源，其他全路径请求，直接放行
    if (
      url.startsWith('assets/') ||
      url.startsWith('/storage/') ||
      url.startsWith('https://') ||
      url.startsWith('http://') ||
      url.startsWith('/system/')
    ) {
      return request;
    }

    // 不需要token验证的场合
    if (!request.headers.get('token')) {
      return request.clone({
        url: `${environment.SERVER_URL}${url}`
      });
    }

    return request.clone({
      url: `${environment.SERVER_URL}dev/${url}`
    });
  }
}
