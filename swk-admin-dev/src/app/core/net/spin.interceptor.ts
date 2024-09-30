/**
 * 显示转圈
 */

import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HttpSpinService } from '../services/http-spin.service';

@Injectable()
export class SpinInterceptor implements HttpInterceptor {
  constructor(private spin: HttpSpinService) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spin.handleRequest('plus');
    return next.handle(req).pipe(finalize(this.finalize.bind(this)));
  }

  finalize = (): void => this.spin.handleRequest();
}
