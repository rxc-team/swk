import {
    ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy,
    OnInit, Output, Renderer2, SimpleChanges, ViewChild, ViewEncapsulation
} from '@angular/core';
import { Chart } from '@antv/g2';
import { ChartCfg } from '@antv/g2/lib/interface';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent implements OnInit, OnChanges, OnDestroy {
  private instance: any;
  private initFlag = false;

  @Input() options: ChartCfg;
  @Output() readonly ready: EventEmitter<any> = new EventEmitter();
  @Output() readonly destroy = new EventEmitter();

  @ViewChild('container', { static: true }) container: ElementRef;

  constructor(private render: Renderer2) {}

  ngOnInit(): void {
    this.initFlag = true;
    this.init();
  }

  init() {
    if (!this.initFlag) {
      return;
    }

    if (this.instance) {
      return;
    }

    setTimeout(() => {
      this.instance = new Chart(
        Object.assign({}, this.options, {
          container: this.container.nativeElement
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
