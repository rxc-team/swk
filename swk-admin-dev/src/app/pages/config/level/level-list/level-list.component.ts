import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LevelService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-level-list',
  templateUrl: './level-list.component.html',
  styleUrls: ['./level-list.component.less']
})
export class LevelListComponent implements OnInit {
  cols = [
    {
      title: 'page.level.name',
      width: '180px'
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
    private ls: LevelService,
    private message: NzMessageService,
    private router: Router,
    private modal: NzModalService,
    private i18n: I18NService,
    private nbs: NzBreakpointService,
    private fb: FormBuilder
  ) {
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
  langList = this.langs();

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
    this.ls.getLevels().then((data: any) => {
      if (data) {
        this.displayData = data;
      }
      this.loading = false;
    });
    this.selectData = [];
  }

  /**
   * @description: 彻底删除选中权限级别
   */
  hardDeleteAll(): void {
    const params = [];
    this.selectData.forEach(d => {
      params.push(d.level_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.deleteTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.deleteContent')}`,
      nzOnOk: () =>
        this.ls.deleteLevels(params).then(async res => {
          this.selectAll = false;
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          this.search();
        })
    });
  }

  /**
   * @description: 跳转到权限级别修改页面
   */
  goToUpdate(helpTypeId: string) {
    const info = `/config/level/${helpTypeId}/setting`;
    this.router.navigate([info]);
  }

  /**
   * @description: 跳转到权限级别添加页面
   */
  foward() {
    this.router.navigate(['/config/level/add']);
  }

  /**
   * @description: 重新初始化处理
   */
  async refresh() {
    this.search();
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
