/*
 * @Description: accessKey转换用户组名称管道
 * @Author: RXC 廖云江
 * @Date: 2019-11-12 15:24:24
 * @LastEditors  : RXC 呉見華
 * @LastEditTime : 2020-01-02 16:19:48
 */
import { Pipe, PipeTransform } from '@angular/core';
import { GroupService } from '@api';
import { I18NService, SelectItem } from '@core';

@Pipe({
  name: 'group'
})
export class GroupAccessPipe implements PipeTransform {
  constructor(private groupService: GroupService, private i18n: I18NService) {}

  /**
   * @description: accessKey或ID转换用户组名称
   */
  async transform(value: string[]) {
    const groupAccessList: Array<SelectItem> = [];
    // 获取组数据
    await this.groupService.getGroups().then((data: any[]) => {
      if (data) {
        // Accesskey判断
        data.forEach(group => {
          groupAccessList.push({ label: group.group_name, value: group.access_key });
        });
      }
    });

    // 传入数组的场合
    const names: any[] = [];
    if (value) {
      value.forEach(v => {
        const groups = groupAccessList.filter(g => g.value === v);
        groups.forEach(e => {
          names.push(this.i18n.translateLang(e.label));
        });
      });
    }
    return names.join(',');
  }
}
