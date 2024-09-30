/*
 * @Description: 布局module管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-23 15:51:26
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-04-26 17:28:32
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { HeaderHelpComponent } from './default/components/header/header-help.component';
import { HeaderI18nComponent } from './default/components/header/header-i18n.component';
import { HeaderLogoComponent } from './default/components/header/header-logo.component';
import { HeaderNotifyComponent } from './default/components/header/header-notify.component';
import { HeaderProfileComponent } from './default/components/header/header-profile.component';
import { HeaderQaHelpComponent } from './default/components/header/header-qa-help.component';
import { HeaderQaComponent } from './default/components/header/header-qa.component';
import { HeaderSelectComponent } from './default/components/header/header-select.component';
import { HeaderUserComponent } from './default/components/header/header-user.component';
import { ThemePickerComponent } from './default/components/header/theme-picker.component';
import { TaskListComponent } from './default/components/task-list/task-list.component';
import { DefaultLayoutComponent } from './default/default-layout.component';
import { FullscreenComponent } from './fullscreen/fullscreen.component';
import { AppValidSelectComponent } from './valid/app-valid-select.component';

const SETTINGDRAWER = [AppValidSelectComponent];

const COMPONENTS = [DefaultLayoutComponent, FullscreenComponent];

const HEADERCOMPONENTS = [
  HeaderLogoComponent,
  ThemePickerComponent,
  HeaderSelectComponent,
  HeaderI18nComponent,
  HeaderUserComponent,
  HeaderNotifyComponent,
  HeaderQaComponent,
  HeaderQaHelpComponent,
  HeaderHelpComponent,
  HeaderProfileComponent,
  TaskListComponent,
  AppValidSelectComponent
];

@NgModule({
  imports: [SharedModule],
  entryComponents: SETTINGDRAWER,
  declarations: [...COMPONENTS, ...HEADERCOMPONENTS],
  exports: [...COMPONENTS]
})
export class LayoutModule {}
