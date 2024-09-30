/*
 * @Author: RXC 呉見華
 * @Date: 2020-01-10 13:57:06
 * @LastEditTime: 2020-01-10 13:59:16
 * @LastEditors: RXC 呉見華
 */
import { Pipe, PipeTransform } from '@angular/core';
import { RoleService } from '@api';
import { CommonService, SelectItem } from '@core';

@Pipe({
  name: 'role'
})
export class RolePipe implements PipeTransform {
  constructor(private roleService: RoleService) {}

  async transform(value: string[]) {
    const roleList: Array<SelectItem> = [];
    // 获取角色数据
    await this.roleService.getRoles().then((data: any[]) => {
      if (data) {
        data.forEach(role => {
          roleList.push({ label: role.role_name, value: role.role_id });
        });
      }
    });
    const names: any[] = [];
    if (roleList) {
      if (value) {
        value.forEach(v => {
          const roles = roleList.filter(r => r.value === v);
          roles.forEach(e => {
            names.push(e.label);
          });
        });
      }
    }
    return names;
  }
}
