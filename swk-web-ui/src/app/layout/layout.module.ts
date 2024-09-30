import { NgModule } from '@angular/core';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { SharedModule } from '@shared';

import { HeaderHelpComponent } from './default/components/header/header-help.component';
import { HeaderI18nComponent } from './default/components/header/header-i18n.component';
import { HeaderLogoComponent } from './default/components/header/header-logo.component';
import { HeaderMonthComponent } from './default/components/header/header-month.component';
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
import { HeaderDateComponent } from './default/components/header/header-date.component';

const SETTINGDRAWER = [AppValidSelectComponent];

const COMPONENTS = [DefaultLayoutComponent, FullscreenComponent];

const HEADERCOMPONENTS = [
  HeaderLogoComponent,
  HeaderMonthComponent,
  HeaderSelectComponent,
  HeaderDateComponent,
  ThemePickerComponent,
  HeaderI18nComponent,
  HeaderUserComponent,
  HeaderNotifyComponent,
  TaskListComponent,
  HeaderHelpComponent,
  HeaderQaComponent,
  HeaderProfileComponent,
  HeaderQaHelpComponent,
  AppValidSelectComponent
];

@NgModule({
  imports: [SharedModule, LoadingBarRouterModule],
  entryComponents: SETTINGDRAWER,
  declarations: [...COMPONENTS, ...HEADERCOMPONENTS],
  exports: [...COMPONENTS]
})
export class LayoutModule {}
