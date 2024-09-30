import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { ContractFormComponent } from './contract-form/contract-form.component';
import { DebtChangeComponent } from './debt-change/debt-change.component';
import { ExpireComponent } from './expire/expire.component';
import { InfoChangeComponent } from './info-change/info-change.component';
import { ItemAddComponent } from './item-add/item-add.component';
import { ItemSearchComponent } from './item-search/item-search.component';
import { ItemUpdateComponent } from './item-update/item-update.component';
import { LeaseRoutingModule } from './lease-routing.module';
import { MidwayCancelComponent } from './midway-cancel/midway-cancel.component';

@NgModule({
  declarations: [
    ContractFormComponent,
    DebtChangeComponent,
    ExpireComponent,
    InfoChangeComponent,
    ItemAddComponent,
    ItemUpdateComponent,
    ItemSearchComponent,
    MidwayCancelComponent
  ],
  imports: [SharedModule, LeaseRoutingModule]
})
export class LeaseModule {}
