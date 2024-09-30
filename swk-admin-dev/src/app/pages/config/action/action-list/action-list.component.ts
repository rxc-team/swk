import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ActionService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-action-list',
  templateUrl: './action-list.component.html',
  styleUrls: ['./action-list.component.less']
})
export class ActionListComponent implements OnInit {
  cols = [
    {
      title: 'page.action.key',
      width: '140px'
    },
    {
      title: 'page.action.objtype',
      width: '120px'
    },

    {
      title: 'page.action.zh',
      width: '150px'
    },
    {
      title: 'page.action.ja',
      width: '150px'
    },
    {
      title: 'page.action.en',
      width: '130px'
    },
    {
      title: 'page.action.th',
      width: '130px'
    },
    {
      title: 'page.action.group',
      width: '90px'
    },
    {
      title: 'common.text.createdDate',
      width: '150px'
    },
    {
      title: 'common.text.updateDate'
    }
  ];

  groups = [
    { label: 'page.action.base', value: 'base' },
    { label: 'page.action.import', value: 'import' },
    { label: 'page.action.export', value: 'export' },
    { label: 'page.action.lease', value: 'lease' },
    { label: 'page.action.other', value: 'other' }
  ];

  constructor(
    private as: ActionService,
    private message: NzMessageService,
    private router: Router,
    private modal: NzModalService,
    private i18n: I18NService,
    private nbs: NzBreakpointService,
    private fb: FormBuilder
  ) {
    this.seachForm = this.fb.group({
      actionGroup: ['']
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
    this.displayData = [];
    const params = {
      action_group: this.seachForm.controls.actionGroup.value
    };
    this.as.getActions(params).then((data: any) => {
      if (data) {
        this.displayData = data;
      }
      this.loading = false;
    });
    this.selectData = [];
  }

  /**
   * @description: 彻底删除选中操作
   */
  hardDeleteAll(): void {
    const params = {};
    const dels = [];
    this.selectData.forEach(d => {
      dels.push({
        action_object: d.action_object,
        action_key: d.action_key
      });
    });
    params['dels'] = dels;

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.deleteTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.deleteContent')}`,
      nzOnOk: () =>
        this.as.deleteActions(params).then(async res => {
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
   * @description: 跳转到操作修改页面
   */
  goToUpdate(actionObject: string, actionKey: string) {
    const info = `/config/action/objs/${actionObject}/actions/${actionKey}/setting`;
    this.router.navigate([info]);
  }

  /**
   * @description: 跳转到操作添加页面
   */
  foward() {
    this.router.navigate(['/config/action/add']);
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
