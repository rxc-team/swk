/*
 * @Description: 选项路由module
 * @Author: RXC 廖欣星
 * @Date: 2019-05-16 09:49:00
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2019-09-04 14:54:16
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OptionAddComponent } from './option-add/option-add.component';
import { OptionListComponent } from './option-list/option-list.component';

// 用户路由
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        component: OptionListComponent,
        data: {
          title: 'route.optionList',
          breadcrumb: 'route.optionList'
        }
      },
      {
        path: 'add',
        component: OptionAddComponent,
        data: {
          title: 'route.optionAdd',
          canBack: true,
          breadcrumb: 'route.optionAdd'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OptionRoutingModule {}
