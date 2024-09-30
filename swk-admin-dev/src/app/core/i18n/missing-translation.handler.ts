/*
 * @Author: RXC 呉見華
 * @Date: 2020-02-24 10:53:17
 * @LastEditTime: 2020-02-24 11:50:36
 * @LastEditors: RXC 呉見華
 * @Description: 找不翻译的处理
 * @FilePath: /admin/src/app/core/i18n/missing-translation.handler.ts
 * @
 */
import { Injectable } from '@angular/core';
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

import { NotTranslatedService } from './not-translated.service';

@Injectable({
  providedIn: 'root'
})
export class MyMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    this.nts.notTranslated(params.key);
    return '(no translate)';
  }

  constructor(private nts: NotTranslatedService) {}
}
