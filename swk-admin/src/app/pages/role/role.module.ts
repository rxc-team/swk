/*
 * @Description: 角色module
 * @Author: RXC 廖欣星
 * @Date: 2019-04-22 14:44:48
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2019-07-31 17:26:47
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { RoleFormComponent } from './role-form/role-form.component';
import { RoleListComponent } from './role-list/role-list.component';
import { RoleRoutingModule } from './role-routing.module';

@NgModule({
  declarations: [RoleListComponent, RoleFormComponent],
  imports: [SharedModule, RoleRoutingModule]
})
export class RoleModule {}
