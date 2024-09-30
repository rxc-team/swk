import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { Observable, Observer } from 'rxjs';

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { OptionService, ValidationService } from '@api';
import { NfValidators } from '@shared';

import { Option } from '../generate-option-setting/generate-option-setting.component';

@Component({
  selector: 'app-generate-option-add',
  templateUrl: './generate-option-add.component.html',
  styleUrls: ['./generate-option-add.component.less']
})
export class GenerateOptionAddComponent implements OnInit {
  @Input() optionId = '';
  @Input() optionName = '';
  @Input() optionMemo = '';

  // 新规表单
  optionForm: FormGroup;
  // 是否添加新的选项组
  isSmall = false;

  // 构造函数
  constructor(
    private optionService: OptionService,
    private fb: FormBuilder,
    private validation: ValidationService,
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
      optionId: [{ value: this.optionId, disabled: true }, []],
      optionName: [{ value: this.optionName, disabled: true }, []],
      optionMemo: [{ value: this.optionMemo, disabled: true }, []],
      optionLabel: ['', [Validators.required], [this.optionLabelAsyncValidator]],
      optionValue: ['', [Validators.required, Validators.pattern('^[a-z0-9A-Z_]{0,49}')], []]
    });
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

  /**
   * @description: 提交添加的选项信息
   */
  submitForm() {
    const option: Option = {
      option_id: this.getForm('optionId').value,
      option_name: this.getForm('optionName').value,
      option_order: 0,
      option_memo: this.getForm('optionMemo').value,
      option_label: this.getForm('optionLabel').value,
      option_value: this.getForm('optionValue').value,
      status: 'new'
    };

    return option;
  }

  /**
   * @description: 重置表单
   */
  reset(): void {
    this.optionForm.reset();
  }
}
