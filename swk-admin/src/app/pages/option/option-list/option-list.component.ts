/*
 * @Description: 选项一览控制器
 * @Author: RXC 廖云江
 * @Date: 2019-07-04 15:26:10
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-09-23 13:47:33
 */

import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DatastoreService, FieldService, OptionService } from '@api';
import { I18NService } from '@core';
import { NfValidators } from '@shared';

@Component({
  selector: 'app-option-list',
  templateUrl: './option-list.component.html',
  styleUrls: ['./option-list.component.less']
})
export class OptionListComponent implements OnInit {
  cols = [
    {
      title: 'page.option.optionID',
      width: '200px'
    },
    {
      title: 'page.option.optionName',
      width: '200px'
    },
    {
      title: 'page.option.optionMemo',
      width: '200px'
    },
    {
      title: 'common.text.createdAt',
      width: '150px'
    },
    {
      title: 'common.text.updateAt'
    }
  ];
  detailCols = [
    {
      title: 'page.option.optionSubName',
      width: '180px'
    },
    {
      title: 'page.option.optionValue',
      width: '120px'
    },
    {
      title: 'page.option.operate'
    }
  ];

  // 显示一览数据
  listOfDataDisplay = [];
  // 多选的数据
  selectData = [];
  selectDataOfValid = [];
  selectDataOfInvalid = [];
  // 是否选择全部
  selectAll = false;
  // 选中的行的数据
  selectItem: any = {};
  // 选中的行的选项数据
  selectItemData = [];
  displaySelectItemData = [];
  // 是否显示详细窗口模态
  isVisible = false;
  showInvalid = false;

  isSmall = false;
  isZoomFlg = false;
  // 检索表单
  seachForm: FormGroup;

  confirmModal: NzModalRef;

  constructor(
    private optionService: OptionService,
    private router: Router,
    private fb: FormBuilder,
    private modal: NzModalService,
    private db: DatastoreService,
    private fieldService: FieldService,
    private i18n: I18NService,
    private event: NgEventBus,
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
    this.event.on('option:refresh').subscribe(() => {
      this.search();
    });

    this.seachForm = this.fb.group({
      optionName: ['', []],
      optionMemo: ['', []],
      invalidatedIn: [null, []]
    });
  }

  /**
   * @description: 画面初期化処理
   */
  async ngOnInit() {
    this.init();
  }

  /**
   * @description: 初始化处理
   */
  async init() {
    await this.search();
  }
  /**
   * @description: 重新初始化处理
   */
  async refresh() {
    await this.i18n.updateDynamicLangData();
    await this.search();
  }

  /**
   * @description: 选项一覧データ取得
   */
  async search() {
    const option_name = this.seachForm.controls.optionName.value;
    const option_memo = this.seachForm.controls.optionMemo.value;
    const invalidatedIn = this.seachForm.controls.invalidatedIn.value || '';
    this.listOfDataDisplay = [];
    await this.optionService.getOptions('', option_name, option_memo, invalidatedIn).then(data => {
      if (data) {
        this.listOfDataDisplay = data;
      } else {
        this.listOfDataDisplay = [];
      }
    });
    this.selectData = [];
    this.selectDataOfValid = [];
    this.selectDataOfInvalid = [];
  }

