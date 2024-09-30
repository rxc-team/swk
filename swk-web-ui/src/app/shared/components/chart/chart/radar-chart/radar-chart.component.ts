import * as _ from 'lodash';
import * as screenfull from 'screenfull';

import {
    AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnInit, SimpleChanges,
    ViewChild
} from '@angular/core';
import DataSet from '@antv/data-set';
import { Radar } from '@antv/g2plot';
import { I18NService, ThemeService } from '@core';

import { DashboardData, DataService } from '../data.service';

@Component({
  selector: 'app-radar-chart',
  templateUrl: './radar-chart.component.html',
  styleUrls: ['./radar-chart.component.less']
})
export class RadarChartComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() dashboardId: string;
  @Input() change: string;
  @Input() limitInPlot = false;
  @Input() radius = 1;
  @Input() startAngle = 1;
  @Input() endAngle = 3;

  @ViewChild('chart', { static: true }) container: ElementRef;

  private chart: Radar;
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

      const ds = new DataSet();
      const dv = ds.createView().source(this.data);

      dv.transform({
        type: 'fold',
        fields: ['x_value', 'y_value'], // 展开字段集
        key: 'item', // key字段
        value: 'score' // value字段
      });

      const rows = dv.rows;
      rows.forEach(r => {
        if (r.item === 'x_value') {
          r.item = r.x_name;
        }
        if (r.item === 'y_value') {
          r.item = r.y_name;
        }

        r.score = Number(r.score);
      });

      this.chart = new Radar(this.id, {
        data: rows,
        autoFit: true,
        xField: 'g_value',
        yField: 'score',
        seriesField: 'item',
        limitInPlot: this.limitInPlot,
        radius: this.radius,
        startAngle: Math.PI * this.startAngle,
        endAngle: Math.PI * this.endAngle,
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
          },
          score: {
            min: 0,
            nice: true
          }
        },
        legend: {
          layout: 'horizontal',
          position: 'bottom'
        },
        xAxis: {
          line: null,
          tickLine: null,
          grid: {
            line: {
              style: {
                lineDash: null
              }
            }
          }
        },
        // 开启面积
        area: {},
        // 开启辅助点
        point: {
          size: 2
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
