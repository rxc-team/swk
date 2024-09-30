import { Observable, Observer } from 'rxjs';

import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree
} from '@angular/router';
import { SystemService } from '@api';

@Injectable({
  providedIn: 'root'
})
export class UpdateGuard implements CanActivate {
  constructor(private router: Router, private system: SystemService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkStatus();
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(next, state);
  }

  checkStatus(): Observable<boolean> {
    return new Observable((observer: Observer<boolean>) => {
      this.system.getStatus().then((data: boolean) => {
        if (data) {
          observer.next(false);
          observer.complete();
          this.router.navigate(['/it-support']);
        } else {
          observer.next(true);
          observer.complete();
        }
      });
    });
  }
}
