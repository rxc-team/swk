import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { BaseSettingComponent } from './base-setting/base-setting.component';
import { MailSettingComponent } from './mail-setting/mail-setting.component';
import { SafeSettingComponent } from './safe-setting/safe-setting.component';
import { SettingRoutingModule } from './setting-routing.module';
import { SettingComponent } from './setting.component';

@NgModule({
  declarations: [SettingComponent, BaseSettingComponent, SafeSettingComponent, MailSettingComponent],
  imports: [
    SharedModule,
    SettingRoutingModule,
    NzCardModule,
    NzTabsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzSpaceModule,
    NzSwitchModule,
    NzButtonModule,
    NzCollapseModule,
    NzTableModule,
    NzDropDownModule,
    NzToolTipModule,
    NzUploadModule,
    NzAvatarModule,
    NzResizableModule,
    NzIconModule
  ]
})
export class SettingModule {}
