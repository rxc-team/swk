import { FieldTypeList } from 'app/pages/datastore/field-type';
import { isMatch } from 'date-fns';
import { cloneDeep, sortBy } from 'lodash';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { forkJoin } from 'rxjs';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FieldService, GenService, OptionService } from '@api';
import { I18NService } from '@core';
import { isNumber } from '@shared/validate/validate';

import {
    GenerateFieldSettingComponent
} from '../components/generate-field-setting/generate-field-setting.component';
import {
    GenerateMasterSettingComponent
} from '../components/generate-master-setting/generate-master-setting.component';
import {
    GenerateOptionSettingComponent
} from '../components/generate-option-setting/generate-option-setting.component';
import {
    GenerateUserSettingComponent
} from '../components/generate-user-setting/generate-user-setting.component';
import { StepService } from '../step.service';

export interface Field {
  field_id: string;
  field_name: string;
  field_type: string;
  display_order: number;
  // 状态属性
  is_required: boolean;
  is_fixed: boolean;
  is_image: boolean;
  is_check_image: boolean;
  unique: boolean;
  as_title: boolean;
  // 关联属性
  lookup_datastore_id: string; // 关联的台账
  lookup_field_id: string; // 关联的字段
  user_group_id: string; // 关联的组织ID
  option_id: string; // 关联的选项ID
  // 详细属性
  min_length: number; // 文本最小长度
  max_length: number; // 文本最大长度
  min_value: number; // 数字最小值
  max_value: number; // 数字最大值
  precision: number; // 小数精度
  display_digits: number; // 自动採番位数
  prefix: string; // 自动採番前缀
  return_type: string; // 函数返回类型
  formula: string; // 函数公式
  // CSV配置属性
  csv_header: string; // CSV文件名
  can_change: boolean; // 是否可变更，从元数据读取的情况不可变更
  is_empty_line: boolean; // 不需要导入到元台账的场合设置为true
  check_errors?: string; // 检查错误
}

@Component({
  selector: 'app-generate-attr-set',
  templateUrl: './generate-attr-set.component.html',
  styleUrls: ['./generate-attr-set.component.less']
})
export class GenerateAttrSetComponent implements OnInit {
  fieldList: Field[] = [];
  csvHeader = [];
  errorList = [];

  width = ['40px', '40px', '40px', '200px', '200px', '140px', '160px', '160px', ''];

  filedTypes = FieldTypeList;
  fields = [];

  cols = [
    {
      title: 'page.workflow.no',
      width: '45px'
    },
    {
      title: 'page.datastore.mapping.mappingPrimaryKey',
      width: '80px'
    },
    {
      title: 'page.datastore.mapping.mappingKeyName',
      width: '120px'
    },
    {
      title: 'page.datastore.mapping.mappingFieldType',
      width: '150px'
    },
    {
      title: 'page.datastore.mapping.mappingFieldName',
      width: '120px'
    },
    {
      title: 'page.datastore.mapping.mappingDateFormat',
      width: '160px'
    },
    {
      title: 'page.datastore.mapping.mappingDefaultValue',
      width: '220px'
    },
    {
      title: ''
    }
  ];

