/*
 * @Description: 登录守卫
 * @Author: RXC 呉見華
 * @Date: 2019-04-22 10:19:55
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2019-08-30 11:58:01
 */

import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot
} from '@angular/router';
import { TokenStorageService } from '@core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private tokenService: TokenStorageService) {}
  /**
   * @description: 判断能否进入当前路由
   */
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkLogin();
  }
  /**
   * @description: 判断能否进入当前子路由
   */
  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(next, state);
  }

  /**
   * @description: 判断是否登录
   * @return: 登录状态
   */
  checkLogin(): boolean {
    if (this.tokenService.isLogin()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
