/*
 * @Description: route
 * @Author: RXC 廖云江
 * @Date: 2019-08-06 08:57:40
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2019-10-11 09:27:19
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DocumentAddComponent } from './document-add/document-add.component';
import { DocumentListComponent } from './document-list/document-list.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      {
        path: 'list', // lder
        component: DocumentListComponent,
        data: {
          title: 'route.document',
          // reuse: true,
          breadcrumb: 'route.document'
        }
      },
      {
        path: 'folder/:fo_id/add', // folder/:fo_id/add
        component: DocumentAddComponent,
        data: {
          title: 'route.fileUpload',
          canBack: true,
          breadcrumb: 'route.fileUpload'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentRoutingModule {}
