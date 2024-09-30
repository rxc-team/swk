import { NzBytesPipe } from 'ng-zorro-antd/pipes';

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { AppCopyComponent } from './app-copy/app-copy.component';
import { AppListComponent } from './app-list/app-list.component';
import { CustomerRoutingModule } from './customer-routing.module';
import { SettingComponent } from './setting/setting.component';

const SETTINGDRAWER = [AppCopyComponent];

@NgModule({
  declarations: [SettingComponent, AppCopyComponent, AppListComponent],
  entryComponents: SETTINGDRAWER,
  providers: [NzBytesPipe],
  imports: [SharedModule, CustomerRoutingModule]
})
export class CustomerModule {}
