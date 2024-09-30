import * as _ from 'lodash';
import * as screenfull from 'screenfull';

import {
    AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges,
    ViewChild
} from '@angular/core';
import { Radar, Scatter } from '@antv/g2plot';
import { I18NService, ThemeService } from '@core';

import { DashboardData, DataService } from '../data.service';

@Component({
  selector: 'app-point-chart',
  templateUrl: './point-chart.component.html',
  styleUrls: ['./point-chart.component.less']
})
export class PointChartComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() dashboardId: string;
  @Input() change: string;
  @Input() limitInPlot = false;

  @ViewChild('chart', { static: true }) container: ElementRef;

  private chart: Scatter;
  private id: string;
  private initFlag = false;

  // 数据
  data: DashboardData[] = [];

  constructor(private dataService: DataService, private i18n: I18NService, private theme: ThemeService, private ele: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('change' in changes) {
      this.init();
    }
  }
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

      this.chart = new Scatter(this.id, {
        data: this.data,
        autoFit: true,
        xField: 'x_value',
        yField: 'y_value',
        shape: 'circle',
        colorField: 'g_value',
        limitInPlot: this.limitInPlot,
        meta: {
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
        },
        tooltip: {
          fields: ['x_name', 'x_value', 'y_name', 'y_value', 'g_value'],
          itemTpl:
            '<li class="g2-tooltip-list-item" data-index={index} style="margin-bottom:4px;">' +
            '<span style="background-color:{color};" class="g2-tooltip-marker"></span>' +
            '{name}<br/><br/>' +
            '{value}' +
            '</li>',
          formatter: dt => {
            return {
              name: dt.g_value,
              value: dt.x_name + ':' + dt.x_value + '<span style="display:inline-block;width:40px"></span>' + dt.y_name + ':' + dt.y_value
            };
          }
        },
        yAxis: {
          nice: true,
          line: {
            style: {
              stroke: '#aaa'
            }
          }
        },
        xAxis: {
          grid: {
            line: {
              style: {
                stroke: '#eee'
              }
            }
          },
          line: {
            style: {
              stroke: '#aaa'
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
    if (this.dashboardId) {
      await this.dataService.search(this.dashboardId).then(data => {
        if (data) {
          this.data = data;
        } else {
          this.data = [];
        }
      });
    }
  }
}
