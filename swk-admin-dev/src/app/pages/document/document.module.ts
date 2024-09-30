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
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { DocumentAddComponent } from './document-add/document-add.component';
import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentRoutingModule } from './document-routing.module';
import { SearchListComponent } from './search-list/search-list.component';

@NgModule({
  declarations: [DocumentAddComponent, DocumentListComponent, SearchListComponent],
  imports: [
    DocumentRoutingModule,
    SharedModule,
    NzCardModule,
    NzFormModule,
    NzUploadModule,
    NzInputModule,
    NzSelectModule,
    NzSpaceModule,
    NzTabsModule,
    NzButtonModule,
    NzToolTipModule,
    NzCollapseModule,
    NzTableModule,
    NzDropDownModule,
    NzResizableModule,
    NzIconModule
  ]
})
export class DocumentModule {}
