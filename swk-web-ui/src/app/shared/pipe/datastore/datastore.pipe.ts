/*
 * @Author: RXC 呉見華
 * @Date: 2019-12-24 17:42:23
 * @LastEditTime : 2020-01-02 16:29:31
 * @LastEditors  : RXC 呉見華
 * @FilePath: /web-ui/src/app/shared/pipe/datastore/datastore-name.pipe.ts
 * @
 */
import { Pipe, PipeTransform } from '@angular/core';
import { DatastoreService } from '@api';
import { CommonService } from '@core';

@Pipe({
  name: 'datastore'
})
export class DatastorePipe implements PipeTransform {
  constructor(private common: CommonService, private datastoreService: DatastoreService) {}

  /**
   * @description: 台账ID和名称转换
   */
  async transform(value: string) {
    let dsList = [];

    // 获取台账数据
    await this.datastoreService.getDatastores().then((data: any[]) => {
      if (data) {
        dsList = data;
      }
    });

    const datastore = dsList.find(d => d.datastore_id === value);
    if (datastore) {
      return datastore.datastore_name;
    }
    return '';
  }
}
