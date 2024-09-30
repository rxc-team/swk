import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { Observable, Observer } from 'rxjs';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GenService, MappingService, ValidationService } from '@api';
import { I18NService } from '@core';

import { StepService } from '../step.service';

export interface MappingRule {
  from_key: string;
  data_type: string;
  to_key: string;
  is_required: boolean;
  exist: boolean;
  special: boolean;
  default_value: string;
  format: string;
  replace: string;
  primary_key: boolean;
  precision: number;
  show_order: number;
}
@Component({
  selector: 'app-generate-mp-save',
  templateUrl: './generate-mp-save.component.html',
  styleUrls: ['./generate-mp-save.component.less']
})
export class GenerateMpSaveComponent implements OnInit {
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
    private i18n: I18NService,
    private route: ActivatedRoute,
    private router: Router,
    private gs: GenService,
    private sts: StepService,
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
      separatorChar: [',', [Validators.required]],
      breakChar: ['single', [Validators.required]],
      lineBreakCode: ['\\r\\n', [Validators.required]],
      charEncoding: ['UTF-8', [Validators.required]]
    });
  }

  form: FormGroup;
  files = [];
  fields: any[] = [];
  isSmall = false;

  ds = '';

  ngOnInit() {
    this.init();
  }

  async init() {
    const conf = await this.gs.getConfig();

    if (conf) {
      this.fields = conf.fields;
      this.ds = conf.datastore_id;

      if (conf.mapping_id) {
        const mapping = await this.ms.getMapping(this.ds, conf.mapping_id);

        if (mapping) {
          this.form.controls.mappingName.setValue(this.i18n.translateLang(mapping.mapping_name));
          this.form.controls.mappingType.setValue(mapping.mapping_type);
          this.form.controls.updateType.setValue(mapping.update_type);
          this.form.controls.separatorChar.setValue(mapping.separator_char);
          this.form.controls.breakChar.setValue(mapping.break_char);
          this.form.controls.lineBreakCode.setValue(mapping.line_break_code);
          this.form.controls.charEncoding.setValue(mapping.char_encoding);

          this.form.disable();
        }
      }
    }

    this.fields.forEach((f, i) => {
      f.show_order = i + 1;
      if (f.field_type === 'options' || f.field_type === 'lookup' || f.field_type === 'user') {
        f.exist = true;
      }
      if (f.field_type === 'text' || f.field_type === 'textarea') {
        f.special = true;
      }
    });
  }

  /**
   * @description: 映射名称唯一性检查
   */
  mappingNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const mappingId = this.route.snapshot.paramMap.get('m_id');
      this.validation.validationUnique('mappings', control.value, { prefix: this.ds, change_id: mappingId }).then((has: boolean) => {
        if (has) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  mappingTypeChange(ev) {
    if (ev === 'insert') {
      this.fields.forEach(f => (f.primary_key = false));
      this.form.controls.updateType.setValue('update-one');
      this.cols = this.cols.filter(col => col.title !== 'page.datastore.mapping.mappingPrimaryKey');
    } else {
      this.cols = this.colsUpdate;
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

  async clear() {
    await this.gs.complete();
    this.router.navigate(['generate']);
  }

  pre() {
    this.sts.pre();
  }

  async next() {
    const mappingRule = [];
    let hasPk = false;
    this.fields.forEach(f => {
      if (f.csv_header && f.primary_key) {
        hasPk = true;
      }
      if (f.csv_header || f.default_value) {
        const rule = {
          from_key: f.field_id,
          data_type: f.field_type,
          to_key: f.csv_header,
          is_required: f.is_required,
          exist: f.exist,
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

    const params = {
      mapping_name: this.form.controls.mappingName.value,
      mapping_type: this.form.controls.mappingType.value,
      update_type: this.form.controls.updateType.value,
      separator_char: this.form.controls.separatorChar.value,
      break_char: this.form.controls.breakChar.value,
      line_break_code: this.form.controls.lineBreakCode.value,
      char_encoding: this.form.controls.charEncoding.value,
      mapping_rule: mappingRule
    };
    await this.gs.createMapping(params);
    this.message.success(this.i18n.translateLang('common.message.success.S_001'));
    this.sts.next();
  }
}
