import { format } from 'date-fns';
import * as _ from 'lodash';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { GroupService, OptionService, UserService } from '@api';
import { SelectItem } from '@core';
import { NfValidators } from '@shared';

export interface FormController {
  id: number;
  field_id: any;
  field_type: any;
  lookup_datastore_id?: any;
  lookup_field_id?: any;
  prefix?: string;
  display_digits?: string;
  operator: any;
  is_dynamic: boolean;
  search_value: string | number | boolean;
  condition_type: any;
}

@Component({
  selector: 'app-search-view',
  templateUrl: './search-view.component.html',
  styleUrls: ['./search-view.component.less']
})
export class SearchViewComponent implements OnInit {
  @Input() controls: FormController[] = [];
  @Input() fields: any[] = [];

  @Output() search: EventEmitter<any> = new EventEmitter();
  @Output() queryChange: EventEmitter<any> = new EventEmitter();

  // 共通数据
  users: SelectItem[] = [];
  options: Map<string, Array<SelectItem>> = new Map();
  // 检索表单
  form: FormGroup;
  // 检索条件类型（true-and/false-or）
  conditionType = true;
  // 搜索可用字段
  searchFields: any[] = [];
  // 检索使用-选项数组
  optionArray: Map<string, any[]> = new Map();
  // 检索使用-用户数组
  userArray: Map<string, any[]> = new Map();
  // 检索使用-用户组
  groups: any[] = [];

  // 关联字段检索
  showLookup = false;
  // 关联字段台账
  lookupDatastoreId = '';
  // 关联字段
  lookField = '';
  // 检索的关联字段的位置
  lookIndex = 0;

  // 固定字段
  fixedFields = [
    {
      field_id: 'created_at',
      datastore_id: '',
      field_name: 'page.approve.approvalAt',
      alias_name: 'created_at',
      field_type: 'datetime',
      is_dynamic: false
    },
    {
      field_id: 'created_by',
      datastore_id: '',
      field_name: 'page.approve.applicant',
      alias_name: 'created_by',
      field_type: 'user',
      is_dynamic: false
    }
  ];

  // 台账选择下拉菜单
  statusSelect = [
    {
      label: 'page.approve.statusAdmitted',
      value: 2
    },
    {
      label: 'page.approve.statusRejected',
      value: 3
    },
    {
      label: 'page.approve.statusApproval',
      value: 1
    }
  ];

  constructor(private gs: GroupService, private fb: FormBuilder, private option: OptionService, private user: UserService) {
    this.form = this.fb.group({
      status: [1, []],
      searchType: [true, []]
    });
  }

  ngOnInit(): void {
    this.searchFields = this.fields.filter(f => f.field_type !== 'function' && f.field_type !== 'autonum' && !f.as_title);
    this.searchFields = _.orderBy(this.searchFields, ['display_order'], ['asc']);
    this.searchFields.forEach(f => (f.is_dynamic = true));
    const fixedFields = JSON.parse(JSON.stringify(this.fixedFields));
    this.searchFields.push(...fixedFields);

    if (!this.controls) {
      this.addField();
    } else {
      this.initForm();
    }

    // 组织情报
    this.gs.getGroups().then(res => {
      this.groups = res;
    });
  }

  /**
   * @description: 初始化表单
   */
  initForm() {
    this.controls.forEach((control, index) => {
      const fg = this.fb.group({});

      // 创建表单项目
      // 检索字段
      const fieldCtl = new FormControl(control.field_id);
      // 检索条件
      const operatorCtl = new FormControl(control.operator);

      const validators: ValidatorFn[] = [];

      // 检索值
      const ctl = new FormControl(control.search_value, { validators: validators });

      // 添加表单项目到表单中
      fg.addControl('field_id', fieldCtl);
      fg.addControl('operator', operatorCtl);
      fg.addControl('search_value', ctl);

      this.form.addControl(`ctl_${index + 1}`, fg);
    });
  }

  /**
   * @description: 获取表单group名称
   */
  getGroupName(index: number) {
    return `ctl_${index + 1}`;
  }

  /**
   * @description: 查询关联台账的数据
   */
  async searchItems() {
    this.search.emit();
  }

  /**
   * @description: 编辑查询条件
   */
  queryBuild() {
    const conditions: FormController[] = _.cloneDeep(this.controls.filter(f => f.field_id !== ''));

    conditions.forEach((c: FormController, index: number) => {
      const fg = this.form.get(`ctl_${index + 1}`);
      c.operator = fg.get('operator').value;
      const searchValue = fg.get('search_value').value;
      switch (c.field_type) {
        case 'date':
        case 'datetime':
          c.search_value = format(new Date(searchValue), 'yyyy-MM-dd');
          break;
        case 'time':
          c.search_value = format(new Date(searchValue), 'HH:mm:ss');
          break;
        case 'file':
          c.search_value = searchValue.toString();
          break;
        case 'number':
        case 'autonum':
        case 'switch':
          c.search_value = searchValue == null ? null : searchValue.toString();
          break;
        case 'lookup':
          if (searchValue) {
            c.search_value = searchValue;
          } else {
            c.search_value = '';
          }
          break;
        case 'user':
        case 'type':
        case 'options':
        case 'group':
          if (searchValue instanceof Array) {
            c.search_value = searchValue.join(',');
          } else {
            c.search_value = searchValue;
          }
          break;

        default:
          c.search_value = searchValue;
          break;
      }
    });

    const params = {
      condition_list: conditions,
      condition_type: this.conditionType ? 'and' : 'or',
      search_type: this.form.get('searchType').value ? 'item' : 'history',
      status: this.form.get('status').value
    };

    return params;
  }

