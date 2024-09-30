import {
    AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Output, Renderer2
} from '@angular/core';

@Directive({
  selector: '[appSelect]'
})
export class SelectDirective implements AfterViewInit {
  @Output() select: EventEmitter<any> = new EventEmitter();

  search: HTMLElement;
  index = 0;
  constructor(private el: ElementRef, private render: Renderer2) {}

  ngAfterViewInit(): void {
    this.search = this.el.nativeElement;
  }

  @HostListener('window:keyup', ['$event']) keyup(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.select.emit(this.index);
    }
    if (e.key === 'ArrowUp') {
      const active = this.search.querySelector('.active');
      const item = this.search.querySelectorAll('nz-list-item');
      if (!active) {
        this.index = 0;
        const select = item[this.index];
        this.render.addClass(select, 'active');
      } else {
        item.forEach(i => {
          this.render.removeClass(i, 'active');
        });
        if (this.index > 0) {
          this.index--;
        } else {
          this.index = 0;
        }
        const select = item[this.index];
        this.render.addClass(select, 'active');
      }
    }
    if (e.key === 'ArrowDown') {
      const active = this.search.querySelector('.active');
      const item = this.search.querySelectorAll('nz-list-item');
      if (!active) {
        this.index = 0;
        const select = item[this.index];
        this.render.addClass(select, 'active');
      } else {
        item.forEach(i => {
          this.render.removeClass(i, 'active');
        });
        if (this.index < item.length - 1) {
          this.index++;
        } else {
          this.index = item.length - 1;
        }
        const select = item[this.index];
        this.render.addClass(select, 'active');
      }
    }
    // ArrowUp ArrowDown
  }
}
