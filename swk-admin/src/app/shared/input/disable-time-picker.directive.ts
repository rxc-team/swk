import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDisableTimePicker]'
})
export class DisableTimePickerDirective implements AfterViewInit {
  constructor(private el: ElementRef, private render: Renderer2) {}

  ngAfterViewInit() {
    const tp: HTMLElement = this.el.nativeElement;
    const input = tp.querySelector('input');
    this.render.setAttribute(input, 'disabled', '');
    this.render.setStyle(input, 'color', 'rgba(0, 0, 0, 0.65)');
  }
}
