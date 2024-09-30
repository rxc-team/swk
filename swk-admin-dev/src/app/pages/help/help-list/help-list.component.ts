import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HelpService, HelpTypeService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-help-list',
  templateUrl: './help-list.component.html',
  styleUrls: ['./help-list.component.less']
})
export class HelpListComponent implements OnInit {
  cols = [
    {
      title: 'page.help.title',
      width: '200px'
    },
    {
      title: 'page.help.type.name',
      width: '120px'
    },
    {
      title: 'page.help.content',
      width: '300px'
    },
    {
      title: 'page.help.supportLang',
      width: '100px'
    },
    {
      title: 'common.text.createdDate',
      width: '150px'
    },
    {
      title: 'common.text.updateDate',
      width: '150px'
    },
    {
      title: 'page.help.tag'
    }
  ];

  constructor(
    private message: NzMessageService,
    private helpTypeService: HelpTypeService,
    private helpService: HelpService,
    private router: Router,
    private modal: NzModalService,
    private i18n: I18NService,
    private nbs: NzBreakpointService,
    private event: NgEventBus,
    private fb: FormBuilder
  ) {
    this.event.on('help:refresh').subscribe(() => {
      this.init();
    });

    this.seachForm = this.fb.group({
      helpTitle: ['', []],
      helpType: ['', []],
      langCD: ['', []],
      tag: ['', []]
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
  typeList = [];
  tagList = [];

  seachForm: FormGroup;

  loading = false;

  confirmModal: NzModalRef;

  ngOnInit() {
    this.init();
  }

  async init() {
    await this.setTypeList();
    await this.setTagList();
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
   * @description: 获取当前帮助类型列表
   */
  async setTypeList() {
    await this.helpTypeService.getTypes().then((res: any[]) => {
      if (res) {
        this.typeList = res;
      }
    });
  }

  /**
   * @description: 获取当前帮助类型列表
   */
  async setTagList() {
    await this.helpService.getHelpTags().then((res: any[]) => {
      if (res) {
        this.tagList = res;
      }
    });
  }
  /**
   * @description: 検索
   */
  async search() {
    this.loading = true;
    this.displayData = [];
    const params = {
      title: this.seachForm.controls.helpTitle.value,
      type: this.seachForm.controls.helpType.value,
      tag: this.seachForm.controls.tag.value,
      lang_cd: this.seachForm.controls.langCD.value
    };
    await this.helpService.getHelps(params).then((res: any) => {
      if (res) {
        res.forEach(h => {
          const type = this.typeList.find(t => h.type === t.type_id);
          if (type) {
            h.type = type.type_name;
          }
          const lang = this.langList.find(l => h.lang_cd === l.code);
          if (lang) {
            h.lang_cd = lang.text;
          }
        });
        this.displayData = res;
      }
      this.loading = false;
    });
    this.selectData = [];
  }

  /**
   * @description: 彻底删除选中帮助
   */
  hardDeleteAll(): void {
    const params = [];
    this.selectData.forEach(d => {
      params.push(d.help_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.deleteTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.deleteContent')}`,
      nzOnOk: () =>
        this.helpService.hardDeleteSelectHelps(params).then(async res => {
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
   * @description: 跳转到帮助修改页面
   */
  goToDetail(helpId: string) {
    const info = `/help/update/${helpId}`;
    this.router.navigate([info]);
  }

  /**
   * @description: 跳转到帮助添加页面
   */
  foward() {
    this.router.navigate(['/help/add']);
  }

  /**
   * @description: 重新初始化处理
   */
  async refresh() {
    this.seachForm.reset();
    await this.setTypeList();
    await this.setTagList();
    this.search();
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
