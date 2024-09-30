/*
 * @Author: RXC 呉見華
 * @Date: 2019-12-04 13:44:50
 * @LastEditTime : 2020-01-02 15:36:56
 * @LastEditors  : RXC 呉見華
 * @Description: 选择管道
 * @FilePath: /web-ui/src/app/shared/pipe/option/option.pipe.ts
 * @
 */
import { Pipe, PipeTransform } from '@angular/core';
import { CommonService, I18NService, SelectItem } from '@core';

@Pipe({
  name: 'option'
})
export class OptionPipe implements PipeTransform {
  constructor(private i18n: I18NService) {}

  /**
   * @description: 选项转换
   */
  transform(value: string, optionList: SelectItem[]): string {
    const option = optionList.find(o => o.value === value);
    if (option) {
      return this.i18n.translateLang(option.label);
    }
    return '';
  }
}
