/*
 * @Author: RXC 呉見華
 * @Date: 2020-02-21 11:40:37
 * @LastEditTime: 2020-02-21 14:35:07
 * @LastEditors: RXC 呉見華
 * @Description: 防止重复提交控制器
 * @FilePath: /web-ui/src/app/shared/input/debounce-click.directive.ts
 * @
 */
import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

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
  }
}
