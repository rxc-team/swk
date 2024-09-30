/*
 * @Author: RXC 呉見華
 * @Date: 2020-01-16 11:15:10
 * @LastEditTime : 2020-01-16 13:52:18
 * @LastEditors  : RXC 呉見華
 */

import {
    CompactType, DisplayGrid, GridsterConfig, GridsterItem, GridType
} from 'angular-gridster2';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FieldService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.less']
})
export class GridComponent implements OnInit {
  constructor(private field: FieldService, private route: ActivatedRoute, private message: NzMessageService, private i18n: I18NService) {}

  // Grid显示数据
  listData: Array<GridsterItem> = [];
  // Grid配置
  options: GridsterConfig;

  /**
   * @description: 画面初始化处理
   */
  ngOnInit() {
    this.options = {
      displayGrid: DisplayGrid.OnDragAndResize,
      gridType: GridType.VerticalFixed,
      compactType: CompactType.None,
      keepFixedHeightInMobile: true,
      fixedRowHeight: 32,
      minCols: 1,
      maxCols: 4,
      minRows: 10,
      maxRows: 300,
      margin: 8,
      swap: false,
      pushItems: false,
      draggable: {
        enabled: true
      },
      resizable: {
        enabled: true
      }
    };

    this.init();
  }
  /**
   * @description: 初始化处理
   */
  async init() {
    await this.buildFieldInfo();
  }

  /**
   * @description: 获取database数据
   */
  async buildFieldInfo() {
    this.listData = [];

    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    // 调用服务获取字段
    await this.field.getFields(datastoreId).then((data: any[]) => {
      if (data) {
        data.forEach(f => {
          let minRows = 2;
          let maxRows = 1;
          let value;
          switch (f.field_type) {
            case 'text':
              if (f.as_title) {
                minRows = 1;
              } else {
                minRows = 2;
              }
              value = 'xxxxx';
              maxRows = 20;
              break;
            case 'textarea':
              value = 'xxxxx';
              minRows = 3;
              maxRows = 6;
              break;
            case 'number':
              value = '999';
              minRows = 2;
              maxRows = 20;
              break;
            case 'date':
              value = new Date();
              minRows = 2;
              maxRows = 20;
              break;
            case 'time':
              value = new Date().getTime();
              minRows = 2;
              maxRows = 20;
              break;
            case 'user':
              value = ['user'];
              minRows = 2;
              maxRows = 20;
              break;
            case 'file':
              value = [
                {
                  url: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=182618258,3879161671&fm=26&gp=0.jpg',
                  name: 'question.jpg'
                }
              ];
              if (f.is_image) {
                minRows = 2;
                maxRows = 20;
              } else {
                minRows = 2;
                maxRows = 20;
              }
              break;
            case 'switch':
              value = false;
              minRows = 2;
              maxRows = 20;
              break;
            case 'options':
              value = 'A';
              minRows = 2;
              maxRows = 20;
              break;
            case 'lookup':
              value = 'XXX1';
              minRows = 2;
              maxRows = 20;
              break;
            default:
              value = '111';
              minRows = 2;
              maxRows = 20;
              break;
          }

          const it: GridsterItem = {
            cols: f.cols ? f.cols : 1,
            rows: f.rows ? f.rows : 1,
            y: f.y ? f.y : 0,
            x: f.x ? f.x : 0,
            maxItemRows: maxRows,
            minItemRows: minRows,
            field_id: f.field_id,
            type: f.field_type,
            name: f.field_name,
            as_title: f.as_title,
            image: f.is_image ? true : false,
            value: value
          };
          this.listData.push(it);
        });
      } else {
        this.listData = [];
      }
    });
  }

  /**
   * @description: 保存
   */
  async save() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    await Promise.all(
      this.listData.map(async item => {
        const params = {
          datastore_id: datastoreId,
          is_display_setting: 'true',
          x: item.x.toString(),
          y: item.y.toString(),
          cols: item.cols.toString(),
          rows: item.rows.toString()
        };

        return this.field.updateField(item.field_id, params);
      })
    ).then(data => {
      this.message.success(this.i18n.translateLang('common.message.success.S_002'));
    });

    this.options.draggable.enabled = false;
    this.options.resizable.enabled = false;
    this.options.api.optionsChanged();
  }

  /**
   * @description: 拖动字段，设置字段布局
   */
  priview() {
    this.options.draggable.enabled = !this.options.draggable.enabled;
    this.options.resizable.enabled = !this.options.resizable.enabled;
    this.options.api.optionsChanged();
  }
}
