import { NzMessageService } from 'ng-zorro-antd/message';

import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatastoreService, FieldService } from '@api';
import { I18NService } from '@core';
import { genUUID } from '@shared/string/string';

@Component({
  selector: 'app-relation-add',
  templateUrl: './relation-add.component.html',
  styleUrls: ['./relation-add.component.less']
})
export class RelationAddComponent implements OnInit {
  @Input() datastoreId = '';

  fields = [];

  uniqueFieldsOptions = [];
  dsOptions = [];
  fieldsOptions = [];

  form: FormGroup;

  constructor(
    private fs: FieldService,
    private ds: DatastoreService,
    private fb: FormBuilder,
    private i18n: I18NService,
    private message: NzMessageService
  ) {
    const uid = genUUID('relation', 6);
    this.form = this.fb.group({
      relation_id: [uid, [Validators.required]],
      datastore_id: [null, [Validators.required]],
      ufs: [null, [Validators.required]],
      fields: this.fb.array([])
    });
  }

  get fsArray() {
    return this.form.controls['fields'] as FormArray;
  }

  ngOnInit(): void {
    this.init();
  }

  /**
   * @description: 初始化处理
   */
  async init() {
    await this.ds.getDatastores().then(data => {
      if (data) {
        this.dsOptions = data;
      } else {
        this.dsOptions = [];
      }
    });

    if (this.datastoreId) {
      // 获取该台账字段情报设置排序选项字段组
      await this.fs.getFields(this.datastoreId).then((data: any[]) => {
        if (data) {
          // 必须是文本字段，并且是必须属性才能作为唯一性组合字段
          this.fieldsOptions = data.filter(f => f.field_type === 'lookup');
        } else {
          this.fieldsOptions = [];
        }
      });
    }
  }

  async dsChange(d: string) {
    this.uniqueFieldsOptions = [];
    this.form.controls.ufs.setValue('');
    if (d) {
      // 获取该台账字段情报设置排序选项字段组
      await this.fs.getFields(d).then((data: any[]) => {
        if (data) {
          // 必须是文本字段，并且是必须属性才能作为唯一性组合字段
          this.fields = data.filter(f => f.field_type === 'text' && !f.as_title && f.is_required);
        } else {
          this.fields = [];
        }
      });

      const local = this.dsOptions.find(ds => ds.datastore_id === this.datastoreId);

      const current = this.dsOptions.find(ds => ds.datastore_id === d);
      if (current) {
        if (current.unique_fields) {
          current.unique_fields.forEach(f => {
            const fsList = this.showFieldInfo(f);

            let disabled = false;
            if (local.relations) {
              local.relations.forEach((rat: any) => {
                let count = 0;
                fsList.forEach(fs => {
                  if (rat.fields.hasOwnProperty(fs.field_id)) {
                    count++;
                  }
                });

                if (count === fsList.length) {
                  disabled = true;
                }
              });
            }

            this.uniqueFieldsOptions.push({
              value: f,
              label: fsList.map(fd => this.i18n.translateLang(fd.field_name)).join(','),
              disabled: disabled
            });
          });
        }
      }
    }
  }

  ufsChange(fs: string) {
    this.fsArray.clear();
    const fList: any[] = this.showFieldInfo(fs);
    fList.forEach(f => {
      const columnForm = this.fb.group({
        refrenced_field: [{ value: f.field_id, disabled: true }, Validators.required],
        field: [null, Validators.required]
      });

      this.fsArray.push(columnForm);
    });
  }

  showFieldInfo(fs: string) {
    const fList = fs.split(',');
    if (fList) {
      const result = fList.map(f => this.fields.find(fd => fd.field_id === f));
      console.log(result);
      return result;
    }

    return [];
  }

  save() {
    const vList: any[] = this.fsArray.getRawValue();
    const fields = {};
    vList.forEach(f => {
      fields[f.refrenced_field] = f.field;
    });
    const value = {
      relation: {
        relation_id: this.form.get('relation_id').value,
        datastore_id: this.form.get('datastore_id').value,
        fields: fields
      }
    };
    this.ds.addRelation(this.datastoreId, value).then(() => {
      this.message.success(this.i18n.translateLang('common.message.success.S_001'));
    });
  }
}
