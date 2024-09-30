/*
 * @Description: 组module管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-23 16:13:44
 * @LastEditors: RXC 廖欣星
 * @LastEditTime: 2019-06-19 09:56:56
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { GroupFormComponent } from './group-form/group-form.component';
import { GroupRoutingModule } from './group-routing.module';
import { GroupTreeComponent } from './group-tree/group-tree.component';

@NgModule({
  declarations: [GroupTreeComponent, GroupFormComponent],
  imports: [SharedModule, GroupRoutingModule]
})
export class GroupModule {}
