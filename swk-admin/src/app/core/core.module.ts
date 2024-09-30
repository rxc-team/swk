/*
 * @Description: 核心模块
 * @Author: RXC 呉見華
 * @Date: 2019-04-22 10:19:55
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-24 10:57:47
 */

import { NgEventBus } from 'ng-event-bus';

import { NgModule, Optional, SkipSelf } from '@angular/core';

import { AuthGuard } from './guard/auth.guard';
import { UpdateGuard } from './guard/update.guard';
import { MyMissingTranslationHandler } from './i18n/missing-translation.handler';
import { throwIfAlreadyLoaded } from './module.import.guard';

// 路由守卫
const GUARDS = [AuthGuard, UpdateGuard];

@NgModule({
  providers: [...GUARDS, NgEventBus, MyMissingTranslationHandler]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
