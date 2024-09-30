import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { AppScriptComponent } from './app-script/app-script.component';
import { BuckupInfoComponent } from './buckup-info/buckup-info.component';
import { JobListComponent } from './job-list/job-list.component';
import { ReleaseComponent } from './release/release.component';
import { SystemRoutingModule } from './system-routing.module';
import { TplFormComponent } from './template/tpl-form/tpl-form.component';
import { TplInfoComponent } from './template/tpl-info/tpl-info.component';
import { TplListComponent } from './template/tpl-list/tpl-list.component';
import { UpdateListComponent } from './update-list/update-list.component';

@NgModule({
  declarations: [
    BuckupInfoComponent,
    JobListComponent,
    TplFormComponent,
    TplListComponent,
    TplInfoComponent,
    UpdateListComponent,
    AppScriptComponent,
    ReleaseComponent
  ],
  imports: [
    SharedModule,
    SystemRoutingModule,
    NzSpaceModule,
    NzDescriptionsModule,
    NzDropDownModule,
    NzSkeletonModule,
    NzCodeEditorModule,
    NzCardModule,
    NzFormModule,
    NzSwitchModule,
    NzTabsModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzCollapseModule,
    NzCheckboxModule,
    NzTableModule,
    NzListModule,
    NzTagModule,
    NzStepsModule,
    NzResizableModule,
    NzIconModule
  ]
})
export class SystemModule {}
