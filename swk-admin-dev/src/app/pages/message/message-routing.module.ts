import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MessageComponent } from './message.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: MessageComponent,
        data: {
          title: 'route.messageCenter',
          breadcrumb: 'route.messageCenter'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessageRoutingModule {}
