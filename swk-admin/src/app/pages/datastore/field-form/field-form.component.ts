/*
 * @Description: 字段编辑
 * @Author: RXC 呉見華
 * @Date: 2019-08-05 17:53:29
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2021-01-18 14:56:30
 */

import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { fi_FI } from 'ng-zorro-antd/i18n';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatastoreService, FieldService, GroupService, OptionService, RoleService, ValidationService } from '@api';
import { I18NService } from '@core';
import { NfValidators } from '@shared';

import { FieldTypeList } from '../field-type';

@Component({
  selector: 'app-field-form',
  templateUrl: './field-form.component.html',
  styleUrls: ['./field-form.component.less']
})
export class FieldFormComponent implements OnInit {
  // 构造函数
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private datastoreService: DatastoreService,
    private fieldService: FieldService,
    private location: Location,
    private event: NgEventBus,
    private optionService: OptionService,
    private groupService: GroupService,
    private roleService: RoleService,
    private validation: ValidationService,
    private i18n: I18NService,
    private message: NzMessageService,
    private bs: NzBreakpointService
  ) {
    bs.subscribe({
      xs: '480px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1600px',
      xxl: '1600px'
    }).subscribe(data => {
      if (data === 'sm' || data === 'xs') {
        this.isSmall = true;
      } else {
        this.isSmall = false;
      }
    });

    // 监听公式校验事件
    event.on('func:verify').subscribe((data: any) => {
      if (data) {
        if (data.result) {
          this.fieldForm.get('formula').setErrors(null);
        } else {
          this.fieldForm.get('formula').setErrors({ func: true });
        }
      } else {
        this.fieldForm.get('formula').setErrors({});
      }
    });

    this.fieldForm = this.fb.group({
      fieldName: ['', [Validators.required], [this.fieldNameAsyncValidator]],
      fieldID: ['', [Validators.required, Validators.pattern('^[a-zA-Z_]+[a-z0-9A-Z_]{0,49}')], [this.fieldIDAsyncValidator]],
      fieldType: [null, [Validators.required]],
      isRequired: [null, null],
      isFixed: [null, null],
      isImage: [null, null],
      isCheckImage: [null, null],
      unique: [null, null],
      asTitle: [null, null],
      minLength: [0, [Validators.required, this.minLengthValidator]],
      maxLength: [100, [Validators.required]],
      minValue: [0, [Validators.required, this.minValueValidator]],
      maxValue: [99999, [Validators.required]],
      precision: [0, [Validators.required]],
      userGroup: [null, null],
      option: [null, null],
      lookupDatastoreId: [null, null],
      lookupFieldId: [null, null],
      displayDigits: [6, []],
      returnType: [null, []],
      formula: [null, []],
      selfCalculate: [null, []],
      prefix: ['', []]
    });
  }

  // 全局类型
  // 画面迁移元区分flag
  status = 'add';
  // 表单数据
  fieldForm: FormGroup;
  // 台账选项
  datastores = [];
  // 是否已经设定盘点图片字段
  isCheckImageNotSet = false;
  // 是否显示作为盘点图片
  isShowCheckImageOption = false;
  // 字段选项
  fields = [];
  // 系统使用的api-key禁用
  systemApiKey = ['id', 'index', 'template_id'];
  // 选项
  options = [];
  // 用户选项
  userGroups = [];
  // 角色
  rolesSelect = [];
  // 字段类型选项
  fieldTypeList = FieldTypeList;

  needNum = false;

  isSmall = false;

  // 字段更新之前的值
  isRequireOld = false;
  isFixedOld = false;

  api_key: string;
  isGroupUniqueKey = false;

  /**
   * @description: 画面初始化
   */
  ngOnInit() {
    this.init();
  }

  /**
   * @description: 初始化处理
   */
  async init() {
    const fieldId = this.route.snapshot.paramMap.get('f_id');
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    if (datastoreId && fieldId) {
      this.status = 'edit';
      // 验证字段是否为组合唯一字段
      await this.datastoreService.getDatastoreByID(datastoreId).then((data: any) => {
        if (data && data.unique_fields) {
          data.unique_fields.forEach(element => {
            const isExit = element.indexOf(fieldId);
            if (isExit != -1) {
              this.isGroupUniqueKey = true;
            }
          });
        }
      });
      await this.getFieldInfo(datastoreId, fieldId);
    } else {
      await this.setDefaultApiKey();
    }

    this.api_key = this.fieldForm.get('fieldID').value;
    await this.getSelectData();
  }

  /**
   * @description: 获取选择框数据
   */
  async getSelectData() {
    await this.roleService.getRoles().then((data: any[]) => {
      if (data) {
        this.rolesSelect = data;
      } else {
        this.rolesSelect = [];
      }
    });
  }

  /**
   * @description: 字段名称唯一性检查
   */
  fieldNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const datastoreId = this.route.snapshot.paramMap.get('d_id');
      const fieldID = this.route.snapshot.paramMap.get('f_id');
      this.validation.validationUnique('fields', control.value, { prefix: datastoreId, change_id: fieldID }).then((has: boolean) => {
        if (has) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 字段ID唯一性检查
   */
  fieldIDAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const datastoreId = this.route.snapshot.paramMap.get('d_id');
      if (this.systemApiKey.find(key => key === control.value)) {
        observer.next({ error: true, systemUseApiKey: true });
        observer.complete();
      }
      if (control.value) {
        this.fieldService.fieldIDAsyncValidator(datastoreId, control.value).then((field: boolean) => {
          if (!field) {
            observer.next({ error: true, duplicated: true });
          } else {
            observer.next(null);
          }
          observer.complete();
        });
      } else {
        observer.next(null);
        observer.complete();
      }
    });

  /**
   * @description: 生成默认APP-KEY,提供参考
   */
  async setDefaultApiKey() {
    this.fieldForm.controls.fieldID.setValue('field_' + this.genUUID(3));
    this.fieldForm.controls.fieldID.markAsTouched();
  }

  /**
   * 生成随机的 UUID
   */
  genUUID(randomLength) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now())
      .toString(36)
      .substring(0, 3);
  }

  /**
   * @description: 通过id获取字段信息
   */
  async getFieldInfo(datastoreId: string, fieldId: string) {
    await this.fieldService.getFieldByID(datastoreId, fieldId).then(async (data: any) => {
      if (data) {
        this.fieldForm.controls.fieldName.setValue(this.i18n.translateLang(data.field_name));
        this.fieldForm.controls.fieldType.setValue(data.field_type);
        this.fieldForm.controls.asTitle.setValue(data.as_title);
        this.fieldForm.controls.isRequired.setValue(data.is_required);
        this.fieldForm.controls.isFixed.setValue(data.is_fixed);
        this.fieldForm.controls.fieldID.setValue(data.field_id);
        this.fieldForm.controls.fieldID.disable();
        this.fieldForm.controls.unique.setValue(data.unique);

        this.isRequireOld = data.is_required ? data.is_required : false;
        this.isFixedOld = data.is_fixed ? data.is_fixed : false;

        // 判断字段类型
        if (data.field_type === 'function') {
          this.fieldForm.controls.returnType.setValue(data.return_type);
          // this.formulaValue = data.formula;
          // await this.getSelectFields();
          // this.setTips(data.formula);
          this.fieldForm.controls.formula.setValue(data.formula);
        }
        if (data.field_type === 'autonum') {
          this.fieldForm.controls.displayDigits.setValue(data.display_digits ? data.display_digits : '');
          this.fieldForm.controls.prefix.setValue(data.prefix);
        }
        if (data.field_type === 'text' || data.field_type === 'textarea') {
          this.fieldForm.controls.minLength.setValue(data.min_length);
          this.fieldForm.controls.maxLength.setValue(data.max_length);
        }
        if (data.field_type === 'number') {
          this.fieldForm.controls.minValue.setValue(data.min_value);
          this.fieldForm.controls.maxValue.setValue(data.max_value);
          this.fieldForm.controls.precision.setValue(data.precision);
          this.fieldForm.controls.selfCalculate.setValue(data.self_calculate);
        }
        if (data.field_type === 'file') {
          this.fieldForm.controls.isImage.setValue(data.is_image);
          this.fieldForm.controls.isCheckImage.setValue(data.is_check_image);
        }
        if (data.field_type === 'lookup') {
          this.fieldForm.controls.lookupDatastoreId.setValue(data.lookup_datastore_id);
          await this.datastoreChange(data.lookup_datastore_id);
          this.fieldForm.controls.lookupFieldId.setValue(data.lookup_field_id);
        }
        if (data.field_type === 'user') {
          this.fieldForm.controls.userGroup.setValue(data.user_group_id);
        }
        if (data.field_type === 'options') {
          this.fieldForm.controls.option.setValue(data.option_id);
        }
      } else {
        this.message.warning(this.i18n.translateLang('common.message.warning.W_002'));
        this.location.back();
      }
    });
  }

  /**
   * @description: 添加字段事件
   */
  submitFieldForm = ($event: any, value: any) => {
    // 添加字段数据
    const params = {
      field_name: this.fieldForm.controls.fieldName.value,
      field_type: this.fieldForm.controls.fieldType.value
    };

    // 判断字段类型
    if (params.field_type === 'file') {
      params['is_image'] = this.fieldForm.controls.isImage.value;
      params['is_check_image'] = this.fieldForm.controls.isCheckImage.value;
    }
    if (params.field_type === 'lookup') {
      params['lookup_app_id'] = this.route.snapshot.paramMap.get('a_id');
      params['lookup_datastore_id'] = this.fieldForm.controls.lookupDatastoreId.value;
      params['lookup_field_id'] = this.fieldForm.controls.lookupFieldId.value;
    }
    if (params.field_type === 'user') {
      params['user_group_id'] = this.fieldForm.controls.userGroup.value;
    }
    if (params.field_type === 'number') {
      params['self_calculate'] = this.fieldForm.controls.selfCalculate.value;
    }
    if (params.field_type === 'options') {
      params['option_id'] = this.fieldForm.controls.option.value;
    }
    if (params.field_type === 'autonum') {
      params['display_digits'] = this.fieldForm.controls.displayDigits.value;
      params['prefix'] = this.fieldForm.controls.prefix.value;
    }
    if (params.field_type === 'function') {
      params['return_type'] = this.fieldForm.controls.returnType.value;
      params['formula'] = this.fieldForm.controls.formula.value;
    }

    // 通过路由获取datastoreID
    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    if (this.status === 'add') {
      params['is_required'] = this.fieldForm.controls.isRequired.value;
      params['is_fixed'] = this.fieldForm.controls.isFixed.value;
      params['as_title'] = this.fieldForm.controls.asTitle.value;
      params['unique'] = this.fieldForm.controls.unique.value;
      params['field_id'] = this.fieldForm.controls.fieldID.value;

      if (params.field_type === 'number') {
        params['min_value'] = this.fieldForm.controls.minValue.value;
        params['max_value'] = this.fieldForm.controls.maxValue.value;
        params['precision'] = this.fieldForm.controls.precision.value;
      }

      if (params.field_type === 'text' || params.field_type === 'textarea') {
        params['min_length'] = this.fieldForm.controls.minLength.value;
        params['max_length'] = this.fieldForm.controls.maxLength.value;
      }
      // 如果入力了Field_id添加字段前再次对字段ID唯一性检查,如果没有入力，后台自动生成，不需要判断
      if (this.fieldForm.controls.fieldID.value) {
        this.fieldService.getFieldByID(datastoreId, this.fieldForm.controls.fieldID.value).then((field: any) => {
          if (field) {
            this.message.warning(this.i18n.translateLang('common.message.warning.W_011'));
            this.setDefaultApiKey();
          } else {
            // 调用服务添加字段
            this.fieldService.addField(datastoreId, params).then(res => {
              this.message.success(this.i18n.translateLang('common.message.success.S_001'));
              this.event.cast('field:refresh');
              this.reset();
            });
          }
        });
      } else {
        // 调用服务添加字段
        this.fieldService.addField(datastoreId, params).then(res => {
          this.message.success(this.i18n.translateLang('common.message.success.S_001'));
          this.event.cast('field:refresh');
          this.reset();
        });
      }
    } else {
      // 调用服务更新字段
      params['datastore_id'] = this.route.snapshot.paramMap.get('d_id');
      if (
        params.field_type === 'file' &&
        this.fieldForm.controls.isImage.value !== null &&
        this.fieldForm.controls.isImage.value !== undefined
      ) {
        params['is_image'] = this.fieldForm.controls.isImage.value.toString();
        if (this.fieldForm.controls.isCheckImage.value !== null && this.fieldForm.controls.isCheckImage.value !== undefined) {
          params['is_check_image'] = this.fieldForm.controls.isCheckImage.value.toString();
        }
      }
      if (this.fieldForm.controls.isRequired.value !== null && this.fieldForm.controls.isRequired.value !== undefined) {
        params['is_required'] = this.fieldForm.controls.isRequired.value.toString();
      }
      if (this.fieldForm.controls.isFixed.value !== null && this.fieldForm.controls.isFixed.value !== undefined) {
        params['is_fixed'] = this.fieldForm.controls.isFixed.value.toString();
      }
      if (this.fieldForm.controls.asTitle.value !== null && this.fieldForm.controls.asTitle.value !== undefined) {
        params['as_title'] = this.fieldForm.controls.asTitle.value.toString();
      }
      if (this.fieldForm.controls.unique.value !== null && this.fieldForm.controls.unique.value !== undefined) {
        params['unique'] = this.fieldForm.controls.unique.value.toString();
      }

      if (params.field_type === 'number') {
        params['min_value'] = this.fieldForm.controls.minValue.value.toString();
        params['max_value'] = this.fieldForm.controls.maxValue.value.toString();
        params['precision'] = this.fieldForm.controls.precision.value.toString();
      }

      if (params.field_type === 'text' || params.field_type === 'textarea') {
        params['min_length'] = this.fieldForm.controls.minLength.value.toString();
        params['max_length'] = this.fieldForm.controls.maxLength.value.toString();
      }

      if (params.field_type === 'autonum') {
        params['display_digits'] = this.fieldForm.controls.displayDigits.value.toString();
        params['prefix'] = this.fieldForm.controls.prefix.value.toString();
      }

      const fieldId = this.route.snapshot.paramMap.get('f_id');
      this.fieldService.updateField(fieldId, params).then(res => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        this.event.cast('field:refresh');
        this.location.back();
      });
    }
  };

  /**
   * @description: 是否作为图片变更
   */
  imageChange(value: boolean) {
    if (!value) {
      this.fieldForm.controls.isCheckImage.setValue(false);
    }
  }

  /**
   * @description: 是否作为盘点图片变更
   */
  checkImageChange(value: boolean) {
    if (value) {
      this.fieldForm.controls.isImage.setValue(true);
    }
  }

  /**
   * @description: 目前小数不允许使用自算功能。会导致计算不准确。
   */
  precisionChange(v: number) {
    if (v > 0) {
      this.fieldForm.get('selfCalculate').setValue('');
    }
  }

  /**
   * @description: 重置表单
   */
  reset(): void {
    this.fieldForm.reset();
    this.init();
  }

  /**
   * @description: 取消当前操作，返回上级
   */
  cancel() {
    this.location.back();
  }

  /**
   * @description: 函数返回类型变更
   */
  returnTypeChange(value: string) {
    // this.fieldForm.controls.formula.reset();
  }

  /**
   * @description: 改变类型
   */
  async typeChange(value) {
    // 重置check
    this.fieldForm.controls.returnType.setValidators([]);
    this.fieldForm.controls.formula.setValidators([]);
    this.fieldForm.controls.displayDigits.setValidators([]);
    this.fieldForm.controls.displayDigits.reset();
    this.resetFunction();
    this.fieldForm.controls.option.setValidators([]);
    this.fieldForm.controls.userGroup.setValidators([]);
    this.fieldForm.controls.lookupDatastoreId.setValidators([]);
    this.fieldForm.controls.lookupFieldId.setValidators([]);
    this.fieldForm.controls.option.reset();
    this.fieldForm.controls.userGroup.reset();
    this.fieldForm.controls.lookupDatastoreId.reset();
    this.fieldForm.controls.lookupFieldId.reset();
    this.fieldForm.controls.minLength.setValidators([]);
    this.fieldForm.controls.maxLength.setValidators([]);
    this.fieldForm.controls.minValue.setValidators([]);
    this.fieldForm.controls.maxValue.setValidators([]);
    this.fieldForm.controls.precision.setValidators([]);

    if (value === 'file') {
      await this.isShowCheckImageOp();
    } else {
      this.isShowCheckImageOption = false;
    }
    if (value === 'lookup') {
      this.getDatastores();
      this.fieldForm.controls.lookupDatastoreId.setValidators([Validators.required]);
      this.fieldForm.controls.lookupFieldId.setValidators([Validators.required]);
    }
    if (value === 'options') {
      this.getOptions();
      this.fieldForm.controls.option.setValidators([Validators.required]);
    }
    if (value === 'user') {
      this.getGroups();
      this.fieldForm.controls.userGroup.setValidators([Validators.required]);
    }
    if (value === 'function') {
      this.fieldForm.controls.returnType.setValidators([Validators.required]);
    }

    if (value === 'text' || value === 'textarea') {
      this.fieldForm.controls.minLength.setValidators([Validators.required, this.minLengthValidator]);
      this.fieldForm.controls.maxLength.setValidators([Validators.required]);

      this.fieldForm.controls.minLength.reset(0);
      this.fieldForm.controls.maxLength.reset(100);
    } else if (value === 'number') {
      this.fieldForm.controls.minValue.setValidators([Validators.required, this.minValueValidator]);
      this.fieldForm.controls.maxValue.setValidators([Validators.required]);
      this.fieldForm.controls.precision.setValidators([Validators.required]);
      this.fieldForm.controls.minValue.reset(0);
      this.fieldForm.controls.maxValue.reset(99999);
      this.fieldForm.controls.precision.reset(0);
    }

    if (value === 'date' || value === 'time') {
      this.fieldForm.controls.minLength.setValidators([Validators.required]);
      this.fieldForm.controls.maxLength.setValidators([Validators.required]);
    }

    if (value === 'autonum') {
      this.fieldForm.controls.displayDigits.setValidators([Validators.required]);
      this.fieldForm.controls.displayDigits.reset(6);
    }
  }

  // 重置函数
  resetFunction() {
    this.fieldForm.controls.returnType.reset();
    this.fieldForm.controls.formula.reset();
  }

  /**
   * @description: 最小位数必须小于最大位数
   */
  minLengthValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return {};
    }
    if (this.fieldForm && control.value >= this.fieldForm.controls.maxLength.value) {
      return { minLength: true, error: true };
    }
    return {};
  };

  /**
   * @description: 最大值变更的情况，需要重新check
   */
  maxLengthChange() {
    setTimeout(() => this.fieldForm.controls.minLength.updateValueAndValidity());
  }

  /**
   * @description: 更新字段时表示位数变更的情况，需要重新check
   */
  displayDigitsChange() {
    setTimeout(() => this.fieldForm.controls.displayDigits.updateValueAndValidity());
  }

  /**
   * @description: 最大值变更的情况，需要重新check
   */
  maxValueChange() {
    setTimeout(() => this.fieldForm.controls.minValue.updateValueAndValidity());
  }

  /**
   * @description: 最小值必须小于最大值
   */
  minValueValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return {};
    }
    if (this.fieldForm && control.value >= this.fieldForm.controls.maxValue.value) {
      return { minValue: true, error: true };
    }
    return {};
  };

  /**
   * @description: 调用服务获取组
   */
  getGroups() {
    this.groupService.getGroups().then(data => {
      if (data) {
        this.userGroups = data;
      } else {
        this.userGroups = [];
      }
    });
  }
  /**
   * @description: 调用服务获取选项
   */
  getOptions() {
    this.optionService.getOptions().then(data => {
      if (data) {
        this.options = data;
      } else {
        this.options = [];
      }
    });
  }

  /**
   * @description: 调用服务获取datastore
   */
  getDatastores() {
    const ds = this.route.snapshot.paramMap.get('d_id');
    this.datastoreService.getDatastores().then(data => {
      if (data) {
        this.datastores = data.filter(f => f.datastore_id !== ds);
      } else {
        this.datastores = [];
      }
    });
  }

  /**
   * @description: 调用服务获取判断是否显示作为盘点图片项
   */
  async isShowCheckImageOp() {
    const ds = this.route.snapshot.paramMap.get('d_id');
    const fieldId = this.route.snapshot.paramMap.get('f_id');
    // 判断是否已设定盘点图片字段
    let myself = false;
    await this.fieldService.getFields(ds).then((data: any[]) => {
      if (data) {
        const fields = data.filter(f => f.is_check_image);
        if (fields.length > 0) {
          this.isCheckImageNotSet = false;
        } else {
          this.isCheckImageNotSet = true;
        }
        // 字段编辑模式当前字段是否为盘点图片字段本身
        const myFields = data.filter(f => f.field_id === fieldId);
        if (myFields.length > 0 && myFields[0].is_check_image) {
          myself = true;
        }
      }
    });

    // 判断是否显示作为盘点图片项
    if (this.isCheckImageNotSet && this.status !== 'edit') {
      this.isShowCheckImageOption = true;
    }
    if (this.status === 'edit') {
      this.isShowCheckImageOption = myself;
    }
  }

  /**
   * @description: 调用服务改变datastore
   */
  async datastoreChange(datastoreId: string) {
    if (datastoreId) {
      await this.fieldService.getFields(datastoreId).then((data: any[]) => {
        if (data) {
          this.fields = data.filter(f => f.field_type === 'text' && !f.as_title && f.is_required);
          this.fieldForm.controls.lookupFieldId.reset();
        } else {
          this.fields = [];
          this.fieldForm.controls.lookupFieldId.reset();
        }
      });
    }
  }
}
