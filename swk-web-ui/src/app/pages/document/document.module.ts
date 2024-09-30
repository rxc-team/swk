/*
 * @Description: 会社管理模块
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-09-22 16:08:41
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { DocumentAddComponent } from './document-add/document-add.component';
import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentRoutingModule } from './document-routing.module';
import { SearchListComponent } from './search-list/search-list.component';

@NgModule({
  declarations: [DocumentAddComponent, DocumentListComponent, SearchListComponent],
  imports: [CommonModule, DocumentRoutingModule, SharedModule]
})
export class DocumentModule {}
