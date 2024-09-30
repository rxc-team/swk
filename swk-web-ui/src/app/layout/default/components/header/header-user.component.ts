/*
 * @Description: 用户
 * @Author: RXC 呉見華
 * @Date: 2019-04-19 14:35:45
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-07-10 17:35:13
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
}
