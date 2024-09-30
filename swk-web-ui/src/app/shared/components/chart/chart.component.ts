import {
    AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges,
    OnDestroy, OnInit, Output, Renderer2, SimpleChanges, ViewChild, ViewEncapsulation
} from '@angular/core';
import { Chart } from '@antv/g2';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  static idPool = 0;
  private instance: any;
  private id: string;
  private initFlag = false;

  @Input() options: any;
  @Output() readonly ready: EventEmitter<any> = new EventEmitter();
  @Output() readonly destroy = new EventEmitter();

  @ViewChild('container', { static: true }) container: ElementRef;

  constructor(private render: Renderer2) {}

  ngAfterViewInit(): void {
    this.id = 'chart-' + ++ChartComponent.idPool;
    this.container.nativeElement.id = this.id;
    this.initFlag = true;
    this.init();
  }

  init() {
    if (!this.initFlag) {
      return;
    }

    if (this.instance) {
      this.instance.destroy();
    }

    setTimeout(() => {
      this.instance = new Chart(
        Object.assign({}, this.options, {
          id: this.id,
          container: this.id
        })
      );
      this.ready.emit(this.instance);
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('options' in changes) {
      this.init();
    }
  }

  ngOnDestroy(): void {
    this.destroy.emit();
  }
}
