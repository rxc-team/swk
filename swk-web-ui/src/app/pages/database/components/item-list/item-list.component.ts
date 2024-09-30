/*
 * @Description: 台账列表控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-06-17 13:13:58
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-03-31 14:18:31
 */
// 第三方类库
import * as _ from 'lodash';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { forkJoin } from 'rxjs';

// angular框架类库
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService, FieldService, OptionService, UserService } from '@api';
// 自定义服务或控件
import { I18NService, SelectItem } from '@core';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.less']
})
export class ItemListComponent implements OnInit {
  @Input() datastoreId: string;
  @Input() conditions: any[];
  @Input() conditionType = 'or';

  constructor(private db: DatabaseService, private field: FieldService, private i18n: I18NService, private router: Router) { }

  // 数据定义
  // 一览数据
  dataSet: any[] = [];
  // 台账字段
  fields: any[] = [];
  // 台账数据
  items: any[] = [];
  // // 检索条件类型（true-and/false-or）
  // conditionType = true;
  // 分页使用-当前页
  pageIndex = 1;
  // 分页使用-每页显示条数
  pageSize = 50;
  // 分页使用-总的条数
  total = 1;
  // 排序值（升序，降序，不排序）
  sorts: Array<{ sort_key: string; sort_value: string }> = [];
  tableWidth = 60;

  scroll = { x: '1000px', y: '200px' };

  // 加载
  loading = false;
  viewInit = true;

  trackBy(i: number, data: any): number {
    return data[1].value;
  }

  /**
   * @description: 排序
   */
  onQueryParamsChange(params: NzTableQueryParams) {
    const { sort } = params;
    const currentSort = sort.filter(item => item.value !== null);

    this.sorts = currentSort.map(s => {
      return { sort_key: s.key, sort_value: s.value };
    });

    if (!this.viewInit) {
      this.searchDatabaseItems(false, true);
    }
  }

  /**
   * @description: 查询关联台账的数据
   */
  async searchDatabaseItems(reset: boolean = false, isSort: boolean = false) {
    this.loading = true;

    // 页面条数变更回到第一页
    if (reset) {
      this.pageIndex = 1;
    }

    const params = {
      condition_list: this.conditions,
      condition_type: this.conditionType ? this.conditionType : 'and',
      page_index: this.pageIndex,
      page_size: this.pageSize,
      sorts: this.sorts
    };

    await this.db.getItems(this.datastoreId, params).then((data: any) => {
      if (data && data.items_list) {
        this.items = data.items_list;
        this.total = data.total;
      } else {
        this.items = [];
        this.total = 0;
      }
    });

    if (!isSort) {
      await this.field.getFields(this.datastoreId).then(async (data: any[]) => {
        if (data) {
          this.fields = data.filter(f => !f.as_title);
        } else {
          this.fields = [];
        }
      });
    }

    this.generateTableData();

    this.loading = false;

    setTimeout(() => {
      this.viewInit = false;
    }, 2000);
  }

  /**
   * @description: 跳转到详细画面
   */
  goTo(item_id: string) {
    const url = `/datastores/${this.datastoreId}/items/${item_id}`;
    this.router.navigate([url]);
  }

  /**
   * @description: 添加数据
   */
  add() {
    const url = `/datastores/${this.datastoreId}/add`;
    this.router.navigate([url]);
  }

  /**
   * @description: 生成table数据
   */
  generateTableData() {
    this.dataSet = [];
    this.tableWidth = 60;

    this.fields = _.orderBy(this.fields, ['display_order'], ['asc']);

    const fieldName: string[] = [];
    fieldName.push('id');
    this.fields.forEach(fl => {
      if (fl.field_type !== 'file' && fl.field_type !== 'lookup') {
        fieldName.push(`${this.i18n.translateLang(fl.field_name)}`);
      }
      this.tableWidth += fl.width;
    });

    this.scroll.x = this.tableWidth + 20 + 'px';

    this.items.forEach((dt, index) => {
      const item: any[] = [];
      item.push({
        data_type: 'item_id',
        value: dt.item_id
      });
      item.push({
        data_type: 'index',
        value: (this.pageIndex - 1) * this.pageSize + index + 1
      });
      this.fields.forEach(fl => {
        let isAdd = false;
        // tslint:disable-next-line: forin
        for (const key in dt.items) {
          if (fl.field_id === key) {
            let value;
            switch (fl.field_type) {
              case 'text':
              case 'textarea':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'number':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'date':
                if (dt.items[key]) {
                  value = dt.items[key] === '0001-01-01' ? '' : dt.items[key];
                }
                break;
              case 'time':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'user':
                if (dt.items[key]) {
                  const v: string = dt.items[key].value;
                  value = {
                    data_type: dt.items[key].data_type,
                    value: JSON.parse(v.slice(0, v.length))
                  };
                }
                break;
              case 'file':
                if (dt.items[key]) {
                  const v: string = dt.items[key].value;
                  value = {
                    data_type: dt.items[key].data_type,
                    value: JSON.parse(v.slice(0, v.length))
                  };
                }
                break;
              case 'switch':
                if (dt.items[key] !== '') {
                  value = dt.items[key];
                }
                break;
              case 'options':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'lookup':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              default:
                value = dt.items[key];
                break;
            }
            item.push(value);

            isAdd = true;
          }
        }
        if (!isAdd) {
          item.push(``);
        }
      });
      this.dataSet.push(item);
    });
  }

  getOption(value, optionList) {
    const option = optionList.find(o => o.value === value);
    if (option) {
      return this.i18n.translateLang(option.label);
    }
    return '';
  }

  /**
   * @description: 画面初始化处理
   */
  ngOnInit(): void {
    this.searchDatabaseItems();
  }
}
