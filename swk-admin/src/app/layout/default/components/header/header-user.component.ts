/*
 * @Description: 用户
 * @Author: RXC 呉見華
 * @Date: 2019-04-19 14:35:45
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-08-19 13:34:19
 */

import { Component, Input } from '@angular/core';
import { TokenStorageService } from '@core';

@Component({
  selector: 'app-header-user',
  templateUrl: './header-user.component.html',
  styleUrls: ['./header-user.component.less']
})
export class HeaderUserComponent {
  @Input() isSmall = false;
  userInfo: any = {};

  constructor(private tokenService: TokenStorageService) {
    this.userInfo = this.tokenService.getUser();

    this.tokenService.getUserInfo().subscribe(data => {
      if (data) {
        this.userInfo = data;
      }
    });
  }

  logout() {
    this.tokenService.signOut();
  }
}
