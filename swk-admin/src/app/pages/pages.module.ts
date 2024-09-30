/*
 * @Description: 页面module
 * @Author: RXC 廖欣星
 * @Date: 2019-04-22 10:19:56
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-05-27 14:11:24
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { ForgetPasswordComponent } from './full/forget-password/forget-password.component';
import { LoginComponent } from './full/login/login.component';
import { MailActivateComponent } from './full/mail-activate/mail-activate.component';
import { PasswordResetComponent } from './full/password-reset/password-reset.component';
import { SecondCheckComponent } from './full/second-check/second-check.component';
import { HomeComponent } from './home/home.component';
import { PageRoutingModule } from './pages-routing.module';
import { SystemModule } from './system/system.module';

const COMPONENTS = [
  HomeComponent,
  LoginComponent,
  ForgetPasswordComponent,
  MailActivateComponent,
  PasswordResetComponent,
  SecondCheckComponent
];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, PageRoutingModule, SystemModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT
})
export class PagesModule {}
