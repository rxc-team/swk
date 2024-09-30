import { NzMessageService } from 'ng-zorro-antd/message';

import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatastoreService, FieldService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-unique-add',
  templateUrl: './unique-add.component.html',
  styleUrls: ['./unique-add.component.less']
})
export class UniqueAddComponent implements OnInit {
  @Input() datastoreId = '';
  @Input() unique_fields = [];

  fieldsOptions = [];

  form: FormGroup;

  constructor(
    private fs: FieldService,
    private ds: DatastoreService,
    private fb: FormBuilder,
    private i18n: I18NService,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({ unique_fields: [[], [Validators.required, this.uniqueValidator]] });
  }

  ngOnInit(): void {
    this.init();
  }

  /**
   * @description: 初始化处理
   */
  async init() {
    if (this.datastoreId) {
      // 获取该台账字段情报设置排序选项字段组
      await this.fs.getFields(this.datastoreId).then((data: any[]) => {
        if (data) {
          // 必须是文本字段，并且是必须属性才能作为唯一性组合字段
          this.fieldsOptions = data.filter(f => f.field_type === 'text' && !f.as_title && f.is_required);
        } else {
          this.fieldsOptions = [];
        }
      });
    } else {
    }
  }

  /**
   * @description: 重复验证
   */
  uniqueValidator = (control: FormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return {};
    }
    if (this.form) {
      const select: string[] = control.value;

      if (this.unique_fields) {
        for (let i = 0; i < this.unique_fields.length; i++) {
          const fs: string = this.unique_fields[i];
          const fList = fs.split(',');

          if (select.length === fList.length) {
            let count = 0;
            for (let j = 0; j < select.length; j++) {
              const element = select[j];
              if (fList.find(f => f === element)) {
                count++;
              }
            }

            if (count === select.length) {
              return { error: true, duplicated: true };
            }
          }
        }
      }
    }
    return {};
  };

  save() {
    const unique_fields: string[] = this.form.get('unique_fields').value;
    const value = {
      unique_fields: unique_fields.join(',')
    };
    this.ds.addUniqueKey(this.datastoreId, value).then(() => {
      this.message.success(this.i18n.translateLang('common.message.success.S_001'));
    });
  }
}
