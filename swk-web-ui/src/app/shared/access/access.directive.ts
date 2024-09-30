import { AfterViewInit, Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AclService } from '@core';

@Directive({
  selector: '[appAccess]'
})
export class AccessDirective implements OnInit, AfterViewInit {
  // 当前动作key
  @Input() action: string;
  @Input() change: number;

  constructor(private el: ElementRef, private route: ActivatedRoute, private render: Renderer2, private acl: AclService) {}

  ngOnInit() {
    this.render.setStyle(this.el.nativeElement, 'display', 'none');
  }

  ngAfterViewInit(): void {
    const datastore = this.route.snapshot.paramMap.get('d_id');

    if (!this.acl.checkAction(datastore, this.action)) {
      this.render.setStyle(this.el.nativeElement, 'display', 'none');
    } else {
      this.render.setStyle(this.el.nativeElement, 'display', '');
    }
  }
}
