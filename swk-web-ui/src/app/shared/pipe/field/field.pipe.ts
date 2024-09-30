/*
 * @Author: RXC 呉見華
 * @Date: 2019-12-24 17:42:23
 * @LastEditTime : 2020-01-02 16:29:31
 * @LastEditors  : RXC 呉見華
 * @FilePath: /web-ui/src/app/shared/pipe/datastore/datastore-name.pipe.ts
 * @
 */
import { Pipe, PipeTransform } from '@angular/core';
import { I18NService, SelectItem } from '@core';

@Pipe({
  name: 'field'
})
export class FieldPipe implements PipeTransform {
  constructor(private i18n: I18NService) {}

  /**
   * @description: 字段ID和名称转换
   */
  transform(value: string, fieldList: SelectItem[]) {
    const field = fieldList.find(o => o.value === value);
    if (field) {
      return this.i18n.translateLang(field.label);
    }
    return '';
  }
}
