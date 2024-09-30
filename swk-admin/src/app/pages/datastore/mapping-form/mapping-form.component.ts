import * as Encoding from 'encoding-japanese';
import * as _ from 'lodash';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable, Observer } from 'rxjs';
import * as XLSX from 'xlsx';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FieldService, MappingService, ValidationService } from '@api';
import { I18NService } from '@core';

// 全局类型
type AOA = any[][];

@Component({
  selector: 'app-mapping-form',
  templateUrl: './mapping-form.component.html',
  styleUrls: ['./mapping-form.component.less']
})
export class MappingFormComponent implements OnInit {
  cols = [
    {
      title: 'page.workflow.no',
      width: '45px'
    },
    {
      title: 'page.datastore.mapping.mappingFieldName',
      width: '150px'
    },
    {
      title: 'page.datastore.mapping.mappingFieldType',
      width: '150px'
    },
    {
      title: 'page.datastore.mapping.mappingKeyName',
      width: '200px'
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
  colsHistory = [
    {
      title: 'page.workflow.no',
      width: '45px'
    },
    {
      title: 'page.datastore.mapping.mappingFieldName',
      width: '150px'
    },
    {
      title: 'page.datastore.mapping.mappingFieldType',
      width: '150px'
    },
    {
      title: 'page.datastore.mapping.mappingKeyName',
      width: '200px'
    },
    {
      title: 'page.datastore.mapping.checkChange',
      width: '200px'
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

  colsUpdate = [
    {
      title: 'page.workflow.no',
      width: '45px'
    },
    {
      title: 'page.datastore.mapping.mappingFieldName',
      width: '150px'
    },
    {
      title: 'page.datastore.mapping.mappingFieldType',
      width: '150px'
    },
    {
      title: 'page.datastore.mapping.mappingKeyName',
      width: '200px'
    },
    {
      title: 'page.datastore.mapping.mappingPrimaryKey',
      width: '80px'
    },
    {
      title: 'page.datastore.mapping.mappingDateFormat',
      width: '130px'
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
    private validation: ValidationService,
    private message: NzMessageService,
    private location: Location,
    private i18n: I18NService,
    private route: ActivatedRoute,
    private fs: FieldService,
    private ms: MappingService,
    private fb: FormBuilder,
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

    this.form = this.fb.group({
      mappingName: ['', [Validators.required], [this.mappingNameAsyncValidator]],
      mappingType: ['insert', [Validators.required]],
      updateType: ['update-one', [Validators.required]],
      applyType: ['datastore', [Validators.required]],
      separatorChar: [',', [Validators.required]],
      breakChar: ['single', [Validators.required]],
      lineBreakCode: ['\\r\\n', [Validators.required]],
      charEncoding: ['UTF-8', [Validators.required]],
      downloadEncoding: ['UTF-8', [Validators.required]]
    });
  }

  form: FormGroup;
  files = [];
  fields: any[] = [];
  status = 'add';
  mappingFields = [];
  isSmall = false;

  ngOnInit() {
    this.init();
  }

  async init() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const mappingId = this.route.snapshot.paramMap.get('m_id');
    if (mappingId) {
      this.status = 'edit';
      const rules = [];
      await this.ms.getMapping(datastoreId, mappingId).then((data: any) => {
        if (data) {
          this.form.controls.mappingName.setValue(this.i18n.translateLang(data.mapping_name));
          this.form.controls.mappingType.setValue(data.mapping_type);
          this.form.controls.updateType.setValue(data.update_type);
          this.form.controls.applyType.setValue(data.apply_type);
          this.form.controls.separatorChar.setValue(data.separator_char);
          this.form.controls.breakChar.setValue(data.break_char);
          this.form.controls.lineBreakCode.setValue(data.line_break_code);
          this.form.controls.charEncoding.setValue(data.char_encoding);
          this.form.controls.downloadEncoding.setValue(data.download_encoding);
          rules.push(...data.mapping_rule);
        }
      });
      await this.fs.getFields(datastoreId, { invalidatedIn: 'false' }).then((data: any[]) => {
        if (data) {
          this.fields = data.filter(f => f.field_type !== 'file');
          this.fields = this.fields.filter(f => !f.as_title);
          this.fields.forEach((f, i) => {
            if (f.is_required) {
              f.can_change = true;
            }
            const r = rules.find(ru => ru.from_key === f.field_id);
            if (r) {
              f.to_key = r.to_key;
              f.is_required = r.is_required;
              f.exist = r.exist;
              f.special = r.special;
              f.check_change = r.check_change;
              f.format = r.format;
              f.replace = r.replace;
              f.default_value = r.default_value;
              f.primary_key = r.primary_key;
              f.precision = r.precision;
              f.show_order = i + 1;
            } else {
              f.show_order = i + 1;
            }
          });
        } else {
          this.fields = [];
        }
      });

      rules.forEach(r => {
        if (!r.from_key && r.to_key) {
          this.addEmptyLine({
            field_id: '',
            field_type: 'text',
            to_key: r.to_key,
            is_required: r.is_required,
            exist: r.exist,
            special: r.special,
            format: r.format,
            replace: r.replace,
            default_value: r.default_value,
            primary_key: r.primary_key,
            check_change: r.check_change,
            precision: r.precision,
            show_order: this.fields.length + 1
          });
        }
      });
      this.fields = _.sortBy(this.fields, 'show_order');
    } else {
      await this.fs.getFields(datastoreId, { invalidatedIn: 'false' }).then((data: any[]) => {
        if (data) {
          this.fields = data.filter(f => f.field_type !== 'file');
          this.fields = this.fields.filter(f => !f.as_title);
          this.fields.forEach((f, i) => {
            f.show_order = i + 1;
            if (f.field_type === 'options' || f.field_type === 'lookup' || f.field_type === 'user') {
              f.exist = true;
            }
            if (f.field_type === 'text' || f.field_type === 'textarea') {
              f.special = true;
            }
          });
        } else {
          this.fields = [];
        }
      });
    }
  }

  /**
   * @description: 映射名称唯一性检查
   */
  mappingNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const datastoreId = this.route.snapshot.paramMap.get('d_id');
      const mappingId = this.route.snapshot.paramMap.get('m_id');
      this.validation.validationUnique('mappings', control.value, { prefix: datastoreId, change_id: mappingId }).then((has: boolean) => {
        if (has) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  submit() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const mappingRule = [];
    let hasPk = false;
    this.fields.forEach(f => {
      if (f.to_key && f.primary_key) {
        hasPk = true;
      }
      if (f.to_key || f.default_value) {
        const rule = {
          from_key: f.field_id,
          data_type: f.field_type,
          to_key: f.to_key,
          is_required: f.is_required,
          exist: f.exist,
          check_change: f.check_change,
          special: f.special,
          default_value: f.default_value,
          format: f.format,
          replace: f.replace,
          primary_key: f.primary_key,
          precision: f.precision,
          show_order: f.show_order
        };
        mappingRule.push(rule);
      }
    });

    if (this.form.controls.mappingType.value === 'update' || this.form.controls.mappingType.value === 'upsert') {
      if (!hasPk) {
        this.message.warning(this.i18n.translateLang('page.datastore.mapping.needPrimaryKey'));
        return;
      }
    }

    if (this.status === 'add') {
      const params = {
        mapping_name: this.form.controls.mappingName.value,
        mapping_type: this.form.controls.mappingType.value,
        update_type: this.form.controls.updateType.value,
        separator_char: this.form.controls.separatorChar.value,
        apply_type: this.form.controls.applyType.value,
        break_char: this.form.controls.breakChar.value,
        line_break_code: this.form.controls.lineBreakCode.value,
        char_encoding: this.form.controls.charEncoding.value,
        download_Encoding: this.form.controls.downloadEncoding.value,
        mapping_rule: mappingRule
      };
      this.ms.addMapping(datastoreId, params).then(() => {
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        this.location.back();
      });
    } else {
      const mappingId = this.route.snapshot.paramMap.get('m_id');
      const params = {
        mapping_name: this.form.controls.mappingName.value,
        mapping_type: this.form.controls.mappingType.value,
        update_type: this.form.controls.updateType.value,
        apply_type: this.form.controls.applyType.value,
        separator_char: this.form.controls.separatorChar.value,
        break_char: this.form.controls.breakChar.value,
        line_break_code: this.form.controls.lineBreakCode.value,
        char_encoding: this.form.controls.charEncoding.value,
        download_Encoding: this.form.controls.downloadEncoding.value,
        mapping_rule: mappingRule
      };

      this.ms.updateMapping(datastoreId, mappingId, params).then(() => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        this.location.back();
      });
    }
  }

  mappingTypeChange(ev) {
    if (ev === 'insert') {
      this.fields.forEach(f => (f.primary_key = false));
      this.form.controls.updateType.setValue('update-one');
      this.cols = this.cols.filter(col => col.title !== 'page.datastore.mapping.mappingPrimaryKey');
    } else {
      this.cols = this.colsUpdate;
    }
  }

  applyTypeChange(ev) {
    if (ev === 'history') {
      this.form.controls.applyType.setValue('history');
      this.form.controls.mappingType.setValue('insert');
    } else {
      this.form.controls.applyType.setValue('datastore');
      if (this.form.controls.mappingType.value !== 'insert') {
        this.cols = this.colsUpdate;
      }
    }
  }

  addEmptyLine(data?: any) {
    if (data) {
      // 增加数据
      this.fields = [...this.fields, data];
    } else {
      // 增加数据
      this.fields = [...this.fields, { field_id: '', field_type: 'text', show_order: this.fields.length + 1 }];
    }
  }

  removEmptyLine(index: number) {
    this.fields = [...this.fields.slice(0, index), ...this.fields.slice(index, this.fields.length - 1)];
  }

  // 文件上传前
  beforeUpload = (file: NzUploadFile): boolean => {
    this.checkEncoding(file);
    return false;
  };

  checkEncoding(file: NzUploadFile) {
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      let coding = '';
      const cd = Encoding.detect(e.target.result);
      switch (cd) {
        case 'SJIS':
          coding = 'Shift-JIS';
          break;
        case 'UTF8':
          coding = 'UTF-8';
          break;
        default:
          this.message.info(`This file encoding is: ${cd}, system only supports UTF8 and SJIS CSV`);
          break;
      }

      if (coding) {
        this.form.controls.charEncoding.setValue(coding);
        this.form.controls.downloadEncoding.setValue(coding),
          this.readFile(file, coding);
      }
    };
    reader.readAsBinaryString(file as any);
  }

  readFile(file: NzUploadFile, encoding: string) {
    this.mappingFields = [];
    const reader: FileReader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        const data = <AOA>XLSX.utils.sheet_to_json(ws, { header: 1 });

        const header = data[0];
        header.forEach(h => {
          this.mappingFields.push({
            name: h
          });
        });
      } catch (err) {
        this.message.error('文件读取失败');
      }
    };
    reader.readAsText(file as any, encoding);
  }

  /**
   * @description: 拖动改变排序字段顺序
   */
  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
    this.fields.forEach((s, i) => {
      s.show_order = i + 1;
    });
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
