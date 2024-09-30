/*
 * @Description: 页面module管理
 * @Author: RXC 廖欣星
 * @Date: 2019-04-15 11:51:28
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-05-21 15:27:00
 */
// angular框架类库
import { NgModule } from '@angular/core';
// 自定义服务或控件
import { SharedModule } from '@shared';

import { ForgetPasswordComponent } from './full/forget-password/forget-password.component';
// login
import { LoginComponent } from './full/login/login.component';
import { MailActivateComponent } from './full/mail-activate/mail-activate.component';
import { PasswordResetComponent } from './full/password-reset/password-reset.component';
import { SecondCheckComponent } from './full/second-check/second-check.component';
// dashboard pages
import { HomeComponent } from './home/home.component';
import { PageRoutingModule } from './pages-routing.module';
import { SystemModule } from './system/system.module';

const COMPONENTS = [HomeComponent, LoginComponent, ForgetPasswordComponent, PasswordResetComponent, MailActivateComponent];
const COMPONENTS_NOROUNT = [SecondCheckComponent];

@NgModule({
  imports: [SharedModule, PageRoutingModule, SystemModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT
})
export class PagesModule {}
