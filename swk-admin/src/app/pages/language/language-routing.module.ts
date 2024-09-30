/*
 * @Description: 多语言路由模块
 * @Author: RXC 廖云江
 * @Date: 2019-09-10 13:25:26
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2019-09-11 09:40:08
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LanguageListComponent } from './language-list/language-list.component';

// 用户路由
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        component: LanguageListComponent,
        data: {
          title: 'route.languageList',
          breadcrumb: 'route.languageList'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LanguageRoutingModule {}
