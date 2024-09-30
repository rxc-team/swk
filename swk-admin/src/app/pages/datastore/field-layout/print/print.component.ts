/*
 * @Author: RXC 呉見華
 * @Date: 2020-01-16 11:15:10
 * @LastEditTime : 2020-01-16 13:52:18
 * @LastEditors  : RXC 呉見華
 */

import {
    CompactType, DisplayGrid, GridsterConfig, GridsterItem, GridType
} from 'angular-gridster2';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FieldService, PrintService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.less']
})
export class PrintComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private field: FieldService,
    private print: PrintService,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private i18n: I18NService
  ) {
    this.form = this.fb.group({
      showSystem: [false, []],
      showSign: [false, []],
      signName1: ['', [], [this.signNameAsyncValidator]],
      signName2: ['', [], [this.signNameAsyncValidator]],
      titleWidth: [20, []]
    });
  }

  // 表单数据
  form: FormGroup;

  // Grid显示数据
  listData: Array<GridsterItem> = [];
  // Grid配置
  options: GridsterConfig;
  // 是否显示打印字段选择设置框
  showFieldSelect = false;

  fields = [];
  selectField = '';
  status = 'add';

  page = 'A4';
  orientation = 'L';
  checkField = '';

  /**
   * @description: 签名检查
   */
  signNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      let sign: string = control.value;
      let len = 0;
      for (var i = 0; i < sign.length; i++) {
        var length = sign.charCodeAt(i);
        if (length >= 0 && length <= 128) {
          len += 1;
        } else {
          len += 2;
        }
      }
      if (len > 14) {
        observer.next({ error: true, lengthexceeded: true });
      } else {
        observer.next(null);
      }
      observer.complete();
    });

  /**
   * @description: 是否显示签名
   */
  signChange(value: boolean) {
    if (!value) {
      this.form.controls.signName1.setValue('');
      this.form.controls.signName2.setValue('');
    }
  }

  /**
   * @description: 画面初始化处理
   */
  ngOnInit() {
    this.options = {
      displayGrid: DisplayGrid.Always,
      gridType: GridType.VerticalFixed,
      compactType: CompactType.None,
      keepFixedHeightInMobile: true,
      fixedRowHeight: 36,
      minCols: 1,
      maxCols: 4,
      minRows: 10,
      maxRows: 20,
      margin: 1,
      pushItems: true,
      draggable: {
        enabled: true
      },
      resizable: {
        enabled: true
      }
    };

    this.init();
  }
  /**
   * @description: 初始化处理
   */
  async init() {
    await this.buildFieldInfo();
  }

  /**
   * @description: 获取database数据
   */
  async buildFieldInfo() {
    this.listData = [];
    this.fields = [];

    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    // 调用服务获取字段
    await this.field.getFields(datastoreId).then((data: any[]) => {
      if (data) {
        this.fields = data;
        this.fields.forEach(f => {
          if (f.is_check_image) {
            this.checkField = f.field_id;
            f.disabled = true;
          }
        });
      } else {
        this.fields = [];
      }
    });

    // 调用服务获取台账打印设置
    await this.print.getPrintById(datastoreId).then((data: any) => {
      if (data && data.status !== 2) {
        this.status = 'edit';
        // 画面设置项初期设值
        this.form.controls.showSign.setValue(data.show_sign);
        this.form.controls.showSystem.setValue(data.show_system);
        this.form.controls.signName1.setValue(data.sign_name1);
        this.form.controls.signName2.setValue(data.sign_name2);
        this.form.controls.titleWidth.setValue(data.title_width);
        // 打印设置
        this.printListDataSet(data.fields);
      } else {
        this.printListDataSet([]);
      }
    });
  }

  /**
   * @description: 打印设置
   */
  async printListDataSet(printFields: any[]) {
    if (printFields) {
      printFields.forEach(pf => {
        const fd = this.fields.find(f => f.field_id === pf.field_id);
        if (fd) {
          if (!fd.is_check_image) {
            let value;
            switch (pf.field_type) {
              case 'text':
                value = 'xxxxx';
                break;
              case 'textarea':
                value = 'xxxxx';
                break;
              case 'number':
                value = '999';
                break;
              case 'date':
                value = new Date();
                break;
              case 'time':
                value = new Date().getTime();
                break;
              case 'user':
                value = 'user';
                break;
              case 'file':
                value = [
                  {
                    url: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=182618258,3879161671&fm=26&gp=0.jpg',
                    name: 'question.jpg'
                  }
                ];
                break;
              case 'switch':
                value = false;
                break;
              case 'options':
                value = 'A';
                break;
              case 'lookup':
                value = '0001';
                break;
              default:
                value = '111';
                break;
            }

            const it: GridsterItem = {
              cols: pf.cols ? pf.cols : 1,
              rows: pf.rows ? pf.rows : 1,
              y: pf.y ? pf.y : 0,
              x: pf.x ? pf.x : 0,
              field_id: pf.field_id,
              field_type: pf.field_type,
              field_name: pf.field_name,
              as_title: pf.as_title,
              is_image: pf.is_image ? true : false,
              value: value
            };
            this.listData.push(it);
            fd.disabled = true;
          }
        }
      });
    } else {
      this.listData = [];
    }
  }

  /**
   * 添加打印字段
   */
  addField(fieldId: string) {
    const fd = this.fields.find(f => f.field_id === fieldId);
    if (fd) {
      let value;
      switch (fd.field_type) {
        case 'text':
          value = 'xxxxx';
          break;
        case 'textarea':
          value = 'xxxxx';
          break;
        case 'number':
          value = '999';
          break;
        case 'date':
          value = new Date();
          break;
        case 'time':
          value = new Date().getTime();
          break;
        case 'user':
          value = 'user';
          break;
        case 'file':
          value = [
            {
              url: 'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=182618258,3879161671&fm=26&gp=0.jpg',
              name: 'question.jpg'
            }
          ];
          break;
        case 'switch':
          value = false;
          break;
        case 'options':
          value = 'A';
          break;
        case 'lookup':
          value = '0001';
          break;
        default:
          value = '111';
          break;
      }

      const it: GridsterItem = {
        cols: 1,
        rows: 1,
        y: 0,
        x: 0,
        field_id: fd.field_id,
        field_type: fd.field_type,
        field_name: fd.field_name,
        as_title: fd.as_title,
        is_image: fd.is_image ? true : false,
        value: value
      };
      this.listData.push(it);

      fd.disabled = true;
    }

    this.selectField = '';
  }
  /**
   * 删除打印字段
   */
  delete(fieldId: string) {
    const fd = this.fields.find(f => f.field_id === fieldId);
    if (fd) {
      this.listData.splice(
        this.listData.findIndex(f => f.field_id === fieldId),
        1
      );
      fd.disabled = false;
    } else {
      this.listData.splice(
        this.listData.findIndex(f => f.field_id === fieldId),
        1
      );
    }
  }

  /**
   * @description: 保存
   */
  async save() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    // 打印字段编辑
    let pfs = [];
    this.listData.map(async item => {
      const f = this.fields.find(field => item.field_id === field.field_id);
      const pf = {
        field_id: item.field_id,
        field_name: f.field_name,
        field_type: f.field_type,
        is_image: f.is_image,
        is_check_image: f.is_check_image,
        as_title: f.as_title,
        cols: item.cols,
        rows: item.rows,
        x: item.x,
        y: item.y,
        width: f.width,
        precision: f.precision
      };
      pfs = [...pfs, pf];
    });

    if (this.status === 'edit') {
      const params = {
        fields: pfs,
        page: this.page,
        orientation: this.orientation,
        check_field: this.checkField,
        show_system: this.form.controls.showSystem.value ? 'true' : 'false',
        show_sign: this.form.controls.showSign.value ? 'true' : 'false',
        sign_name1: this.form.controls.signName1.value,
        sign_name2: this.form.controls.signName2.value,
        title_width: this.form.controls.titleWidth.value
      };
      await this.print.updatePrint(datastoreId, params).then(() => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
      });
    } else {
      const params = {
        datastore_id: datastoreId,
        page: this.page,
        orientation: this.orientation,
        check_field: this.checkField,
        title_width: this.form.controls.titleWidth.value,
        fields: pfs,
        show_sign: this.form.controls.showSign.value,
        show_system: this.form.controls.showSystem.value,
        sign_name1: this.form.controls.signName1.value,
        sign_name2: this.form.controls.signName2.value
      };
      await this.print.addPrint(params).then(() => {
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
      });
    }
  }

  /**
   * @description: 字段设置
   */
  showFieldSet() {
    this.showFieldSelect = true;
  }

  /**
   * @description: 取消字段设置
   */
  hiddenFieldSet() {
    this.showFieldSelect = false;
  }
}
