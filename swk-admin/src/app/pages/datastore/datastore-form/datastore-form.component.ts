/*
 * @Description: 添加datastore控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-05-16 10:11:46
 * @LastEditors: PSD 孫学霖
 * @LastEditTime: 2024-01-29 16:57:14
 */

import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { Observable, Observer } from 'rxjs';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatastoreService, FieldService, ValidationService } from '@api';
import { I18NService, TokenStorageService } from '@core';

import { RelationAddComponent } from '../relation-add/relation-add.component';
import { UniqueAddComponent } from '../unique-add/unique-add.component';

@Component({
  selector: 'app-datastore-form',
  templateUrl: './datastore-form.component.html',
  styleUrls: ['./datastore-form.component.less']
})
export class DatastoreFormComponent implements OnInit {
  // 构造函数
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private message: NzMessageService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private modal: NzModalService,
    private validation: ValidationService,
    private tokenService: TokenStorageService,
    private datastoreService: DatastoreService,
    private bs: NzBreakpointService,
    private fs: FieldService,
    private eventBus: NgEventBus
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
      datastoreName: ['', [Validators.required], [this.datastoreNameAsyncValidator]],
      apiKey: ['', [Validators.required, Validators.pattern('^[a-z0-9A-Z_]+[a-z0-9A-Z_]{0,49}')], [this.datastoreIDAsyncValidator]],
      encoding: ['UTF-8', [Validators.required]],
      selectFieldsName: [[], []],
      scanFieldsConnector: ['', []],
      printField1: ['', []],
      printField2: ['', []],
      printField3: ['', []],
      canCheck: [false, []],
      showInMenu: [true, []],
      noStatus: [false, []],
      fieldWidth: ['120', []],
    });
  }

  // 表单数据
  form: FormGroup;
  // 状态
  status = 'add';

  appId = '';
  apiKeyOld = '';

  isSmall = false;

  // 台账默认排序字段设置用
  showField = false;
  fieldForm: FormGroup;
  listOfData: any[] = [];
  sortOptions: any[] = [];
  fields: any[] = [];
  scanFieldsSel: any[] = [];
  uniqueFields: string[] = [];
  // 唯一属性的字段数组
  uniques: string[] = [];
  relations: any[] = [];
  sorts: Array<{ sort_key: string; sort_value: string }> = [];
  cols = [
    {
      title: 'page.workflow.no',
      width: '45px'
    },
    {
      title: 'page.datastore.sortKey',
      width: '150px'
    },
    {
      title: 'page.language.labelFields',
      width: '120px'
    },
    {
      title: 'page.report.fieldSort',
      width: '150px'
    },
    {
      title: 'page.workflow.operate'
    }
  ];

  isVisible = false;
  // 已选择字段
  selectFields = []
  selectFieldID = []
  selectFieldName = []
  colsWithGroup = [
    {
      title: 'page.report.no',
      width: '40px'
    },
    {
      title: 'page.report.fieldName',
      width: '120px'
    },
    {
      title: 'page.report.operate',
      width: '120px'
    }
  ];
  // 固定字段
  fixedFields = {
    field_id: 'sys_dami',
    field_name: 'common.text.dami',
  }

  /**
   * @description: 画面初始化
   */
  ngOnInit() {
    // 添加排序用
    this.fieldForm = new FormGroup({
      sortKey: new FormControl('', [Validators.required]),
      sortValue: new FormControl('', [Validators.required])
    });
    // 当前app取得
    this.appId = this.tokenService.getUserApp();
    this.init();
  }

  /**
   * @description: 初始化处理
   */
  async init() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    if (datastoreId) {
      this.status = 'edit';
      // 获取该台账字段情报设置排序选项字段组
      await this.fs.getFields(datastoreId, { invalidatedIn: 'true' }).then((data: any[]) => {
        if (data) {
          this.scanFieldsSel = data.filter(
            f => (f.field_type === 'text' && !f.as_title) || f.field_type === 'number' || f.field_type === 'autonum'
          );
          this.fields = data.filter(f => f.field_type !== 'file' && !f.as_title);
          const uniques = data.filter(f => f.unique === true);
          uniques.forEach(f => {
            this.uniques.push(f.field_id);
          });
          const fields = data.filter(f => !f.as_title);
          fields.forEach(f => {
            this.sortOptions.push({ label: f.field_name, value: f.field_id });
          });
        } else {
          this.sortOptions = [];
          this.scanFieldsSel = [];
        }
      });
      // 获取台账情报
      await this.datastoreService.getDatastoreByID(datastoreId).then((data: any) => {
        if (data) {
          if (data.scan_fields == null) {
            this.form.controls.selectFieldsName.setValue([]);
          } else {
            for (let i = 0; i < data.scan_fields.length; i++) {
              const fields = this.scanFieldsSel.filter(f => f.field_id === data.scan_fields[i]);
              if (fields.length == 1) {
                this.selectFields.push(fields[0])
              } else {
                this.selectFields.push(this.fixedFields)
              }
              fields.forEach(f => {
                this.selectFieldName.push(this.i18n.translateLang(f.field_name));
              });
              if (data.scan_fields[i] == "sys_dami") {
                this.selectFieldName.push(this.i18n.translateLang(this.fixedFields.field_name));
              }
            }
            this.form.controls.selectFieldsName.setValue(this.selectFieldName);
          }
          this.apiKeyOld = data.api_key;
          this.form.controls.datastoreName.setValue(this.i18n.translateLang(data.datastore_name));
          this.form.controls.apiKey.setValue(data.api_key);
          this.form.controls.encoding.setValue(data.encoding);
          this.form.controls.canCheck.setValue(data.can_check);
          this.form.controls.showInMenu.setValue(data.show_in_menu);
          this.form.controls.noStatus.setValue(data.no_status);
          /* this.form.controls.scanFields.setValue(data.scan_fields); */
          this.form.controls.scanFieldsConnector.setValue(data.scan_fields_connector);
          this.form.controls.printField1.setValue(data.print_field1);
          this.form.controls.printField2.setValue(data.print_field2);
          this.form.controls.printField3.setValue(data.print_field3);
          this.form.controls.fieldWidth.setValue(data.field_width);
          this.uniqueFields = data.unique_fields;
          // 设置台账默认排序情报
          if (data.sorts) {
            data.sorts.forEach((s: { sort_key: any; sort_value: any }) => {
              const selectedField = this.sortOptions.find(sort => sort.value === s.sort_key);
              if (selectedField) {
                this.listOfData.push({
                  sort_no: this.listOfData.length + 1,
                  sort_key: s.sort_key,
                  sort_field_name: selectedField.label,
                  sort_value: s.sort_value,
                  sort_value_label: s.sort_value === 'ascend' ? 'page.report.ascending' : 'page.report.descending'
                });
              }
            });
          }
        }
      });

      await this.datastoreService.getRelations(datastoreId).then(data => {
        if (data) {
          this.relations = data;
        }
      });
    } else {
      this.setDefaultApiKey();
    }
  }

  /**
   * @description: 添加datastore
   */
  submitForm = ($event: any, value: any) => {
    for (let i = 0; i < this.selectFields.length; i++) {
      this.selectFieldID.push(this.selectFields[i].field_id)
    }
    if (this.status === 'add') {
      // 添加的台账的信息
      const params = {
        datastore_name: this.form.controls.datastoreName.value,
        api_key: this.form.controls.apiKey.value,
        can_check: this.form.controls.canCheck.value,
        show_in_menu: this.form.controls.showInMenu.value,
        no_status: this.form.controls.noStatus.value,
        encoding: this.form.controls.encoding.value,
        /* scan_fields: this.form.controls.scanFields.value, */
        scan_fields: this.selectFieldID,
        scan_fields_connector: this.form.controls.scanFieldsConnector.value,
        print_field1: this.form.controls.printField1.value,
        print_field2: this.form.controls.printField2.value,
        print_field3: this.form.controls.printField3.value,
        field_width: this.form.controls.fieldWidth.value
      };
      // 调用服务进行添加台账
      this.datastoreService.addDatastore(params).then(async res => {
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        this.reset();
      });
    } else {
      this.sorts = this.listOfData.map(s => {
        return { sort_key: s.sort_key, sort_value: s.sort_value };
      });
      // 过滤掉已删除的字段
      let scanFields: string[] = this.selectFieldID;
      if (scanFields && scanFields.length > 0) {
        scanFields = scanFields.filter(f => this.scanFieldsSel.find(fd => fd.field_id === f) || f == "sys_dami");
      }

      // 添加的台账的信息
      const params = {
        datastore_name: this.form.controls.datastoreName.value,
        api_key: this.form.controls.apiKey.value,
        can_check: this.form.controls.canCheck.value ? 'true' : 'false',
        encoding: this.form.controls.encoding.value,
        sorts: this.sorts,
        scan_fields: scanFields,
        scan_fields_connector: this.form.controls.scanFieldsConnector.value,
        print_field1: this.form.controls.printField1.value,
        print_field2: this.form.controls.printField2.value,
        print_field3: this.form.controls.printField3.value,
        field_width: this.form.controls.fieldWidth.value
      };
      const datastoreId = this.route.snapshot.paramMap.get('d_id');
      // 调用服务进行添加台账
      this.datastoreService.updateDatastore(datastoreId, params).then(async res => {
        await this.i18n.updateDynamicLangData();
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        this.router.navigate([`datastores/${datastoreId}/info`]);
      });
    }
  };

  /**
   * @description: 台账名称唯一性检查
   */
  datastoreNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const datastoreId = this.route.snapshot.paramMap.get('d_id');
      this.validation.validationUnique('datastores', control.value, { change_id: datastoreId }).then((has: boolean) => {
        if (!has) {
          observer.next(null);
        } else {
          observer.next({ error: true, duplicated: true });
        }
        observer.complete();
      });
    });

  /**
   * @description: 台账apiKey唯一性检查
   */
  datastoreIDAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      if (this.status === 'edit' && control.value === this.apiKeyOld) {
        observer.next(null);
        observer.complete();
      }
      this.datastoreService.datastoreIDAsyncValidator({ appID: this.appId, apiKey: control.value }).then((apikey: boolean) => {
        if (!apikey) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 生成默认APP-KEY,提供参考
   */
  setDefaultApiKey() {
    this.form.controls.apiKey.setValue('datastore_' + this.genUUID(3));
    this.form.controls.apiKey.markAsTouched();
  }

  showFieldInfo(fs: string) {
    const fList = fs.split(',');
    if (fList) {
      const result = fList.map(f => this.fields.find(fd => fd.field_id === f));
      return result;
    }

    return [];
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
   * @description: 已经被选中否
   */
  isNotSelected(value: string): boolean {
    return this.listOfData.filter(fs => fs.sort_key === value).length === 0;
  }

  /**
   * @description: 是否盘点台账
   */
  inventoryChange(value: boolean) {
    if (!value) {
      this.form.controls.selectFieldsName.setValue([]);
      this.form.controls.scanFieldsConnector.setValue('');
    }
  }

  /**
   * @description: 添加排序字段
   */
  addField(value: any) {
    const selectedField = this.sortOptions.find(sort => sort.value === value.sortKey);
    const item = {
      sort_no: this.listOfData.length + 1,
      sort_key: value.sortKey,
      sort_field_name: selectedField.label,
      sort_value: value.sortValue,
      sort_value_label: value.sort_value === 'ascend' ? 'page.report.ascending' : 'page.report.descending'
    };

    this.listOfData = [item, ...this.listOfData];

    this.fieldModalInit();
  }

  /**
   * @description: 删除排序字段
   */
  deleteField(sortKey: string) {
    this.listOfData = this.listOfData.filter(s => s.sort_key !== sortKey);
    this.listOfData.forEach((s, i) => {
      s.sort_no = i + 1;
    });
  }

  /**
   * @description: 点击改变排序字段排序方式
   */
  changeSort(sortKey: string) {
    for (let index = 0; index < this.listOfData.length; index++) {
      const s = this.listOfData[index];
      if (s.sort_key === sortKey) {
        if (s.sort_value === 'ascend') {
          s.sort_value = 'descend';
          s.sort_value_label = 'page.report.descending';
        } else {
          s.sort_value = 'ascend';
          s.sort_value_label = 'page.report.ascending';
        }
        break;
      }
      continue;
    }
  }

  /**
   * @description: 拖动改变排序字段顺序
   */
  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.listOfData, event.previousIndex, event.currentIndex);
    this.listOfData.forEach((s, i) => {
      s.sort_no = i + 1;
    });
  }

  /**
   * @description: 排序字段指定画面初期化
   */
  fieldModalInit() {
    this.fieldForm.get('sortKey').reset();
    this.fieldForm.get('sortValue').reset();
    this.showField = false;
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }

  /**
   * @description: 重置表单事件
   */
  reset() {
    this.form.reset();
    this.form.controls.encoding.setValue('UTF-8');
    this.form.controls.showInMenu.setValue(true);
    this.setDefaultApiKey();
  }

  /**
   * @description: 取消当前操作，返回上级
   */
  cancel() {
    this.location.back();
  }

  addUnique() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    const m = this.modal.create({
      nzTitle: this.i18n.translateLang('page.datastore.uniqueSet'),
      nzContent: UniqueAddComponent,
      nzComponentParams: {
        datastoreId: datastoreId,
        unique_fields: this.uniqueFields
      },
      nzFooter: [
        {
          label: this.i18n.translateLang('common.button.save'),
          type: 'primary',
          disabled: instance => instance.form.invalid,
          onClick: instance => {
            m.close();
            instance.save();
          }
        },
        {
          label: this.i18n.translateLang('common.button.cancel'),
          onClick: () => {
            m.close();
          }
        }
      ]
    });
  }

  deleteUnique(key: string) {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    this.modal.confirm({
      nzTitle: this.i18n.translateLang('common.message.confirm.uniqueDelTitle'),
      nzContent: this.i18n.translateLang('common.message.confirm.uniqueDelContent'),
      nzOnOk: async () => {
        // 物理删除台账&台账字段&台账数据&关联报表&关联仪表盘&相关多语言项(台账名称，字段名称，报表名称，仪表盘名称)
        await this.datastoreService.deleteUniqueKey(datastoreId, key);
        this.message.success(this.i18n.translateLang('common.message.success.S_003'));
        this.init();
      }
    });
  }

  addRelation() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    const m = this.modal.create({
      nzTitle: this.i18n.translateLang('page.datastore.relationSet'),
      nzContent: RelationAddComponent,
      nzComponentParams: {
        datastoreId: datastoreId
      },
      nzFooter: [
        {
          label: this.i18n.translateLang('common.button.save'),
          type: 'primary',
          disabled: instance => instance.form.invalid,
          onClick: instance => {
            m.close();
            instance.save();
          }
        },
        {
          label: this.i18n.translateLang('common.button.cancel'),
          onClick: () => {
            m.close();
          }
        }
      ]
    });
  }

  deleteRelation(id: string) {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    this.modal.confirm({
      nzTitle: this.i18n.translateLang('common.message.confirm.relationDelTitle'),
      nzContent: this.i18n.translateLang('common.message.confirm.relationDelContent'),
      nzOnOk: async () => {
        // 物理删除台账&台账字段&台账数据&关联报表&关联仪表盘&相关多语言项(台账名称，字段名称，报表名称，仪表盘名称)
        await this.datastoreService.deleteRelation(datastoreId, id);
        this.message.success(this.i18n.translateLang('common.message.success.S_003'));
        this.init();
      }
    });
  }

  /**
   * @description: 打开数据选择画面
   */
  openModal(): void {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    if (datastoreId) {
      this.status = 'edit';
      // 获取台账情报
      this.datastoreService.getDatastoreByID(datastoreId).then((data: any) => {
        if (data) {
          if (data.scan_fields == null) {
            this.selectFields = [];
            for (let m = 0; m < this.scanFieldsSel.length; m++) {
              this.scanFieldsSel[m]["disabled"] = false
            }
            if (this.form.controls.selectFieldsName.value.length != 0) {
              for (let i = 0; i < this.form.controls.selectFieldsName.value.length; i++) {
                if (this.form.controls.selectFieldsName.value[i] != "DUMMY") {
                  for (let m = 0; m < this.scanFieldsSel.length; m++) {
                    if (this.i18n.translateLang(this.scanFieldsSel[m].field_name) == this.form.controls.selectFieldsName.value[i]) {
                      this.scanFieldsSel[m]["order"] = this.getOrder()
                      this.scanFieldsSel[m]["disabled"] = true
                      this.selectFields.push(this.scanFieldsSel[m])
                    }
                  }
                } else {
                  const fixedFields = JSON.parse(JSON.stringify(this.fixedFields));
                  fixedFields["order"] = this.getOrder()
                  this.selectFields.push(fixedFields)
                }
              }
            }
          } else {
            this.selectFields = [];
            for (let i = 0; i < data.scan_fields.length; i++) {
              if (data.scan_fields[i] != "sys_dami") {
                for (let m = 0; m < this.scanFieldsSel.length; m++) {
                  if (this.scanFieldsSel[m].field_id == data.scan_fields[i]) {
                    this.scanFieldsSel[m]["order"] = this.getOrder()
                    this.scanFieldsSel[m]["disabled"] = true
                    this.selectFields.push(this.scanFieldsSel[m])
                  }
                }
              } else {
                const fixedFields = JSON.parse(JSON.stringify(this.fixedFields));
                fixedFields["order"] = this.getOrder()
                this.selectFields.push(fixedFields)
              }
            }
          }
        }
      });
    } else {
      this.setDefaultApiKey();
    }

    this.isVisible = true;
  }

  saveField(i: any) {
    if (i.disabled) {
      return;
    }

    // 如果已经存在，直接返回
    if (this.selectFields.find(f => f.field_id === i.field_id && f.datastore_id === i.datastore_id)) {
      return;
    }

    // 先查看当前台账的字段
    const fs = this.scanFieldsSel.find(f => f.field_id === i.field_id && f.datastore_id === i.datastore_id && !f.submenu);
    if (fs) {
      fs.order = this.getOrder();
      this.selectFields = [...this.selectFields, fs];
      fs.disabled = true;
      return;
    }

    // 再查看当前台账的关联字段
    this.scanFieldsSel.forEach(f => {
      if (f.children) {
        const children = f.children;

        const ofs = children.find(of => of.field_id === i.field_id && of.datastore_id === i.datastore_id);
        if (ofs) {
          ofs.order = this.getOrder();
          this.selectFields = [...this.selectFields, ofs];
          ofs.disabled = true;
          return;
        }
      }
    });

    this.selectFields.push(i)
  }

  /**
   * 获取排序
   * @returns 返回排序
   */
  getOrder() {
    if (this.selectFields.length === 0) {
      return 1;
    }

    let order = this.selectFields[0].order;
    for (let i = 0; i < this.selectFields.length - 1; i++) {
      order = order < this.selectFields[i + 1].order ? this.selectFields[i + 1].order : order;
    }
    return order + 1;
  }

  addDami() {
    const fixedFields = JSON.parse(JSON.stringify(this.fixedFields));
    fixedFields["order"] = this.getOrder()
    this.selectFields.push(fixedFields)
  }

  /**
  * @description: 调整表格行宽
  */
  onResizeScanField({ width }: NzResizeEvent, col: string): void {
    this.colsWithGroup = this.colsWithGroup.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }

  dropScanField(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.selectFields, event.previousIndex, event.currentIndex);
    this.selectFields.forEach((n, i) => {
      const node = i + 1;
      n.order = node;
    });
  }

  /**
   * @description: 添加更新删除已选字段
   * @param boolean 删除或者是添加更新
   * @param string 字段ID
   */
  delete(fieldID: string, datastoreID: string, order: any) {
    const fs = this.scanFieldsSel.find(f => f.field_id === fieldID && f.datastore_id === datastoreID && !f.submenu);
    if (fs) {
      this.selectFields = this.selectFields.filter(f => !(f.field_id === fieldID && f.datastore_id === datastoreID));
      fs.disabled = false;
    }

    this.scanFieldsSel.forEach(f => {
      if (f.children) {
        const children = f.children;

        const ofs = children.find(of => of.field_id === fieldID && of.datastore_id === datastoreID);
        if (ofs) {
          this.selectFields = this.selectFields.filter(sf => !(sf.field_id === fieldID && sf.datastore_id === datastoreID));
          ofs.disabled = false;
        }
      }
    });

    if (fieldID == "sys_dami") {
      this.selectFields = this.selectFields.filter(f => f.order != order)
    }

    this.selectFields.forEach((n, i) => {
      const node = i + 1;
      n.order = node;
    });
  }

  reflect() {
    this.selectFieldName = []
    if (this.selectFields.length == 0) {
      this.form.controls.selectFieldsName.setValue([]);
    } else {
      for (let i = 0; i < this.selectFields.length; i++) {
        this.selectFieldName.push(this.i18n.translateLang(this.selectFields[i].field_name))
      }
      this.form.controls.selectFieldsName.setValue(this.selectFieldName);
    }
    this.isVisible = false
  }

  /**
   * @description: 关闭数据选择画面
   */
  close() {
    this.isVisible = false;
    /* this.selectFields = []; */
  }
}
