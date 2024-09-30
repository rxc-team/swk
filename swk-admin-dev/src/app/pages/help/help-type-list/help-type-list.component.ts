import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService } from '@core';

import { HelpTypeService } from '../../../api/help-type.service';

@Component({
  selector: 'app-help-type-list',
  templateUrl: './help-type-list.component.html',
  styleUrls: ['./help-type-list.component.less']
})
export class HelpTypeListComponent implements OnInit {
  cols = [
    {
      title: 'page.help.type.name',
      width: '180px'
    },
    {
      title: 'page.help.type.showOrHidde',
      width: '120px'
    },
    {
      title: 'page.help.type.supportLang',
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
    private helpTypeService: HelpTypeService,
    private message: NzMessageService,
    private router: Router,
    private modal: NzModalService,
    private i18n: I18NService,
    private nbs: NzBreakpointService,
    private event: NgEventBus,
    private fb: FormBuilder
  ) {
    this.event.on('helpType:refresh').subscribe(() => {
      this.search();
    });

    this.seachForm = this.fb.group({
      typeName: ['', []],
      show: ['', []],
      langCD: [null, []]
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
      typeName: this.seachForm.controls.typeName.value,
      show: this.seachForm.controls.show.value,
      lang_cd: this.seachForm.controls.langCD.value
    };
    this.helpTypeService.getTypes(params).then((res: any) => {
      if (res) {
        res.forEach(t => {
          const lang = this.langList.find(l => t.lang_cd === l.code);
          if (lang) {
            t.lang_cd = lang.text;
          }
        });
        this.displayData = res;
      }
      this.loading = false;
    });
    this.selectData = [];
  }

  /**
   * @description: 彻底删除选中帮助类别
   */
  hardDeleteAll(): void {
    const params = [];
    this.selectData.forEach(d => {
      params.push(d.type_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.deleteTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.deleteContent')}`,
      nzOnOk: () =>
        this.helpTypeService.deleteSelectTypes(params).then(async res => {
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
   * @description: 跳转到帮助类别修改页面
   */
  goToUpdate(helpTypeId: string) {
    const info = `/help/updateType/${helpTypeId}`;
    this.router.navigate([info]);
  }

  /**
   * @description: 跳转到帮助类别添加页面
   */
  foward() {
    this.router.navigate(['/help/addType']);
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
