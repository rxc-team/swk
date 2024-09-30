/*
 * @Description: 安全守卫设置
 * @Author: RXC 廖欣星
 * @Date: 2019-04-16 15:39:16
 * @LastEditors: RXC 廖欣星
 * @LastEditTime: 2019-06-20 13:59:02
 */
import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot
} from '@angular/router';

import { TokenStorageService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  // 构造函数
  constructor(private router: Router, private tokenService: TokenStorageService) {}

  /**
   * @description: 激活
   * @return: 返回登录结果
   */
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkLogin();
  }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.canActivate(next, state);
  }

  /**
   * @description: 检查是否登录
   * @return: 返回登录结果
   */
  checkLogin(): boolean {
    if (this.tokenService.isLogin()) {
      return true;
    }
    // Navigate to the login page with extras
    this.router.navigate(['/login']);
    return false;
  }
}
