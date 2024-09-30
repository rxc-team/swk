/*
 * @Description: 文件大小換算管道
 * @Author: RXC 廖云江
 * @Date: 2019-11-12 10:15:15
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2019-11-18 16:15:06
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {
  transform(value: string, unit?: string[]): any {
    const num = value ? Number(value) : 0;
    if (unit) {
      if (num <= 1024) {
        return `${num} ${unit[0]}`;
      } else if (num <= 1048576) {
        return `${(num / 1024).toFixed(0)} ${unit[1]}`;
      } else if (num <= 1073741824) {
        return `${(num / 1048576).toFixed(0)} ${unit[2]}`;
      } else {
        return `${(num / 1073741824).toFixed(0)} ${unit[3]}`;
      }
    } else {
      if (num <= 1024) {
        return `${num} Byte`;
      } else if (num <= 1048576) {
        return `${(num / 1024).toFixed(0)} KB`;
      } else if (num <= 1073741824) {
        return `${(num / 1048576).toFixed(0)} MB`;
      } else {
        return `${(num / 1073741824).toFixed(0)} GB`;
      }
    }
  }
}
