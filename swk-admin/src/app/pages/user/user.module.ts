/*
 * @Description: 用户module
 * @Author: RXC 廖欣星
 * @Date: 2019-04-28 13:25:26
 * @LastEditors: RXC 廖欣星
 * @LastEditTime: 2019-06-19 13:44:15
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { UserFormComponent } from './user-form/user-form.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserRoutingModule } from './user-routing.module';
import { UploadViewComponent } from './upload-view/upload-view.component';

@NgModule({
  declarations: [UserListComponent, UserFormComponent, UploadViewComponent],
  imports: [SharedModule, UserRoutingModule]
})
export class UserModule {}
