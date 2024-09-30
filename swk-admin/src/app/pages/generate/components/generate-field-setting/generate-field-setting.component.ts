import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FieldService } from '@api';

@Component({
  selector: 'app-generate-field-setting',
  templateUrl: './generate-field-setting.component.html',
  styleUrls: ['./generate-field-setting.component.less']
})
export class GenerateFieldSettingComponent implements OnInit {
  @Input() disabled = false;
  @Input() fieldType = 'text';
  @Input() fieldId = '';
  @Input() minLength: number;
  @Input() maxLength: number;
  @Input() minValue: number;
  @Input() maxValue: number;
  @Input() precision: number;

  // 构造函数
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private fieldService: FieldService,
    private location: Location,
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

    this.fieldForm = this.fb.group({
      fieldID: ['', [Validators.required, Validators.pattern('^[a-zA-Z_]+[a-z0-9A-Z_]{0,49}')], [this.fieldIDAsyncValidator]],
      minLength: [0, [Validators.required, this.minLengthValidator]],
      maxLength: [100, [Validators.required]],
      minValue: [0, [Validators.required, this.minValueValidator]],
      maxValue: [99999, [Validators.required]],
      precision: [0, [Validators.required]]
    });
  }

  // 全局类型
  // 表单数据
  fieldForm: FormGroup;
  // 系统使用的api-key禁用
  systemApiKey = ['id', 'index', 'template_id'];
  isSmall = false;

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
    this.fieldForm.get('fieldID').setValue(this.fieldId);

    if (this.minLength) {
      this.fieldForm.get('minLength').setValue(this.minLength);
    }
    if (this.maxLength) {
      this.fieldForm.get('maxLength').setValue(this.maxLength);
    }
    if (this.minValue) {
      this.fieldForm.get('minValue').setValue(this.minValue);
    }
    if (this.maxValue) {
      this.fieldForm.get('maxValue').setValue(this.maxValue);
    }
    if (this.precision) {
      this.fieldForm.get('precision').setValue(this.precision);
    }

    if (this.disabled) {
      this.fieldForm.disable();
    }
  }

  /**
   * @description: 字段ID唯一性检查
   */
  fieldIDAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const datastoreId = this.route.snapshot.paramMap.get('d_id');
      const fieldID = this.route.snapshot.paramMap.get('f_id');
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
   * @description: 取消当前操作，返回上级
   */
  cancel() {
    this.location.back();
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
}
