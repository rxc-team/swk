import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { LoginComponent } from './full/login/login.component';
import { MailActivateComponent } from './full/mail-activate/mail-activate.component';
import { PasswordResetComponent } from './full/password-reset/password-reset.component';
import { HomeComponent } from './home/home.component';
import { PageRoutingModule } from './pages-routing.module';

const COMPONENTS = [HomeComponent, LoginComponent, MailActivateComponent, PasswordResetComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    PageRoutingModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzSpaceModule,
    NzButtonModule,
    NzCollapseModule,
    NzTableModule,
    NzStatisticModule,
    NzDropDownModule,
    NzResizableModule,
    NzTabsModule,
    NzEmptyModule,
    NzAlertModule,
    NzGridModule,
    NzIconModule
  ],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT
})
export class PagesModule {}
