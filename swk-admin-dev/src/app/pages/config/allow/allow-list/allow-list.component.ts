import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AllowService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-allow-list',
  templateUrl: './allow-list.component.html',
  styleUrls: ['./allow-list.component.less']
})
export class AllowListComponent implements OnInit {
  cols = [
    {
      title: 'page.allow.name',
      width: '180px'
    },
    {
      title: 'page.allow.type',
      width: '120px'
    },
    {
      title: 'page.allow.objtype',
      width: '150px'
    },
    {
      title: 'common.text.createdDate',
      width: '150px'
    },
    {
      title: 'common.text.updateDate'
    }
  ];

  constructor(
    private as: AllowService,
    private message: NzMessageService,
    private router: Router,
    private route: ActivatedRoute,
    private modal: NzModalService,
    private i18n: I18NService,
    private nbs: NzBreakpointService,
    private fb: FormBuilder
  ) {
    this.seachForm = this.fb.group({
      allowType: [''],
      objectType: ['']
    });

    nbs
      .subscribe({
        xs: '480px',
        sm: '768px',
        md: '992px',
        lg: '1200px',
        xl: '1600px',
        xxl: '1600px'
      })
      .subscribe(data => {
        if (data === 'sm' || data === 'xs') {
          this.isSmall = true;
        } else {
          this.isSmall = false;
        }
      });
  }

  objTypes = [
    { label: 'page.allow.objectType.datastore', value: 'base', base: 'datastore' },
    { label: 'page.allow.objectType.checkDatastore', value: 'check', base: 'datastore' },
    { label: 'page.allow.objectType.leaseDatastore', value: 'lease', base: 'datastore' },
    { label: 'page.allow.objectType.leaseRelationDatastore', value: 'lease_relation', base: 'datastore' },
    { label: 'page.allow.objectType.shiwakeDatastore', value: 'journal', base: 'datastore' },
    { label: 'page.allow.objectType.report', value: 'report', base: 'report' },
    { label: 'page.allow.objectType.document', value: 'folder', base: 'folder' },
    { label: 'page.allow.objectType.shiwake', value: 'journal', base: 'journal' }
  ];

  types = [
    { label: 'page.allow.allowType.datastore', value: 'datastore' },
    { label: 'page.allow.allowType.report', value: 'report' },
    { label: 'page.allow.allowType.document', value: 'folder' },
    { label: 'page.allow.allowType.shiwake', value: 'journal' }
  ];

  displayData = [];
  selectData = [];
  selectAll = false;
  isSmall = false;
  isZoomFlg = false;
  langList = this.langs();

  seachForm: FormGroup;

  loading = false;

  confirmModal: NzModalRef;

  ngOnInit(): void {
    this.search();
  }

  /**
   * @description: 全选
   */
  checkAll(event) {
    this.displayData.forEach(f => (f.checked = event));
    this.selectData = this.displayData.filter(d => d.checked === true);
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.displayData.filter(d => d.checked === true);

    if (this.selectData.length === this.displayData.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  /**
   * @description: 获取当前语言列表
   */
  langs() {
    return this.i18n.getLangs();
  }

  /**
   * @description: 検索
   */
  search(): void {
    this.loading = true;
    const params = {
      allow_type: this.seachForm.controls.allowType.value,
      object_type: this.seachForm.controls.objectType.value
    };
    this.as.getAllows(params).then((data: any) => {
      if (data) {
        this.displayData = data;
      } else {
        this.displayData = [];
      }
      this.loading = false;
    });
    this.selectData = [];
  }

  /**
   * @description: 彻底删除选中许可
   */
  hardDeleteAll(): void {
    const params = [];
    this.selectData.forEach(d => {
      params.push(d.allow_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.deleteTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.deleteContent')}`,
      nzOnOk: () =>
        this.as.deleteAllows(params).then(async res => {
          this.selectAll = false;
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          this.search();
        })
    });
  }

  /**
   * @description: 表单重置
   */
  resetForm(): void {
    this.seachForm.reset();
  }

  /**
   * @description: 跳转到许可修改页面
   */
  goToUpdate(id: string) {
    this.router.navigate([`/config/allow/${id}/setting`]);
  }

  /**
   * @description: 跳转到许可添加页面
   */
  foward() {
    this.router.navigate([`/config/allow/add`]);
  }

  /**
   * @description: 重新初始化处理
   */
  async refresh() {
    this.seachForm.reset();
    this.search();
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
