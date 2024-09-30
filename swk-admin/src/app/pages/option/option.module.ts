/*
 * @Description: 选项module
 * @Author: RXC 廖欣星
 * @Date: 2019-04-28 13:25:26
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2019-07-05 09:50:01
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { OptionAddComponent } from './option-add/option-add.component';
import { OptionListComponent } from './option-list/option-list.component';
import { OptionRoutingModule } from './option-routing.module';

@NgModule({
  declarations: [OptionListComponent, OptionAddComponent],
  imports: [SharedModule, OptionRoutingModule]
})
export class OptionModule {}
