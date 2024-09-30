/*
 * @Description: 用户管道管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-13 15:38:12
 * @LastEditors  : RXC 呉見華
 * @LastEditTime : 2020-01-02 15:49:35
 */
// angular框架类库
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'node'
})
export class NodePipe implements PipeTransform {
  constructor() {}

  /**
   * @description: 用户转换
   */
  transform(value: string, nodeList: any[]): any {
    const node = nodeList.find(f => f.node_id === value);
    if (node) {
      return node;
    }
    return nodeList[nodeList.length - 1];
  }
}
