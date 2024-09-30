import { cloneDeep } from 'lodash';
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { OptionService, ValidationService } from '@api';
import { I18NService } from '@core';
import { NfValidators } from '@shared';

import { GenerateOptionAddComponent } from '../generate-option-add/generate-option-add.component';

export interface Option {
  option_id: string;
  option_name: string;
  option_order: number;
  option_memo?: string;
  option_label: string;
  option_value: string;
  status?: string;
}

@Component({
  selector: 'app-generate-option-setting',
  templateUrl: './generate-option-setting.component.html',
  styleUrls: ['./generate-option-setting.component.less']
})
export class GenerateOptionSettingComponent implements OnInit {
  // csv中过滤的无重复数据
  @Input() dataList = [];
  @Input() optionId = '';
  @Input() disabled = false;

  detailCols = [
    {
      title: 'page.option.optionSubName',
      width: '200px'
    },
    {
      title: 'page.option.optionValue',
      width: '180px'
    },
    {
      title: 'page.option.operate'
    }
  ];

  // 合并之前的数据
  data: Option[] = [];
  // 显示的数据（选择的选项组合并后的结果）
  displayData: Option[] = [];

  // 全局类型
  // 新规表单
  optionForm: FormGroup;
  // 已存的选项组
  optionList: any[] = [];
  // 是否添加新的选项组
  isSmall = false;

  // 构造函数
  constructor(
    private optionService: OptionService,
    private fb: FormBuilder,
    private location: Location,
    private event: NgEventBus,
    private i18n: I18NService,
    private validation: ValidationService,
    private modal: NzModalService,
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
      optionName: ['', [Validators.required], [this.optionNameAsyncValidator]],
      optionMemo: ['', []]
    });

    this.init();
  }

  /**
   * @description: 初始化处理
   */
  async init() {
    this.dataList.forEach((o, i) => {
      this.data.push({
        option_id: '',
        option_name: '',
        option_memo: '',
        option_label: o,
        option_order: i + 1,
        option_value: 'option_' + this.genUUID(6),
        status: 'new'
      });
    });

    this.displayData = cloneDeep(this.data);

    await this.optionService.getOptions().then((data: any[]) => {
      if (data) {
        this.optionList = data;
        this.optionList.push({
          option_name: 'page.option.newOptionGroup',
          option_id: ''
        });
      } else {
        this.optionList = [];
        this.optionList.push({
          option_name: 'page.option.newOptionGroup',
          option_id: ''
        });
      }
    });

    console.log(this.optionList);

    if (this.optionId) {
      this.getForm('optionId').setValue(this.optionId);
    }

    if (this.disabled) {
      this.optionForm.disable();
    }
  }

  getForm(formName: string) {
    return this.optionForm.controls[formName];
  }

  /**
   * 生成随机的 UUID
   */
  genUUID(randomLength) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now())
      .toString(36)
      .substring(0, 3);
  }

  optionChange(optionId: string) {
    // 空的场合表示需要新追加选项组
    if (optionId === '') {
      this.getForm('optionName').enable();
      this.getForm('optionName').reset();
      this.getForm('optionMemo').enable();
      this.getForm('optionMemo').reset();

      this.displayData = cloneDeep(this.data);
    } else {
      const select = this.optionList.find(o => o.option_id === optionId);
      if (select) {
        this.getForm('optionName').setValue(this.i18n.translateLang(select.option_name));
        this.getForm('optionMemo').setValue(select.option_memo);
        this.getForm('optionName').disable();
        this.getForm('optionMemo').disable();

        this.optionService.getOptionsByCode(optionId).then((data: Option[]) => {
          if (data) {
            const origin = cloneDeep(this.data);
            origin.forEach(o => {
              const fd = data.find(ot => this.i18n.translateLang(ot.option_label) === o.option_label);
              if (fd) {
                o.option_id = fd.option_id;
                o.option_name = this.i18n.translateLang(fd.option_name);
                o.option_memo = fd.option_memo;
                o.option_order = fd.option_order;
                o.option_value = fd.option_value;
                o.status = 'match';
              } else {
                o.status = 'new';
              }
            });
            data.forEach(ot => {
              const fd = origin.find(o => this.i18n.translateLang(ot.option_label) === o.option_label);
              if (!fd) {
                ot.option_name = this.i18n.translateLang(ot.option_name);
                ot.option_label = this.i18n.translateLang(ot.option_label);
                ot.status = 'not_match';
                origin.push(ot);
              }
            });

            this.displayData = origin;
          }
        });
      }
    }
  }

  /**
   * @description: 选项组名称唯一性检查
   */
  optionNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const current = this.optionForm.controls.optionId.value;
      this.validation.validationUnique('options', control.value, { change_id: current }).then((has: boolean) => {
        if (has) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 选项ID唯一性检查
   */
  optionValueAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      if (this.optionForm.controls.optionId.value) {
        this.optionService.getOptionsByCode(this.optionForm.controls.optionId.value).then((options: any[]) => {
          if (options) {
            const op = options.find(o => o.option_value === control.value);
            if (op) {
              observer.next({ error: true, duplicated: true });
            } else {
              observer.next(null);
            }
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

  // /**
  //  * @description: 提交添加的选项信息
  //  */
  // submitForm = async ($event: any) => {
  //   // 禁止默认事件
  //   $event.preventDefault();
  //   // 通过调用服务添加选项
  //   if (this.addNew) {
  //     const params = {
  //       option_id: this.getForm('optionIdNew').value,
  //       option_name: this.getForm('optionName').value,
  //       option_order: 0,
  //       option_memo: this.getForm('optionMemo').value,
  //       option_label: this.getForm('optionLabel').value,
  //       is_new_option_group: true,
  //       option_value: this.getForm('optionValue').value
  //     };
  //     await this.optionService.addOption(params).then(res => {
  //       this.resetValue();
  //       this.optionElement.nativeElement.focus();
  //       this.message.success(this.i18n.translateLang('common.message.success.S_001'));
  //       this.event.cast('option:refresh');
  //       this.addNew = false;
  //     });
  //   } else {
  //     const params = {
  //       option_id: this.getForm('optionId').value,
  //       option_name: this.getForm('optionName').value,
  //       option_order: 0,
  //       option_memo: this.getForm('optionMemo').value,
  //       option_label: this.getForm('optionLabel').value,
  //       is_new_option_group: false,
  //       option_value: this.getForm('optionValue').value
  //     };
  //     await this.optionService.addOption(params).then(res => {
  //       this.resetValue();
  //       this.optionElement.nativeElement.focus();
  //       this.message.success(this.i18n.translateLang('common.message.success.S_001'));
  //       this.event.cast('option:refresh');
  //     });
  //   }
  //   await this.init();

  //   const value = this.getForm('optionId').value;
  //   this.getForm('optionId').setValue(value);
  // };

  /**
   * @description: 重置表单
   */
  reset(): void {
    this.optionForm.reset();
  }

  /**
   * @description: 取消选项添加，返回上级
   */
  cancel() {
    this.location.back();
  }

  addOption() {
    const modal: NzModalRef = this.modal.create({
      nzTitle: this.i18n.translateLang('page.generage.relationSet'),
      nzContent: GenerateOptionAddComponent,
      nzMask: false,
      nzComponentParams: {
        optionId: this.getForm('optionId').value,
        optionName: this.getForm('optionName').value,
        optionMemo: this.getForm('optionMemo').value
      },
      nzOnOk: instance => {
        const option = instance.submitForm();
        this.displayData = [...this.displayData, option];
      },
      nzOnCancel: () => {
        modal.destroy();
      }
    });
  }
}
