import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { MessageRoutingModule } from './message-routing.module';
import { MessageComponent } from './message.component';
import { SendMessageComponent } from './send-message/send-message.component';
import { UpdateMessageComponent } from './update-message/update-message.component';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

@NgModule({
  declarations: [SendMessageComponent, MessageComponent, UpdateMessageComponent],
  imports: [
    SharedModule,
    MessageRoutingModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzSpaceModule,
    NzButtonModule,
    NzRadioModule,
    NzTabsModule,
    NzAvatarModule,
    NzListModule,
    NzCollapseModule,
    NzCommentModule,
    NzTableModule,
    NzDropDownModule,
    NzResizableModule,
    NzIconModule,
    NzTimePickerModule,
    NzDatePickerModule
  ]
})
export class MessageModule {}
