import { CompactType, DisplayGrid, GridsterConfig, GridsterItem, GridType } from 'angular-gridster2';
import * as _ from 'lodash';

import { Component, Input, OnInit } from '@angular/core';
import { FieldService, HistoryService } from '@api';

@Component({
  selector: 'app-history-preview',
  templateUrl: './history-preview.component.html',
  styleUrls: ['./history-preview.component.less']
})
export class HistoryPreviewComponent implements OnInit {
  @Input() did = '';
  @Input() hid = '';

  // 动态部分设置信息
  options: GridsterConfig;

  listData = [];

  constructor(private hs: HistoryService, private fs: FieldService) {}

  async ngOnInit(): Promise<void> {
    this.options = {
      displayGrid: DisplayGrid.OnDragAndResize,
      gridType: GridType.VerticalFixed,
      compactType: CompactType.None,
      keepFixedHeightInMobile: true,
      fixedRowHeight: 32,
      minCols: 1,
      maxCols: 4,
      minRows: 10,
      maxRows: 500,
      margin: 8,
      pushItems: true,
      draggable: {
        enabled: false
      },
      resizable: {
        enabled: false
      }
    };
    const data = await this.hs.getHistory(this.did, this.hid);
    if (data) {
      const fields = await this.fs.getFields(data.datastore_id);
      this.listData = this.setItems(fields, data.fixed_items);
    }
  }

  /**
   * @description: 设置中间动态部分数据
   */
  setItems(fields: any[], items: any[]) {
    const listData = [];
    if (fields) {
      fields.forEach(f => {
        let exist = false;
        for (const key in items) {
          if (key === f.field_id) {
            let value;

            switch (f.field_type) {
              case 'file':
                value = [];
                const fv = JSON.parse(items[key].value);
                if (fv) {
                  fv.forEach((file: { url: string; name: string }) => {
                    value.push({
                      url: file.url,
                      name: file.name
                    });
                  });
                }
                break;
              case 'user':
                const uv = JSON.parse(items[key].value);
                value = uv;
                break;
              default:
                value = items[key].value;
                break;
            }

            const it: GridsterItem = {
              cols: f.cols ? f.cols : 1,
              rows: f.rows ? f.rows : 1,
              y: f.y ? f.y : 0,
              x: f.x ? f.x : 0,
              field_id: key,
              is_required: f.is_required,
              type: f.field_type,
              as_title: f.as_title,
              display_order: f.display_order,
              image: f.is_image,
              name: f.field_name,
              value: value
            };

            listData.push(it);
            exist = true;
          }
        }
        if (!exist) {
          let value;
          switch (f.field_type) {
            case 'text':
            case 'textarea':
            case 'number':
            case 'autonum':
              value = '';
              break;
            case 'date':
              value = null;
              break;
            case 'time':
              value = null;
              break;
            case 'user':
            case 'file':
              value = [];
              break;
            case 'switch':
              value = false;
              break;
            case 'options':
              value = null;
              break;
            default:
              value = '';
              break;
          }

          const it: GridsterItem = {
            cols: f.cols ? f.cols : 1,
            rows: f.rows ? f.rows : 1,
            y: f.y ? f.y : 0,
            x: f.x ? f.x : 0,
            is_required: f.is_required,
            field_id: f.field_id,
            type: f.return_type || f.field_type,
            name: f.field_name,
            as_title: f.as_title,
            display_order: f.display_order,
            image: f.is_image,
            value: value
          };
          listData.push(it);
        }
      });
    }

    return _.orderBy(listData, ['display_order'], ['asc']);
  }
}
