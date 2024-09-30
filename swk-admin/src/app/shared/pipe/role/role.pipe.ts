/*
 * @Author: RXC 呉見華
 * @Date: 2020-01-10 13:57:06
 * @LastEditTime: 2020-01-10 13:59:16
 * @LastEditors: RXC 呉見華
 */

import { Pipe, PipeTransform } from '@angular/core';
import { RoleService } from '@api';

export interface SelectItem {
  label: string;
  value: string;
}

@Pipe({
  name: 'role'
})
export class RolePipe implements PipeTransform {
  constructor(private roleService: RoleService) {}

  async transform(value: string | string[]) {
    const roleList: Array<SelectItem> = [];
    await this.roleService.getRoles().then(data => {
      if (data) {
        data.forEach(role => {
          roleList.push({ label: role.role_name, value: role.role_id });
        });
      }
    });
    if (typeof value === 'string') {
      const role = roleList.find(u => u.value === value);
      if (role) {
        return role.label;
      }
      return '';
    } else {
      const names: any[] = [];
      if (value) {
        value.forEach(v => {
          const roles = roleList.filter(r => r.value === v);
          roles.forEach(e => {
            names.push(e.label);
          });
        });
      }
      return names;
    }
  }
}
