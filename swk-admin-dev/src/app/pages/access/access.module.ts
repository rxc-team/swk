import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzUploadModule } from 'ng-zorro-antd/upload';

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { AccessRoutingModule } from './access-routing.module';
import { RoleFormComponent } from './role/role-form/role-form.component';
import { RoleListComponent } from './role/role-list/role-list.component';
import { UserFormComponent } from './user/user-form/user-form.component';
import { UserListComponent } from './user/user-list/user-list.component';

@NgModule({
  declarations: [UserListComponent, UserFormComponent, RoleListComponent, RoleFormComponent],
  imports: [
    AccessRoutingModule,
    SharedModule,
    NzTableModule,
    NzButtonModule,
    NzFormModule,
    NzToolTipModule,
    NzSpaceModule,
    NzCheckboxModule,
    NzInputModule,
    NzTreeModule,
    NzSelectModule,
    NzDropDownModule,
    NzAvatarModule,
    NzUploadModule,
    NzCardModule,
    NzCollapseModule
  ]
})
export class AccessModule {}
