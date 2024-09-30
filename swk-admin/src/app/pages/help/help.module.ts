import { MarkdownModule } from 'ngx-markdown';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { HelpDetailComponent } from './help-detail/help-detail.component';
import { HelpHomeComponent } from './help-home/help-home.component';
import { HelpLayoutComponent } from './help-layout/help-layout.component';
import { HelpRoutingModule } from './help-routing.module';

@NgModule({
  declarations: [HelpDetailComponent, HelpHomeComponent, HelpLayoutComponent],
  imports: [CommonModule, HelpRoutingModule, SharedModule, MarkdownModule.forChild()]
})
export class HelpModule {}