  constructor(
    private fs: FieldService,
    private gs: GenService,
    private ops: OptionService,
    private sts: StepService,
    private i18n: I18NService,
    private router: Router,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  async init() {
    await this.gs.getRowData(1, 1).then(data => {
      if (data) {
        this.csvHeader = data.header;
      } else {
        this.csvHeader = [];
      }
    });

    const data = await this.gs.getConfig();

    if (data && data.datastore_id) {
      if (data.fields?.length > 0) {
        this.fields = data.fields;
      } else {
        await this.fs.getFields(data.datastore_id).then((d: Field[]) => {
          if (d) {
            this.fields = d.filter(f => f.field_type !== 'function' && f.field_type !== 'autonum' && f.field_type !== 'file');
            this.fields.forEach(f => (f.field_name = this.i18n.translateLang(f.field_name)));
          } else {
            this.fields = [];
          }
        });
      }
    }

    this.build();
  }

  build() {
    this.fieldList = [];
    // 存在字段的情况下，自动识别匹配数据
    if (this.fields.length > 0) {
      this.csvHeader.forEach((h, i) => {
        const fs = this.fields.find(f => f.field_name === h);
        if (fs) {
          fs.csv_header = h; // CSV文件名
          fs.can_change = fs.can_change || false; // 是否可变更，从元数据读取的情况不可变更
          fs.is_empty_line = fs.is_empty_line || false; // 不需要导入到元台账的场合设置为true
          fs.check_errors = '';

          this.fieldList = [...this.fieldList, cloneDeep(fs)];
        } else {
          const field: Field = {
            field_id: 'field_' + this.genUUID(3),
            field_name: h,
            field_type: 'text',
            display_order: i + 1,
            // 状态属性
            is_required: false,
            is_fixed: false,
            is_image: false,
            is_check_image: false,
            unique: false,
            as_title: false,
            // 关联属性
            lookup_datastore_id: '', // 关联的台账
            lookup_field_id: '', // 关联的字段
            user_group_id: '', // 关联的组织ID
            option_id: '', // 关联的选项ID
            // 详细属性
            min_length: 0, // 文本最小长度
            max_length: 0, // 文本最大长度
            min_value: 0, // 数字最小值
            max_value: 0, // 数字最大值
            precision: 0, // 小数精度
            display_digits: 0, // 自动採番位数
            prefix: '', // 自动採番前缀
            return_type: '', // 函数返回类型
            formula: '', // 函数公式
            // CSV文件名
            csv_header: h, // CSV文件名
            can_change: true, // 是否可变更，从元数据读取的情况不可变更
            is_empty_line: true, // 不需要导入到元台账的场合设置为true
            check_errors: ''
          };

          this.fieldList = [...this.fieldList, field];
        }
      });

      this.fieldList = sortBy(this.fieldList, 'display_order');

      return;
    }

    // 不存在系统字段的情况下，直接使用默认识别
    this.csvHeader.forEach((h, i) => {
      const field: Field = {
        field_id: 'field_' + this.genUUID(3),
        field_name: h,
        field_type: 'text',
        display_order: i + 1,
        // 状态属性
        is_required: false,
        is_fixed: false,
        is_image: false,
        is_check_image: false,
        unique: false,
        as_title: false,
        // 关联属性
        lookup_datastore_id: '', // 关联的台账
        lookup_field_id: '', // 关联的字段
        user_group_id: '', // 关联的组织ID
        option_id: '', // 关联的选项ID
        // 详细属性
        min_length: 0, // 文本最小长度
        max_length: 0, // 文本最大长度
        min_value: 0, // 数字最小值
        max_value: 0, // 数字最大值
        precision: 0, // 小数精度
        display_digits: 0, // 自动採番位数
        prefix: '', // 自动採番前缀
        return_type: '', // 函数返回类型
        formula: '', // 函数公式
        // CSV文件名
        csv_header: h, // CSV文件名
        can_change: true, // 是否可变更，从元数据读取的情况不可变更
        is_empty_line: false, // 不需要导入到元台账的场合设置为true
        check_errors: ''
      };
      this.fieldList = [...this.fieldList, field];
    });

    this.fieldList = sortBy(this.fieldList, 'display_order');
  }

  generateField() {
    // 存在字段的情况下，自动识别匹配数据
    if (this.fields.length > 0) {
      this.csvHeader.forEach((h, i) => {
        const fs = this.fields.find(f => f.field_name === h);
        if (!fs) {
          const field: Field = {
            field_id: 'field_' + this.genUUID(3),
            field_name: h,
            field_type: 'text',
            display_order: i + 1,
            // 状态属性
            is_required: false,
            is_fixed: false,
            is_image: false,
            is_check_image: false,
            unique: false,
            as_title: false,
            // 关联属性
            lookup_datastore_id: '', // 关联的台账
            lookup_field_id: '', // 关联的字段
            user_group_id: '', // 关联的组织ID
            option_id: '', // 关联的选项ID
            // 详细属性
            min_length: 0, // 文本最小长度
            max_length: 0, // 文本最大长度
            min_value: 0, // 数字最小值
            max_value: 0, // 数字最大值
            precision: 0, // 小数精度
            display_digits: 0, // 自动採番位数
            prefix: '', // 自动採番前缀
            return_type: '', // 函数返回类型
            formula: '', // 函数公式
            // CSV文件名
            csv_header: h, // CSV文件名
            can_change: true, // 是否可变更，从元数据读取的情况不可变更
            is_empty_line: false, // 不需要导入到元台账的场合设置为true
            check_errors: ''
          };

          this.fields = [...this.fields, field];
        }
      });
      this.build();
      return;
    }
  }

  /**
   * 生成随机的 UUID
   */
  genUUID(randomLength) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now())
      .toString(36)
      .substring(0, 3);
  }

  async dataTypeChange(dataType, item: Field, i) {
    item.check_errors = '';

    const rows = await this.gs.getColumnData(item.field_name);

    if (!this.checkData(dataType, rows[i])) {
      // 有错误的情况下
      item.check_errors = this.i18n.translateLang('common.message.error.E_037', {
        header: item.csv_header,
        dataType: dataType,
        line: i + 1,
        value: rows[i]
      });
    }
  }

  checkData(dataType, value) {
    if (dataType === 'text' && typeof value === 'string') {
      return true;
    }
    if (dataType === 'textarea' && typeof value === 'string') {
      return true;
    }
    if (dataType === 'options' && typeof value === 'string') {
      return true;
    }
    if (dataType === 'user' && typeof value === 'string') {
      return true;
    }
    if (dataType === 'number' && typeof value === 'string') {
      return isNumber(value);
    }
    if (dataType === 'date' && typeof value === 'string') {
      return isMatch(value, 'yyyy-MM-dd');
    }
    if (dataType === 'time' && typeof value === 'string') {
      return isMatch(value, 'HH:mm:ss') || isMatch(value, 'HH:mm');
    }
    if (dataType === 'switch' && typeof value === 'string') {
      return this.isBoolean(value);
    }
    if (dataType === 'file' && typeof value === 'string') {
      return true;
    }
    if (dataType === 'lookup' && typeof value === 'string') {
      return true;
    }
    if (dataType === 'autonum' || dataType === 'function') {
      return true;
    }
    return false;
  }

  disabled(f: Field) {
    if (!f.can_change) {
      return true;
    }

    if (f.is_empty_line) {
      return true;
    }

    return false;
  }

  isBoolean(value: string) {
    if (value.toUpperCase() === 'TRUE' || value.toUpperCase() === 'FALSE') {
      return true;
    }

    return false;
  }

  fieldSelectChange(v, i) {
    if (v) {
      const fv = this.fields.find(f => f.field_id === v);
      fv.csv_header = this.fieldList[i].csv_header; // CSV文件名
      fv.can_change = fv.can_change || false; // 是否可变更，从元数据读取的情况不可变更
      fv.is_empty_line = fv.is_empty_line || false; // 不需要导入到元台账的场合设置为true
      this.fieldList[i] = cloneDeep(fv);

      this.errorList = [];
      const fs = this.fieldList.filter(f => f.field_id === v);
      if (fs && fs.length > 1) {
        this.errorList.push(this.i18n.translateLang('common.message.error.E_038', { filed_name: fv.field_name }));
      }

      return;
    }

    this.fieldList[i].field_type = 'text';
    this.fieldList[i].is_required = false;
    this.fieldList[i].is_fixed = false;
    this.fieldList[i].is_image = false;
    this.fieldList[i].is_check_image = false;
    this.fieldList[i].unique = false;
    this.fieldList[i].as_title = false;
    this.fieldList[i].lookup_datastore_id = '';
    this.fieldList[i].lookup_field_id = '';
    this.fieldList[i].user_group_id = '';
    this.fieldList[i].option_id = '';
    this.fieldList[i].min_length = 0;
    this.fieldList[i].max_length = 0;
    this.fieldList[i].min_value = 0;
    this.fieldList[i].max_value = 0;
    this.fieldList[i].precision = 0;
    this.fieldList[i].display_digits = 0;
    this.fieldList[i].prefix = '';
    this.fieldList[i].return_type = '';
    this.fieldList[i].formula = '';
    this.fieldList[i].is_empty_line = true;
  }

  fieldInputChange(v, i) {
    setTimeout(() => {
      if (v) {
        this.errorList = [];
        const fs = this.fieldList.filter(f => f.field_name === v);
        if (fs && fs.length > 1) {
          this.fieldList[i].check_errors = this.i18n.translateLang('common.message.error.E_038', { filed_name: v });
        } else {
          this.fieldList[i].check_errors = this.i18n.translateLang('common.message.error.E_038', { filed_name: v });
        }

        return;
      }
    }, 0);
  }

  fieldSetting(f: Field) {
    const modal: NzModalRef = this.modal.create({
      nzTitle: this.i18n.translateLang('page.generage.fieldAttrSet'),
      nzContent: GenerateFieldSettingComponent,
      nzMask: false,
      nzComponentParams: {
        fieldId: f.field_id,
        disabled: this.disabled(f),
        fieldType: f.field_type,
        minLength: f.min_length,
        minValue: f.min_value,
        maxLength: f.max_length,
        maxValue: f.max_value,
        precision: f.precision
      },
      nzFooter: [
        {
          label: this.i18n.translateLang('common.button.save'),
          type: 'primary',
          disabled: instance => instance.fieldForm.invalid,
          onClick: instance => {
            const form = instance.fieldForm.value;
            if (form.fieldID) {
              f.field_id = form.fieldID;
            }
            if (form.minLength) {
              f.min_length = form.minLength;
            }
            if (form.minValue) {
              f.min_value = form.minValue;
            }
            if (form.maxLength) {
              f.max_length = form.maxLength;
            }
            if (form.maxValue) {
              f.max_value = form.maxValue;
            }
            if (form.precision) {
              f.precision = form.precision;
            }
            modal.destroy();
          }
        }
      ],
      nzOnCancel: instance => {
        modal.destroy();
      }
    });
  }

  async optionSetting(f: Field, i) {
    f.check_errors = '';

    const cols = await this.gs.getColumnData(f.field_name);

    // 选项数量大于500的场合，不能创建选项类型的数据
    if (cols.size > 500) {
      f.check_errors = this.i18n.translateLang('common.message.error.E_039');
      return;
    }

    const modal: NzModalRef = this.modal.create({
      nzTitle: this.i18n.translateLang('page.generage.relationSet'),
      nzWidth: '800px',
      nzContent: GenerateOptionSettingComponent,
      nzMask: false,
      nzComponentParams: {
        optionId: f.option_id,
        disabled: this.disabled(f),
        dataList: Array.from(cols)
      },
      nzFooter: [
        {
          label: this.i18n.translateLang('common.button.save'),
          type: 'primary',
          disabled: instance => instance.optionForm.invalid,
          onClick: async instance => {
            const options = instance.displayData;

            const form = instance.optionForm.value;
            if (form.optionId) {
              if (options && options.length > 0) {
                const newList = options.filter(o => o.status === 'new');
                const jobs = newList.map(f => {
                  const p = {
                    option_id: form.optionId,
                    option_name: f.option_name,
                    option_order: 0,
                    option_memo: f.option_memo,
                    option_label: f.option_label,
                    is_new_option_group: false,
                    option_value: f.option_value
                  };
                  return this.ops.addOption(p);
                });
                await forkJoin(jobs).toPromise();
              }

              modal.destroy();
              return;
            }

            if (options && options.length > 0) {
              const newList = options.filter(o => o.status === 'new');
              const first = newList[0];

              const params = {
                option_id: '',
                option_name: form.optionName,
                option_order: 0,
                option_memo: form.optionMemo,
                option_label: first.option_label,
                is_new_option_group: true,
                option_value: first.option_value
              };

              const group = await this.ops.addOption(params);

              const jobs = newList.slice(1).map(f => {
                const p = {
                  option_id: group.option_id,
                  option_name: form.optionName,
                  option_order: 0,
                  option_memo: form.optionMemo,
                  option_label: f.option_label,
                  is_new_option_group: false,
                  option_value: f.option_value
                };
                return this.ops.addOption(p);
              });
              await forkJoin(jobs).toPromise();
            }

            modal.destroy();
          }
        }
      ],
      nzOnCancel: instance => {
        if (!instance.getForm('optionName').value) {
          f.check_errors = this.i18n.translateLang('common.message.error.E_040');
        }
        modal.destroy();
      }
    });
  }

  async masterSetting(f: Field, i) {
    this.errorList = [];

    const cols = await this.gs.getColumnData(f.field_name);

    const modal: NzModalRef = this.modal.create({
      nzTitle: this.i18n.translateLang('page.generage.relationSet'),
      nzContent: GenerateMasterSettingComponent,
      nzMask: false,
      nzComponentParams: {
        lookupDatastoreId: f.lookup_datastore_id,
        lookupFieldId: f.lookup_field_id,
        disabled: this.disabled(f)
      },
      nzFooter: [
        {
          label: this.i18n.translateLang('common.button.save'),
          type: 'primary',
          disabled: instance => instance.form.invalid,
          onClick: instance => {
            const form = instance.form.value;
            if (form.lookupDatastoreId) {
              f.lookup_datastore_id = form.lookupDatastoreId;
            }
            if (form.lookupFieldId) {
              f.lookup_field_id = form.lookupFieldId;
            }

            modal.destroy();
          }
        }
      ],
      nzOnCancel: instance => {
        if (!instance.getForm('lookupFieldId').value) {
          f.check_errors = this.i18n.translateLang('common.message.error.E_041');
        }
        modal.destroy();
      }
    });
  }

  userSetting(f: Field) {
    const modal: NzModalRef = this.modal.create({
      nzTitle: this.i18n.translateLang('page.generage.relationSet'),
      nzContent: GenerateUserSettingComponent,
      nzMask: false,
      nzComponentParams: {
        groupId: f.user_group_id,
        disabled: this.disabled(f)
      },
      nzFooter: [
        {
          label: this.i18n.translateLang('common.button.save'),
          type: 'primary',
          disabled: instance => instance.form.invalid,
          onClick: instance => {
            const form = instance.form.value;
            if (form.userGroup) {
              f.user_group_id = form.userGroup;
            }

            modal.destroy();
          }
        }
      ],
      nzOnCancel: instance => {
        if (!instance.getForm('userGroup').value) {
          f.check_errors = this.i18n.translateLang('common.message.error.E_042');
        }
        modal.destroy();
      }
    });
  }

  /**
   * @description: 拖动改变排序字段顺序
   */
  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.fieldList, event.previousIndex, event.currentIndex);
    this.fieldList.forEach((s, i) => {
      s.display_order = i + 1;
    });
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }

  async clear() {
    await this.gs.complete();
    this.router.navigate(['generate']);
  }

  pre() {
    this.sts.pre();
  }

  async next() {
    await this.gs.setFields({ fields: this.fieldList });
    this.sts.next();
  }
}