  /**
   * @description: 全选
   */
  checkAll(event: boolean) {
    this.listOfDataDisplay.forEach(f => (f.checked = event));
    this.selectData = this.listOfDataDisplay.filter(d => d.checked === true);
    this.selectDataOfValid = this.listOfDataDisplay.filter(d => d.checked === true && !d.deleted_by);
    this.selectDataOfInvalid = this.listOfDataDisplay.filter(d => d.checked === true && d.deleted_by);
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.listOfDataDisplay.filter(d => d.checked === true);
    this.selectDataOfValid = this.listOfDataDisplay.filter(d => d.checked === true && !d.deleted_by);
    this.selectDataOfInvalid = this.listOfDataDisplay.filter(d => d.checked === true && d.deleted_by);

    if (this.selectData.length === this.listOfDataDisplay.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  async showInvalidChange(v) {
    await this.optionService.getOptionsByCode(this.selectItem.option_id, 'true').then((data: any[]) => {
      if (data) {
        this.selectItemData = data;
      } else {
        this.selectItemData = [];
      }
    });
    if (!v) {
      this.displaySelectItemData = this.selectItemData.filter(f => !f.deleted_by);
    } else {
      this.displaySelectItemData = this.selectItemData;
    }
  }

  /**
   * @description: 跳转到APP添加页面
   */
  foward() {
    this.router.navigate(['/option/add']);
  }

  /**
   * @description: 选项IDより选项削除
   */
  async deleteValue(optionId: string, value: string) {
    this.confirmModal = await this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.optionDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.optionDelContent')}`,
      nzOnOk: () =>
        this.optionService.hardDeleteOptionsByCodeVal(optionId, value).then(async res => {
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          this.init();
        })
    });
    this.isVisible = false;
    await this.optionService.getOptionsByCode(optionId).then((data: any[]) => {
      if (data) {
        this.selectItemData = data;
        this.displaySelectItemData = this.selectItemData.filter(f => !f.deleted_by);
      } else {
        this.selectItemData = [];
        this.displaySelectItemData = [];
      }
    });
  }
  /**
   * @description: 选项IDより选项削除
   */
  async invalidValue(optionId: string, value: string) {
    this.confirmModal = await this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selOptionDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selOptionDelContent')}`,
      nzOnOk: async () => {
        await this.optionService.deleteOptionsByCodeVal(optionId, value).then(async res => {
          this.message.success(this.i18n.translateLang('common.message.success.S_009'));
        });
        await this.optionService.getOptionsByCode(optionId, 'true').then((data: any[]) => {
          if (data) {
            this.selectItemData = data;
            this.displaySelectItemData = this.selectItemData.filter(f => !f.deleted_by);
          } else {
            this.selectItemData = [];
            this.displaySelectItemData = [];
          }
        });
        this.showInvalid = false;
      }
    });
  }

  async recoverOption(optionId: string, value: string) {
    await this.optionService.recoverOptionsByCodeVal(optionId, value).then(async res => {
      this.message.success(this.i18n.translateLang('common.message.success.S_005'));
    });
    await this.optionService.getOptionsByCode(optionId).then((data: any[]) => {
      if (data) {
        this.selectItemData = data;
        this.displaySelectItemData = this.selectItemData.filter(f => !f.deleted_by);
      } else {
        this.selectItemData = [];
        this.displaySelectItemData = [];
      }
    });
    this.showInvalid = false;
  }

  /**
   * @description: 削除所有选项
   */
  deleteAll(): void {
    const params = [];
    this.selectDataOfValid.forEach(d => {
      params.push(d.option_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selOptionDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selOptionDelContent')}`,
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
            return this.fieldService.getFields(ds.datastore_id, { field_type: 'options' });
          })
        ).then((data: any[]) => {
          if (data) {
            const fieldList = [];
            data.forEach(fields => {
              if (fields) {
                fields.forEach(f => {
                  const fd = params.find(p => p === f.option_id);
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
                  this.i18n.translateLang('common.message.error.E_014', {
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
          this.optionService.deleteSelectOptions(params).then(async res => {
            this.selectAll = false;
            this.message.success(this.i18n.translateLang('common.message.success.S_009'));
            this.init();
          });
        }
      }
    });
  }

  /**
   * @description: 物理削除所有选项组
   */
  hardDeleteAll(): void {
    const params = [];
    this.selectData.forEach(d => {
      params.push(d.option_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selOptionHardDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selOptionHardDelContent')}`,

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
            return this.fieldService.getFields(ds.datastore_id, { field_type: 'options' });
          })
        ).then((data: any[]) => {
          if (data) {
            const fieldList = [];
            data.forEach(fields => {
              if (fields) {
                fields.forEach(f => {
                  const fd = params.find(p => p === f.option_id);
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
                  this.i18n.translateLang('common.message.error.E_014', {
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
          this.optionService.harddeleteSelectOptions(params).then(async res => {
            this.selectAll = false;
            this.message.success(this.i18n.translateLang('common.message.success.S_003'));
            this.init();
          });
        }
      }
    });
  }

  async showInfoModal(optionId: string) {
    this.showInvalid = false;
    const select = this.listOfDataDisplay.filter(o => o.option_id === optionId);
    if (select && select.length > 0) {
      this.selectItem = select[0];
    }

    await this.optionService.getOptionsByCode(optionId, 'true').then((data: any[]) => {
      if (data) {
        this.selectItemData = data;
        this.displaySelectItemData = this.selectItemData.filter(f => !f.deleted_by);
      } else {
        this.selectItemData = [];
        this.displaySelectItemData = [];
      }
    });
    this.isVisible = true;
  }

  checkCanDelete() {
    const data = this.displaySelectItemData.filter(f => !f.deleted_by);
    if (data && data.length <= 1) {
      return true;
    }

    return false;
  }

  handleOk(): void {
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  /**
   * @description: 恢复选中的无效化选项组记录
   */
  recover(): void {
    const params = [];
    this.selectData.forEach(d => {
      params.push(d.option_id);
    });

    this.optionService.recoverOptions(params).then(async res => {
      this.selectAll = false;
      this.message.success(this.i18n.translateLang('common.message.success.S_005'));
      this.search();
    });
    this.selectData = [];
    this.selectDataOfValid = [];
    this.selectDataOfInvalid = [];
  }
  /**
   * @description: csv下载选项数据
   */
  downloadCSV(): void {
    const option_name = this.seachForm.controls.optionName.value;
    const option_memo = this.seachForm.controls.optionMemo.value;
    const invalidatedIn = this.seachForm.controls.invalidatedIn.value || '';

    this.optionService.downloadCSVOptions(option_name, option_memo, invalidatedIn).then(async res => {
      if (res) {
        this.message.success(this.i18n.translateLang('common.message.success.S_013'));
      }
    });
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }

  /**
   * @description: 调整表格行宽
   */
  onResizeDetail({ width }: NzResizeEvent, col: string): void {
    this.detailCols = this.detailCols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
