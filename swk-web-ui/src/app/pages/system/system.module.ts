import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { ItSupportComponent } from './it-support/it-support.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

@NgModule({
  declarations: [PageNotFoundComponent, ItSupportComponent],
  imports: [SharedModule]
})
export class SystemModule {}
