/*
 * @Description: 主函数
 * @Author: RXC 廖欣星
 * @Date: 2019-04-22 10:19:56
 * @LastEditors: RXC 廖欣星
 * @LastEditTime: 2019-06-21 15:02:13
 */

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

(window as any).global = window;

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
