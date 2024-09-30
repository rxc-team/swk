import { NgEventBus } from 'ng-event-bus';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

import {
    HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@api';

import { TokenStorageService } from '../services/token.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private tokenService: TokenStorageService, private authService: AuthService, private event: NgEventBus) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<Object>> {
    let authReq = req;
    const token = this.tokenService.getToken();
    if (token != null) {
      authReq = this.injectToken(req, token);
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            if (!error.url.includes('refresh/token')) {
              return this.handle401Error(authReq, next);
            }
            return throwError(error);
          }
          this.event.cast('http:error', error);
        }

        return throwError(error);
      })
    );
  }

  // 通过refresh_token，刷新access_token
  // refresh_token过期时间是8小时
  // access_token过期时间是1小时
  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      const refreshToken = this.tokenService.getRefreshToken();
      if (refreshToken) {
        return this.authService.refreshToken(refreshToken).pipe(
          switchMap((token: any) => {
            this.isRefreshing = false;
            this.tokenService.saveToken(token.access_token);
            this.refreshTokenSubject.next(token.access_token);

            return next.handle(this.injectToken(request, token.access_token));
          }),
          catchError(err => {
            this.isRefreshing = false;

            this.tokenService.signOut(err);
            return throwError(err);
          })
        );
      }
    }
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.injectToken(request, token)))
    );
  }

  injectToken(request: HttpRequest<any>, token: string) {
    const user = this.tokenService.getUser();
    const app = user.current_app || '';
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        App: app
      }
    });
  }
}
