/*
 * @Description: 用户管道管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-13 15:38:12
 * @LastEditors  : RXC 呉見華
 * @LastEditTime : 2020-01-10 14:20:06
 */

import { Pipe, PipeTransform } from '@angular/core';
import { CommonService } from '@core';

@Pipe({
  name: 'user'
})
export class UserPipe implements PipeTransform {
  constructor(private common: CommonService) {}

  /**
   * @description: 用户转换
   */
  transform(value: string | any[]): string | string[] {
    const userList = this.common.getUserList();

    if (typeof value === 'string') {
      const user = userList.find(u => u.value === value);
      if (user) {
        return user.label;
      }
      return '';
    } else {
      const names: any[] = [];
      if (value) {
        value.forEach(v => {
          const users = userList.filter(u => u.value === v);
          users.forEach(e => {
            names.push(e.label);
          });
        });
      }
      return names;
    }
  }
}
