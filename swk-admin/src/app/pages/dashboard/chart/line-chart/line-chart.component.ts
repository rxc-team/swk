import * as _ from 'lodash';
import { toBoolean } from 'ng-zorro-antd/core/util';
import * as screenfull from 'screenfull';

import { formatNumber } from '@angular/common';
import {
    AfterViewInit, Component, ElementRef, HostListener, Inject, Input, LOCALE_ID, OnInit, ViewChild
} from '@angular/core';
import { Line, LineOptions } from '@antv/g2plot';
import { I18NService, ThemeService } from '@core';

import { DashboardData, DataService } from '../data.service';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.less']
})
export class LineChartComponent implements OnInit, AfterViewInit {
  @Input() reportId: string;
  @Input() xField = '';
  @Input() yField = '';
  @Input() gField = '';
  @Input() xRange = [0.1, 0.9];
  @Input() yRange = [0.1, 0.9];
  @Input() tickType = 'auto';
  @Input() ticks = [0, 10, 20, 30, 40, 50];
  @Input() tickCount = 5;
  @Input() limitInPlot = false;
  @Input() smooth = false;
  @Input() stepType = '';
  @Input() isStack = false;
  @Input() slider: {
    start?: number;
    end?: number;
    height?: number;
  } = { start: 0, end: 1, height: 10 };

  @ViewChild('chart', { static: true }) container: ElementRef;

  private chart: Line;
  private id: string;
  private initFlag = false;

  // 数据
  data: DashboardData[] = [];

  constructor(
    @Inject(LOCALE_ID) private _locale: string,
    private dataService: DataService,
    private i18n: I18NService,
    private theme: ThemeService,
    private ele: ElementRef
  ) {}

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

      this.chart = new Line(this.id, {
        data: this.data,
        autoFit: true,
        point: {
          size: 2
        },
        limitInPlot: this.limitInPlot,
        smooth: this.smooth,
        isStack: this.isStack,
        xField: 'x_value',
        yField: 'y_value',
        stepType: this.stepType,
        slider: this.slider,
        legend: {
          layout: 'horizontal',
          position: 'bottom'
        },
        seriesField: this.isStack || this.stepType ? 'g_value' : '',
        label: {
          // 可手动配置 label 数据标签位置
          position: 'top' // 'top', 'middle', 'bottom'
        },
        meta: {
          x_value: {
            type: 'cat',
            range: this.xRange,
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
            alias: this.data[0].y_name,
            range: this.yRange,
            ticks: this.ticks || [],
            tickCount: this.tickCount || 5,
            formatter: val => {
              if (val) {
                return formatNumber(val, this._locale, '1.0-9');
              }
              return val;
            },
            nice: true
          },
          g_value: {
            type: 'cat',
            formatter: val => {
              const find = this.data.find(item => item.g_value === val);
              if (find) {
                switch (find.g_type) {
                  case 'options':
                    return this.i18n.translateLang(val);
                  default:
                    return val;
                }
              }
            }
          }
        }
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
