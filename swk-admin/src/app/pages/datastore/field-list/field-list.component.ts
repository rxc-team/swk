/*
 * @Description: 字段列表控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-05-16 11:22:52
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2021-01-18 14:56:45
 */

import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DatastoreService, FieldService, LanguageService, ValidationService } from '@api';
import { I18NService } from '@core';

import { FieldTypeList } from '../field-type';

@Component({
  selector: 'app-field-list',
  templateUrl: './field-list.component.html',
  styleUrls: ['./field-list.component.less']
})
export class FieldListComponent implements OnInit, OnDestroy {
  cols = [
    {
      title: 'page.datastore.field.fieldName',
      width: '150px'
    },
    {
      title: 'page.datastore.field.fieldType',
      width: '150px'
    },
    {
      title: 'page.datastore.field.inputRequired',
      width: '100px'
    },
    {
      title: 'page.datastore.field.onlyField',
      width: '100px'
    },
    {
      title: 'page.datastore.field.asPic',
      width: '180px'
    },
    {
      title: 'common.text.createdAt',
      width: '150px'
    },
    {
      title: 'common.text.updateAt'
    }
  ];

  // 构造函数
  constructor(
    private message: NzMessageService,
    private fieldService: FieldService,
    private router: Router,
    private route: ActivatedRoute,
    private modal: NzModalService,
    private i18n: I18NService,
    private db: DatastoreService,
    private validation: ValidationService,
    private languageService: LanguageService,
    private fb: FormBuilder,
    private event: NgEventBus,
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
      if (data === 'sm' || data === 'xs' || data === 'md') {
        this.isSmall = true;
      } else {
        this.isSmall = false;
      }
    });
    this.event.on('field:refresh').subscribe(() => {
      this.search();
    });

    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.seachForm = this.fb.group({
          fieldType: [null, []],
          isRequired: [null, []],
          asTitle: [null, []],
          invalidatedIn: [null, []]
        });
        this.init();
      }
    });
  }

  // 全局类型
  navigationSubscription;
  // 检索表单
  seachForm: FormGroup;
  // 选择数据
  selectData = [];
  selectDataOfValid = [];
  selectDataOfInvalid = [];
  // 是否选择所有
  selectAll = false;
  // 显示一览数据
  displayData = [];
  // 字段类型选项
  fieldTypeList = FieldTypeList;

  confirmModal: NzModalRef;

  isSmall = false;
  isZoomFlg = false;

  index = 1;
  total = 0;

  /**
   * @description: 画面初始化处理
   */
  async ngOnInit() {
    this.seachForm = this.fb.group({
      fieldType: [null, []],
      isRequired: [null, []],
      asTitle: [null, []],
      invalidatedIn: [null, []]
    });

    this.init();
  }

  /**
   * @description: 画面销毁处理
   */
  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  /**
   * @description: 初始化处理
   */
  async init() {
    // 重置数据
    this.selectData = [];
    this.selectDataOfValid = [];
    this.selectDataOfInvalid = [];
    this.selectAll = false;
    this.displayData = [];
    // 检索
    await this.search();
  }

  /**
   * @description: 通过条件查找
   */
  async search() {
    // 重置数据
    this.displayData = [];
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    // 从检索条件中获取值
    const fieldType = this.seachForm.controls.fieldType.value;
    const isRequired = this.seachForm.controls.isRequired.value;
    const asTitle = this.seachForm.controls.asTitle.value;
    const invalidatedIn = this.seachForm.controls.invalidatedIn.value;
    // 取字段
    await this.fieldService
      .getFields(datastoreId, {
        field_type: fieldType,
        is_required: isRequired,
        as_title: asTitle,
        invalidatedIn: invalidatedIn
      })
      .then(data => {
        if (data) {
          this.displayData = data;
          this.total = data.length;
        } else {
          this.displayData = [];
          this.total = 0;
        }
      });
    this.selectData = [];
    this.selectDataOfValid = [];
    this.selectDataOfInvalid = [];
  }

  /**
   * @description: 跳转到添加字段页面
   */
  foward(type: string, id?: string) {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    switch (type) {
      case 'add':
        const add = `/datastores/${datastoreId}/field/add`;
        this.router.navigate([add]);
        break;
      case 'edit':
        const edit = `/datastores/${datastoreId}/field/${id}/edit`;
        this.router.navigate([edit]);
        break;
      case 'layout':
        const layout = `/datastores/${datastoreId}/field/layout`;
        this.router.navigate([layout]);
        break;
      case 'width':
        const width = `/datastores/${datastoreId}/field/width`;
        this.router.navigate([width]);
        break;
      case 'print':
        const print = `/datastores/${datastoreId}/field/print`;
        this.router.navigate([print]);
        break;

      default:
        break;
    }
  }

  getFieldTypeName(fieldType) {
    const field = FieldTypeList.find(f => f.value === fieldType);
    return field ? field.label : fieldType;
  }

  /**
   * @description: 全选
   */
  checkAll(event) {
    this.displayData.forEach(f => (f.checked = event));
    this.selectData = this.displayData.filter(d => d.checked === true);
    this.selectDataOfValid = this.displayData.filter(d => d.checked === true && !d.deleted_by);
    this.selectDataOfInvalid = this.displayData.filter(d => d.checked === true && d.deleted_by);
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.displayData.filter(d => d.checked === true);
    this.selectDataOfValid = this.displayData.filter(d => d.checked === true && !d.deleted_by);
    this.selectDataOfInvalid = this.displayData.filter(d => d.checked === true && d.deleted_by);

    if (this.selectData.length === this.displayData.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  /**
   * @description: 削除选中字段
   */
  deleteAll(): void {
    const params = [];
    const items = [];
    this.selectDataOfValid.forEach(d => {
      params.push(d.field_id);
      items.push({
        datastore_id: d.datastore_id,
        field_id: d.field_id
      });
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selFieldDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selFieldDelContent')}`,
      nzOnOk: async () => {
        let canDelete = true;

        // 验证是否是别的台账的被关联的字段
        let datastores = [];
        await this.db.getDatastores().then((data: any[]) => {
          if (data) {
            datastores = data;
          }
        });

        await Promise.all(
          datastores.map(async ds => {
            return this.fieldService.getFields(ds.datastore_id, { field_type: 'lookup' });
          })
        ).then((data: any[]) => {
          if (data) {
            const fieldList = [];
            data.forEach(fields => {
              if (fields) {
                fields.forEach(f => {
                  const fd = items.find(p => p.datastore_id === f.lookup_datastore_id && p.field_id === f.lookup_field_id);
                  if (fd) {
                    const ds = datastores.find(d => d.datastore_id === f.datastore_id);
                    fieldList.push({
                      datastoreName: this.i18n.translateLang(ds.datastore_name),
                      fieldName: this.i18n.translateLang(f.field_name)
                    });
                  }
                });
              }
            });
            if (fieldList.length > 0) {
              fieldList.forEach(item => {
                this.message.error(
                  this.i18n.translateLang('common.message.error.E_009', {
                    dsName: item.datastoreName,
                    fieldName: item.fieldName
                  })
                );
              });
              canDelete = false;
            }
          }
        });

        if (canDelete) {
          await Promise.all(
            items.map(async item => {
              return this.validation.validationField(item.datastore_id, item.field_id);
            })
          ).then((data: any[]) => {
            if (data) {
              const reportList = [];
              data.forEach(reports => {
                if (reports) {
                  reports.forEach(r => {
                    reportList.push(this.i18n.translateLang(r.report_name));
                  });
                }
              });
              if (reportList.length > 0) {
                this.message.error(
                  this.i18n.translateLang('common.message.error.E_011', {
                    reportList: reportList
                  })
                );
                canDelete = false;
              }
            }
          });
          if (canDelete) {
            const datastoreId = this.route.snapshot.paramMap.get('d_id');
            this.fieldService.deleteSelectFields(datastoreId, params).then(async res => {
              this.selectAll = false;
              this.message.success(this.i18n.translateLang('common.message.success.S_009'));
              this.search();
            });
          }
        }
      }
    });
  }

  /**
   * @description: 彻底削除选中字段
   */
  hardDeleteAll(): void {
    const params = [];
    const items = [];
    this.selectData.forEach(d => {
      params.push(d.field_id);
      items.push({
        datastore_id: d.datastore_id,
        field_id: d.field_id
      });
    });
    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selFieldHardDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selFieldHardDelContent')}`,
      nzOnOk: async () => {
        let canDelete = true;

        // 验证是否是别的台账的被关联的字段
        let datastores = [];
        await this.db.getDatastores().then((data: any[]) => {
          if (data) {
            datastores = data;
          }
        });

        await Promise.all(
          datastores.map(async ds => {
            return this.fieldService.getFields(ds.datastore_id, { field_type: 'lookup' });
          })
        ).then((data: any[]) => {
          if (data) {
            const fieldList = [];
            data.forEach(fields => {
              if (fields) {
                fields.forEach(f => {
                  const fd = items.find(p => p.datastore_id === f.lookup_datastore_id && p.field_id === f.lookup_field_id);
                  if (fd) {
                    const ds = datastores.find(d => d.datastore_id === f.datastore_id);
                    fieldList.push({
                      datastoreName: this.i18n.translateLang(ds.datastore_name),
                      fieldName: this.i18n.translateLang(f.field_name)
                    });
                  }
                });
              }
            });
            if (fieldList.length > 0) {
              fieldList.forEach(item => {
                this.message.error(
                  this.i18n.translateLang('common.message.error.E_009', {
                    dsName: item.datastoreName,
                    fieldName: item.fieldName
                  })
                );
              });
              canDelete = false;
            }
          }
        });

        if (canDelete) {
          await Promise.all(
            items.map(async item => {
              return this.validation.validationField(item.datastore_id, item.field_id);
            })
          ).then((data: any[]) => {
            if (data) {
              const reportList = [];
              data.forEach(reports => {
                if (reports) {
                  reports.forEach(r => {
                    reportList.push(this.i18n.translateLang(r.report_name));
                  });
                }
              });
              if (reportList.length > 0) {
                this.message.error(
                  this.i18n.translateLang('common.message.error.E_011', {
                    reportList: reportList
                  })
                );
                canDelete = false;
              }
            }
          });
          if (canDelete) {
            await this.fieldService.hardDeleteSelectFields(datastoreId, params).then(async res => {});
            this.selectAll = false;
            this.message.success(this.i18n.translateLang('common.message.success.S_003'));
            this.search();
          }
        }
      }
    });
  }

  /**
   * @description: 恢复选中的无效化字段记录
   */
  recover(): void {
    const params = [];
    this.selectDataOfInvalid.forEach(d => {
      params.push(d.field_id);
    });

    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    this.fieldService.recoverFields(datastoreId, params).then(async res => {
      this.selectAll = false;
      this.message.success(this.i18n.translateLang('common.message.success.S_005'));
      this.search();
    });
    this.selectData = [];
    this.selectDataOfValid = [];
    this.selectDataOfInvalid = [];
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
