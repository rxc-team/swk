/*
 * @Description: 設定画面モジュール
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:41
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2019-06-19 13:20:11
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { BaseSettingComponent } from './base-setting/base-setting.component';
import { SafeSettingComponent } from './safe-setting/safe-setting.component';
import { SettingRoutingModule } from './setting-routing.module';
import { SettingComponent } from './setting.component';

@NgModule({
  declarations: [SettingComponent, BaseSettingComponent, SafeSettingComponent],
  imports: [SharedModule, SettingRoutingModule]
})
export class SettingModule {}
