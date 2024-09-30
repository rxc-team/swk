/*
 * @Description: 选项添加控制器
 * @Author: RXC 廖云江
 * @Date: 2019-07-04 15:26:29
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2021-01-21 11:45:27
 */

import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { OptionService, ValidationService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-option-add',
  templateUrl: './option-add.component.html',
  styleUrls: ['./option-add.component.less']
})
export class OptionAddComponent implements OnInit {
  @ViewChild('optionName', { static: true }) optionElement: ElementRef;

  // 全局类型
  // 新规表单
  optionForm: FormGroup;
  // 已存的选项
  optionList: any[] = [];
  optionOrder = '';
  // 是否添加新的选项组
  addNew = false;
  // 備考是否为空
  hasMemo = true;
  isSmall = false;

  // 构造函数
  constructor(
    private optionService: OptionService,
    private fb: FormBuilder,
    private location: Location,
    private event: NgEventBus,
    private i18n: I18NService,
    private validation: ValidationService,
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
  }

  /**
   * @description: 画面初始化
   */
  ngOnInit() {
    this.optionForm = this.fb.group({
      optionId: [null, []],
      optionIdNew: [{ value: null, disabled: true }, []],
      optionName: ['', [Validators.required]],
      optionLabel: ['', [Validators.required], [this.optionLabelAsyncValidator]],
      optionValue: ['', [Validators.required, Validators.pattern('^[a-z0-9A-Z_]{0,49}')], []],
      optionMemo: ['', []]
    });

    this.init();
  }

  /**
   * @description: 初始化处理
   */
  async init() {
    await this.optionService.getOptions().then((data: any[]) => {
      if (data) {
        this.optionList = data;
        this.optionList.push({
          option_name: 'page.option.newOptionGroup',
          option_id: this.optionOrder
        });
      } else {
        this.optionList = [];
        this.optionList.push({
          option_name: 'page.option.newOptionGroup',
          option_id: this.optionOrder
        });
      }
    });
  }

  getForm(formName: string) {
    return this.optionForm.controls[formName];
  }

  optionChange(optionId: string) {
    if (optionId === this.optionOrder) {
      this.addNew = true;
      this.getForm('optionValue').clearAsyncValidators();
      this.getForm('optionIdNew').setValue(this.optionOrder);
      this.resetForm();
    } else {
      this.addNew = false;
      this.getForm('optionValue').setAsyncValidators(this.optionValueAsyncValidator);
      this.getForm('optionIdNew').setValue(optionId);
      const select = this.optionList.filter(o => o.option_id === optionId);
      if (select && select.length > 0) {
        this.getForm('optionName').setValue(this.i18n.translateLang(select[0].option_name));
        this.getForm('optionMemo').setValue(select[0].option_memo);
        if (!select[0].option_memo) {
          this.hasMemo = false;
        }
      }
      this.resetValue();
    }
  }

  /**
   * @description: 选项ID唯一性检查
   */
  optionValueAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      if (this.optionForm.controls.optionId.value) {
        this.optionService.optionValueAsyncValidator(this.optionForm.controls.optionId.value, control.value).then((option: boolean) => {
          if (!option) {
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
   * @description: 选项名称唯一性检查
   */
  optionLabelAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      this.validation.validationUnique('options', control.value, { prefix: this.getForm('optionId').value }).then((has: boolean) => {
        if (has) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 提交添加的选项信息
   */
  submitForm = async ($event: any) => {
    // 禁止默认事件
    $event.preventDefault();
    // 通过调用服务添加选项
    if (this.addNew) {
      const params = {
        option_id: this.getForm('optionIdNew').value,
        option_name: this.getForm('optionName').value,
        option_order: 0,
        option_memo: this.getForm('optionMemo').value,
        option_label: this.getForm('optionLabel').value,
        is_new_option_group: true,
        option_value: this.getForm('optionValue').value
      };
      await this.optionService.addOption(params).then(res => {
        this.resetValue();
        this.optionElement.nativeElement.focus();
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        this.event.cast('option:refresh');
        this.addNew = false;
      });
    } else {
      const params = {
        option_id: this.getForm('optionId').value,
        option_name: this.getForm('optionName').value,
        option_order: 0,
        option_memo: this.getForm('optionMemo').value,
        option_label: this.getForm('optionLabel').value,
        is_new_option_group: false,
        option_value: this.getForm('optionValue').value
      };
      await this.optionService.addOption(params).then(res => {
        this.resetValue();
        this.optionElement.nativeElement.focus();
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        this.event.cast('option:refresh');
      });
    }
    await this.init();

    const value = this.getForm('optionId').value;
    this.getForm('optionId').setValue(value);
  };

  /**
   * @description: 重置选项添加表单
   */
  resetForm(): void {
    this.getForm('optionName').reset();
    this.getForm('optionMemo').reset();
    this.getForm('optionLabel').reset();
    this.getForm('optionValue').reset();
    this.hasMemo = true;
  }

  /**
   * @description: 重置选项值添加表单
   */
  resetValue(): void {
    this.getForm('optionLabel').reset();
    this.getForm('optionValue').reset();
  }

  /**
   * @description: 重置表单
   */
  reset(): void {
    this.optionForm.reset();
    this.addNew = false;
    this.hasMemo = true;
  }

  /**
   * @description: 取消选项添加，返回上级
   */
  cancel() {
    this.location.back();
  }
}
