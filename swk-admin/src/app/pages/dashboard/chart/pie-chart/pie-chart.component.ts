import * as _ from 'lodash';
import * as screenfull from 'screenfull';

import {
    AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild
} from '@angular/core';
import DataSet from '@antv/data-set';
import { Pie } from '@antv/g2plot';
import { I18NService, ThemeService } from '@core';

import { DashboardData, DataService } from '../data.service';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.less']
})
export class PieChartComponent implements OnInit, AfterViewInit {
  @Input() reportId: string;
  @Input() xField = '';
  @Input() yField = '';
  @Input() gField = '';
  @Input() limitInPlot = false;
  @Input() radius = 1;
  @Input() innerRadius = 0;
  @Input() startAngle = 1;
  @Input() endAngle = 3;

  @ViewChild('chart', { static: true }) container: ElementRef;

  private chart: Pie;
  private id: string;
  private initFlag = false;

  // 数据
  data: DashboardData[] = [];

  constructor(private dataService: DataService, private i18n: I18NService, private theme: ThemeService, private ele: ElementRef) {}

  /**
   * 视图初始化
   */
  ngAfterViewInit(): void {
    this.id = 'chart-' + this.dataService.genUUID(6);
    this.container.nativeElement.id = this.id;
    this.initFlag = true;
    this.init();
  }

  /**
   * 图初始化操作
   */
  init() {
    if (!this.initFlag) {
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    setTimeout(async () => {
      await this.search();

      const ds = new DataSet();
      const dv = ds.createView().source(this.data);

      dv.transform({
        type: 'percent',
        field: 'y_value',
        dimension: 'x_value',
        as: 'y_value'
      });

      this.chart = new Pie(this.id, {
        data: dv.rows,
        autoFit: true,
        angleField: 'y_value',
        colorField: 'x_value',
        limitInPlot: this.limitInPlot,
        radius: this.radius,
        innerRadius: this.innerRadius,
        startAngle: Math.PI * this.startAngle,
        endAngle: Math.PI * this.endAngle,
        label: {
          type: 'outer',
          labelHeight: 28,
          content: data => {
            let item = data.x_value;
            if (data.x_type === 'options') {
              item = this.i18n.translateLang(data.x_value);
            }
            return `${item}: ${(data.y_value * 100).toFixed(2)}%`;
          }
        },
        legend: {
          layout: 'horizontal',
          position: 'bottom'
        },
        meta: {
          x_value: {
            type: 'cat',
            formatter: val => {
              const find = this.data.find(item => item.x_value === val);
              if (find) {
                switch (find.x_type) {
                  case 'options':
                    return this.i18n.translateLang(val);
                  default:
                    return val;
                }
              }
            }
          },
          y_value: {
            min: 0,
            max: 1,
            alias: this.data[0].y_name,
            formatter: val => {
              val = (val * 100).toFixed(2) + '%';
              return val;
            },
            nice: true
          }
        },
        statistic: {
          title: false
        },
        interactions: [{ type: 'element-selected' }, { type: 'element-active' }]
      });

      this.chart.render();
    }, 0);
  }

  /**
   * 监听全屏事件
   */
  @HostListener('document:fullscreenchange')
  fullScreen() {
    const box: HTMLDivElement = this.ele.nativeElement;
    const container: HTMLDivElement = this.container.nativeElement;
    const height = box.clientHeight || 300;
    const width = container.clientWidth;
    this.chart.changeSize(width, height);
    this.chart.render();
  }

  /**
   * 初始化
   */
  ngOnInit() {
    this.theme.theme$.subscribe(data => {
      if (this.chart) {
        if (data.isDark) {
          this.chart.update({ theme: 'dark' });
        } else {
          this.chart.update({ theme: 'default' });
        }
      }
    });
  }

  /**
   * 切换全屏
   */
  toggleFullScreen() {
    if (screenfull.isEnabled) {
      screenfull.toggle(this.ele.nativeElement);
    }
  }

  /**
   * 检索数据
   */
  async search() {
    if (this.reportId) {
      await this.dataService.search(this.reportId, this.xField, this.yField, this.gField).then(data => {
        if (data) {
          this.data = data;
        } else {
          this.data = [];
        }
      });
    }
  }
}
