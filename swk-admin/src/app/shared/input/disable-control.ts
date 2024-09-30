/*
 * @Description: 制御控制器
 * @Author: RXC 呉見華
 * @Date: 2019-08-29 16:05:22
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2019-08-30 17:04:02
 */

import { Directive, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[disableControl]'
})
export class DisableControlDirective {
  @Input() set disableControl(condition: boolean) {
    const action = condition ? 'disable' : 'enable';
    this.ngControl.control[action]();
  }

  constructor(private ngControl: NgControl) {}
}
