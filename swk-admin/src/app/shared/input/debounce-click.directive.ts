/*
 * @Author: RXC 呉見華
 * @Date: 2020-02-21 11:40:37
 * @LastEditTime: 2020-02-21 14:32:06
 * @LastEditors: RXC 呉見華
 * @Description: 防止重复提交控制器
 * @FilePath: /admin-dev/src/app/shared/input/debounce-click.directive.ts
 */

import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appDebounceClick]'
})
export class DebounceClickDirective {
  constructor(public btn: ElementRef) {}

  @HostListener('click', ['$event'])
  async clickEvent(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const button: HTMLElement = this.btn.nativeElement;
    button.setAttribute('disabled', 'disabled');

    setTimeout(() => {
      button.removeAttribute('disabled');
    }, 1000);
  }
}
