import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { BackupListComponent } from './backup-list/backup-list.component';
import { BackupRoutingModule } from './backup-routing.module';

@NgModule({
  declarations: [BackupListComponent],
  imports: [SharedModule, BackupRoutingModule]
})
export class BackupModule {}