  /**
   * @description: 添加检索字段
   */
  addField(): void {
    let id = 0;
    if (this.controls && this.controls.length > 0) {
      id = this.controls[this.controls.length - 1].id + 1;
    } else {
      this.controls = [];
    }

    const control = {
      id,
      field_id: '',
      field_type: '',
      lookup_datastore_id: '',
      lookup_field_id: '',
      prefix: '',
      display_digits: null,
      operator: '',
      search_value: null,
      is_dynamic: true,
      condition_type: ''
    };
    this.controls.push(control);

    this.initForm();

    const params = this.queryBuild();
    this.queryChange.emit(params);
  }

  /**
   * @description: 删除检索字段
   */
  removeField(i: {
    id: number;
    field_id: string;
    field_type: string;
    lookup_datastore_id?: string;
    lookup_field_id?: string;
    prefix?: string;
    operator: string;
    is_dynamic: boolean;
    search_value: string | number | boolean;
    condition_type: string;
  }): void {
    if (this.controls.length > 1) {
      this.controls = this.controls.filter(c => c.id !== i.id);
      this.initForm();
    }

    const params = this.queryBuild();
    this.queryChange.emit(params);
  }

  /**
   * @description: 检索字段变更事件
   */
  fieldChange(event: string, index: number, control: FormController) {
    if (event) {
      control.field_id = event;

      const validators: ValidatorFn[] = [];

      const selectField = this.searchFields.find(f => f.field_id === event);
      if (selectField) {
        control.is_dynamic = selectField.is_dynamic;
        if (selectField.field_type === 'function') {
          control.field_type = selectField.return_type;
        } else {
          control.field_type = selectField.field_type;
        }

        control.operator = '=';
        control.search_value = null;

        this.form.get(`ctl_${index + 1}.operator`).setValue('=');
        this.form.get(`ctl_${index + 1}.search_value`).setValue(null);

        this.form.get(`ctl_${index + 1}.search_value`).setValidators(validators);

        if (selectField.field_type === 'lookup') {
          control.lookup_datastore_id = selectField.lookup_datastore_id;
          control.lookup_field_id = selectField.lookup_field_id;
        }

        if (selectField.field_type === 'options') {
          this.option.getOptionsByCode(selectField.option_id, 'true').then(res => {
            this.optionArray[control.field_id] = res;
          });
        }

        if (selectField.field_type === 'user') {
          if (selectField.is_dynamic) {
            this.user.getRelatedUsers(selectField.user_group_id, 'true').then(res => {
              this.userArray[control.field_id] = res;
            });
          } else {
            this.user.getUsers().then(res => {
              this.userArray[control.field_id] = res;
            });
          }
        }
        if (selectField.field_type === 'autonum') {
          control.prefix = selectField.prefix;
          control.display_digits = selectField.display_digits;
        }
      }
    } else {
      control.operator = null;
      control.field_type = '';
      control.search_value = null;

      this.form.get(`ctl_${index + 1}.operator`).setValue(null);
      this.form.get(`ctl_${index + 1}.search_value`).setValue(null);
    }

    const params = this.queryBuild();
    this.queryChange.emit(params);
  }

  /**
   * @description: 检索条件变更事件
   */
  operatorChange(event: string, control: FormController) {
    if (event) {
      control.operator = event;
    }

    const params = this.queryBuild();
    this.queryChange.emit(params);
  }

  /**
   * @description: 检索值变更事件
   */
  searchValueChange(event: string, control: FormController) {
    if (event) {
      control.search_value = event;
    }

    const params = this.queryBuild();
    this.queryChange.emit(params);
  }
  /**
   * @description: 检索值变更事件
   */
  statusChange(event) {
    const params = this.queryBuild();
    this.queryChange.emit(params);
  }
  /**
   * @description: 检索值变更事件
   */
  conditionTypeChange() {
    const params = this.queryBuild();
    this.queryChange.emit(params);
  }

  /**
   * @description: 检索值变更事件
   */
  searchTypeChange() {
    const params = this.queryBuild();
    this.queryChange.emit(params);
  }

  /**
   * @description: 重置事件
   */
  reset() {
    this.controls.forEach((c: FormController, index: number) => {
      this.form.removeControl(`ctl_${index + 1}`);
    });
    this.controls = [];
    this.form.get('status').setValue(1);
    this.form.get('searchType').setValue(true);
    this.addField();
    const params = this.queryBuild();
    this.queryChange.emit(params);
  }

  /**
   * @description: 打开关联检索画面
   */
  async openLookupModal(index: number, datastoreId: string, fieldId: string) {
    this.lookIndex = index;
    this.lookupDatastoreId = datastoreId;
    this.lookField = fieldId;
    this.showLookup = true;
  }

  /**
   * @description: 关闭关联检索画面
   */
  cancel() {
    this.showLookup = false;
  }

  /**
   * @description: 返回检索数据，并关闭关联检索画面
   */
  reflect(item: any) {
    const ctl = this.controls[item.index];
    this.form.get(`ctl_${item.index + 1}.search_value`).setValue(item.value.items[ctl.lookup_field_id].value);
    ctl.search_value = item.value.items[ctl.lookup_field_id].value;
    this.showLookup = false;
    const params = this.queryBuild();
    this.queryChange.emit(params);
  }
}
