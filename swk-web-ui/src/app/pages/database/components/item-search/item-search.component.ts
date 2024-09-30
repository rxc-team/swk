import * as _ from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DatabaseService, FieldService, ItemService, OptionService } from '@api';
import { I18NService, SelectItem } from '@core';

@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
  styleUrls: ['./item-search.component.less']
})
export class ItemSearchComponent implements OnInit, OnChanges {
  @Input() clear = true;
  @Input() lookupDatastoreId: string;
  @Input() lookField: string;
  @Output() nxCancel: EventEmitter<any> = new EventEmitter();
  @Output() nxReflect: EventEmitter<any> = new EventEmitter();
  //@Input() userList: any[];

  lookItem: any;
  pageIndex = 1;
  pageSize = 10;
  total = 1;
  dataSet: any[] = [];
  items: any[] = [];
  fields: any[] = [];
  loading = false;
  searchValue = '';
  optionList: Map<string, Array<SelectItem>> = new Map();
  viewInit = true;

  private searchTerms = new Subject<string>();

  constructor(
    private db: DatabaseService,
    public item: ItemService,
    public field: FieldService,
    public option: OptionService,
    private message: NzMessageService,
    private i18n: I18NService
  ) { }

  ngOnInit() {
    this.searchTerms.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term: string) => {
      this.searchLookDatabaseItems(term);
    });
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnChanges(): void {
    this.dataSet = [];
    this.fields = [];
    if (this.lookupDatastoreId && this.lookField) {
      this.searchLookDatabaseItems();
    }
  }

  trackBy(i: number, data: any): number {
    return data[1].value;
  }

  /**
   * @description: 查询关联台账的数据
   */
  async searchLookDatabaseItems(term?: string) {
    this.loading = true;
    if (this.lookupDatastoreId && this.lookField) {
      // 获取字段
      await this.field.getFields(this.lookupDatastoreId).then(async (data: any[]) => {
        if (data) {
          const fields = _.orderBy(data, ['display_order'], ['asc']);
          this.fields = fields.filter(f => !f.as_title);
          const optFields = this.fields.filter(f => f.field_type === 'options');
          if (optFields && optFields.length > 0) {
            const ojobs = optFields.map(f => this.option.getOptionsByCode(f.option_id, 'true'));
            await forkJoin(ojobs)
              .toPromise()
              .then((opts: any[]) => {
                if (opts) {
                  optFields.forEach((f, index) => {
                    const optionList: Array<SelectItem> = [];
                    const optionsData = opts[index];
                    optionsData.forEach(option => {
                      optionList.push({ label: option.option_label, value: option.option_value });
                    });

                    this.optionList.set(f.field_id, optionList);
                  });
                }
              });
          }
        } else {
          this.fields = [];
        }
      });

      if (term) {
        const field = this.fields.find(f => f.field_id === this.lookField);
        if (field.field_type === 'function') {
          field.field_type = field.return_type;
        }
        const searchItem = {
          field_id: this.lookField,
          field_type: field.field_type,
          operator: 'like',
          is_dynamic: true,
          search_value: term,
          condition_type: ''
        };
        const params = {
          condition_list: [searchItem],
          condition_type: 'and',
          page_index: this.pageIndex,
          page_size: this.pageSize
        };

        // 获取数据
        await this.db.getItems(this.lookupDatastoreId, params).then((data: any) => {
          if (data && data.items_list) {
            this.items = data.items_list;
            this.total = data.total;
          } else {
            this.items = [];
            this.total = 0;
          }
        });
      } else {
        const params = {
          condition_list: [],
          condition_type: 'and',
          page_index: this.pageIndex,
          page_size: this.pageSize
        };

        // 获取数据
        await this.db.getItems(this.lookupDatastoreId, params).then((data: any) => {
          if (data && data.items_list) {
            this.items = data.items_list;
            this.total = data.total;
          } else {
            this.items = [];
            this.total = 0;
          }
        });
      }

      this.generateTableData();
    } else {
      this.message.warning(this.i18n.translateLang('common.message.warning.W_002'));
    }

    setTimeout(() => {
      this.viewInit = false;
    }, 2000);
    this.loading = false;
  }

  /**
   * @description: 生成table数据
   */
  generateTableData() {
    this.dataSet = [];
    this.items.forEach((dt, index) => {
      const item: any[] = [];
      item.push(dt.item_id);
      item.push(false);

      this.fields.forEach(fl => {
        if (fl.field_type === 'function') {
          fl.field_type = fl.return_type;
        }
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
                  value = dt.items[key].value === '0001-01-01' ? { data_type: dt.items[key].data_type, value: '' } : dt.items[key];
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
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'options':
                if (dt.items[key]) {
                  const val = dt.items[key].value;
                  const label = this.getOption(val, this.optionList.get(key));
                  value = {
                    data_type: dt.items[key].data_type,
                    value: label
                  };
                }
                break;
              case 'lookup':
                if (dt.items[key]) {
                  value = {
                    data_type: dt.items[key].data_type,
                    lookup_datastore_id: fl.lookup_datastore_id,
                    lookup_field_id: fl.lookup_field_id,
                    value: dt.items[key].value
                  };
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

  /**
   * @description: 选择数据
   */
  check(item_id: string) {
    const it = this.items.find(f => f.item_id === item_id);
    this.lookItem = it.items;
  }

  /**
   * @description: 反映关联台账画面选择的数据
   */
  reflect() {
    this.nxReflect.emit(this.lookItem);
  }

  getOption(value, optionList) {
    const option = optionList.find(o => o.value === value);
    if (option) {
      return this.i18n.translateLang(option.label);
    }
    return '';
  }

  /**
   * @description: 双击反映关联台账画面选择的数据
   */
  doubleClick(item_id: string) {
    this.check(item_id);
    this.reflect();
  }

  cancel() {
    if (this.clear) {
      this.dataSet = [];
    }
    this.nxCancel.emit();
  }
}
