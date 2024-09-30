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
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { ActionFormComponent } from './action/action-form/action-form.component';
import { ActionListComponent } from './action/action-list/action-list.component';
import { AllowFormComponent } from './allow/allow-form/allow-form.component';
import { AllowListComponent } from './allow/allow-list/allow-list.component';
import { ConfigRoutingModule } from './config-routing.module';
import { LevelFormComponent } from './level/level-form/level-form.component';
import { LevelListComponent } from './level/level-list/level-list.component';

@NgModule({
  declarations: [ActionListComponent, ActionFormComponent, LevelFormComponent, LevelListComponent, AllowListComponent, AllowFormComponent],
  imports: [
    SharedModule,
    ConfigRoutingModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzSpaceModule,
    NzButtonModule,
    NzCollapseModule,
    NzTableModule,
    NzDropDownModule,
    NzResizableModule,
    NzIconModule,
    NzTabsModule
  ]
})
export class ConfigModule {}
