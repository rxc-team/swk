import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { HeaderI18nComponent } from './default/components/header/header-i18n.component';
import { HeaderLogoComponent } from './default/components/header/header-logo.component';
import { HeaderNotifyComponent } from './default/components/header/header-notify.component';
import { HeaderProfileComponent } from './default/components/header/header-profile.component';
import { HeaderUserComponent } from './default/components/header/header-user.component';
import { ThemePickerComponent } from './default/components/header/theme-picker.component';
import { TaskListComponent } from './default/components/task-list/task-list.component';
import { DefaultLayoutComponent } from './default/default-layout.component';
import { FullscreenComponent } from './fullscreen/fullscreen.component';

const SETTINGDRAWER = [];

const COMPONENTS = [DefaultLayoutComponent, FullscreenComponent];

const HEADERCOMPONENTS = [
  HeaderLogoComponent,
  ThemePickerComponent,
  TaskListComponent,
  HeaderNotifyComponent,
  HeaderI18nComponent,
  HeaderUserComponent,
  HeaderProfileComponent
];

@NgModule({
  imports: [
    SharedModule,
    NzLayoutModule,
    NzGridModule,
    NzIconModule,
    NzButtonModule,
    NzMenuModule,
    NzBreadCrumbModule,
    NzDrawerModule,
    NzProgressModule,
    NzCollapseModule,
    NzStepsModule,
    NzPaginationModule,
    NzPopoverModule,
    NzCodeEditorModule,
    NzModalModule,
    NzListModule,
    NzAvatarModule,
    NzSpaceModule,
    NzToolTipModule,
    NzTableModule,
    NzCardModule
  ],
  entryComponents: SETTINGDRAWER,
  declarations: [...COMPONENTS, ...HEADERCOMPONENTS],
  exports: [...COMPONENTS]
})
export class LayoutModule {}
