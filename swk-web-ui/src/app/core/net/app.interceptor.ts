import { NgEventBus } from 'ng-event-bus';
import { Observable, of, throwError } from 'rxjs';
import { mergeMap, switchMap, takeUntil } from 'rxjs/operators';

import {
    HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpResponseBase
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HttpCancelService } from '../services/http-cancel.service';
import { TokenStorageService } from '../services/token.service';

@Injectable()
export class AppInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenStorageService, private event: NgEventBus, private httpCancelService: HttpCancelService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<Object>> {
    const authReq = this.injectApp(req);

    return next.handle(authReq).pipe(
      takeUntil(this.httpCancelService.onCancelPendingRequests()),
      mergeMap((event: any) => {
        return this.handleData(event);
      })
    );
  }

  private handleData(ev: HttpResponseBase): Observable<any> {
    if (ev instanceof HttpResponse) {
      const body = ev.body;

      if (body.status === 1) {
        if (body.message === 'app-not-match') {
          this.event.cast('currentApp:match', 'currentApp not match');
          return throwError('app not match');
        }
        if (body.message === 'app-not-exist' || body.message === 'app-expired') {
          this.event.cast('currentApp:invalid', 'currentApp invalid');
          return throwError('app not exist or expired');
        }
      }
    }

    return of(ev);
  }

  injectApp(request: HttpRequest<any>) {
    const app = this.tokenService.getUserApp();
    return request.clone({
      setHeaders: {
        App: app || ''
      }
    });
  }
}
