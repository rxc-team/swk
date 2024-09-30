import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { MarkdownModule } from 'ngx-markdown';

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { HelpFormComponent } from './help-form/help-form.component';
import { HelpListComponent } from './help-list/help-list.component';
import { HelpRoutingModule } from './help-routing.module';
import { HelpTypeFormComponent } from './help-type-form/help-type-form.component';
import { HelpTypeListComponent } from './help-type-list/help-type-list.component';

@NgModule({
  declarations: [HelpFormComponent, HelpListComponent, HelpTypeListComponent, HelpTypeFormComponent],
  imports: [
    HelpRoutingModule,
    SharedModule,
    MarkdownModule.forChild(),
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzTabsModule,
    NzUploadModule,
    NzSwitchModule,
    NzModalModule,
    NzCheckboxModule,
    NzSelectModule,
    NzCodeEditorModule,
    NzSpaceModule,
    NzButtonModule,
    NzTagModule,
    NzCheckboxModule,
    NzCollapseModule,
    NzTableModule,
    NzRadioModule,
    NzDropDownModule,
    NzResizableModule,
    NzEmptyModule,
    NzIconModule
  ]
})
export class HelpModule {}
