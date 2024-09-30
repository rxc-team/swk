import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { AppFormComponent } from './app/app-form/app-form.component';
import { AppListComponent } from './app/app-list/app-list.component';
import { CustomerFormComponent } from './customer-form/customer-form.component';
import { CustomerInfoComponent } from './customer-info/customer-info.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerRoutingModule } from './customer-routing.module';
import { QuestionFormComponent } from './question/question-form/question-form.component';
import { QuestionListComponent } from './question/question-list/question-list.component';

@NgModule({
  declarations: [
    CustomerListComponent,
    CustomerFormComponent,
    AppListComponent,
    AppFormComponent,
    CustomerInfoComponent,
    QuestionListComponent,
    QuestionFormComponent
  ],
  imports: [
    CustomerRoutingModule,
    SharedModule,
    NzCardModule,
    NzFormModule,
    NzDescriptionsModule,
    NzDatePickerModule,
    NzTabsModule,
    NzInputNumberModule,
    NzInputModule,
    NzSelectModule,
    NzAvatarModule,
    NzCommentModule,
    NzSpaceModule,
    NzListModule,
    NzSwitchModule,
    NzButtonModule,
    NzCollapseModule,
    NzToolTipModule,
    NzPopoverModule,
    NzTagModule,
    NzUploadModule,
    NzBadgeModule,
    NzModalModule,
    NzTableModule,
    NzCheckboxModule,
    NzDropDownModule,
    NzResizableModule,
    NzIconModule
  ]
})
export class CustomerModule {}
