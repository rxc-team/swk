/*
 * @Description: 核心module
 * @Author: RXC 廖欣星
 * @Date: 2019-04-15 11:51:28
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-24 11:52:08
 */
import { NgEventBus } from 'ng-event-bus';

import { NgModule, Optional, SkipSelf } from '@angular/core';

import { AuthGuard } from './guard/auth.guard';
import { MyMissingTranslationHandler } from './i18n/missing-translation.handler';
import { throwIfAlreadyLoaded } from './module.import.guard';

const GUARDS = [AuthGuard];

@NgModule({
  providers: [...GUARDS, NgEventBus, MyMissingTranslationHandler]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}
