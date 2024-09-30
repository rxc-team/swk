import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoleFormComponent } from './role/role-form/role-form.component';
import { RoleResolverService } from './role/role-form/role-resolver.service';
import { RoleListComponent } from './role/role-list/role-list.component';
import { CanDeactivateUserinfoGuard } from './user/user-form/can-deactivate-userinfo.guard';
import { UserFormComponent } from './user/user-form/user-form.component';
import { UserListComponent } from './user/user-list/user-list.component';

const routes: Routes = [
  {
    path: 'role',
    children: [
      {
        path: 'list',
        component: RoleListComponent,
        data: {
          title: 'route.roleList',
          breadcrumb: 'route.roleList'
        }
      },
      {
        path: 'add',
        component: RoleFormComponent,
        resolve: {
          roleData: RoleResolverService
        },
        data: {
          title: 'route.roleAdd',
          canBack: true,
          breadcrumb: 'route.roleAdd'
        }
      },
      {
        path: 'edit/:id',
        component: RoleFormComponent,
        resolve: {
          roleData: RoleResolverService
        },
        data: {
          title: 'route.roleEdit',
          canBack: true,
          breadcrumb: 'route.roleEdit'
        }
      }
    ]
  },
  {
    path: 'user',
    children: [
      {
        path: 'list',
        component: UserListComponent,
        data: {
          title: 'route.userList',
          breadcrumb: 'route.userList'
        }
      },
      {
        path: 'add',
        component: UserFormComponent,
        data: {
          title: 'route.userAdd',
          canBack: true,
          breadcrumb: 'route.userAdd'
        }
      },
      {
        path: 'edit/:id',
        component: UserFormComponent,
        data: {
          title: 'route.userEdit',
          canBack: true,
          breadcrumb: 'route.userEdit'
        },
        canDeactivate: [CanDeactivateUserinfoGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccessRoutingModule {}
