import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DatastoreService, LanguageService, RoleService, UserService, WorkflowService } from '@api';
import { I18NService } from '@core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-datastore-list',
  templateUrl: './datastore-list.component.html',
  styleUrls: ['./datastore-list.component.less']
})
export class DatastoreListComponent implements OnInit {
  cols = [
    {
      title: 'page.datastore.datastoreName',
      width: '200px'
    },
    {
      title: 'page.datastore.checkDatastore',
      width: '100px'
    },
    {
      title: 'page.datastore.displayMenu',
      width: '150px'
    },
    {
      title: 'page.datastore.encoding',
      width: '150px'
    },
    {
      title: 'common.text.createdAt',
      width: '150px'
    },
    {
      title: 'common.text.createdBy',
      width: '120px'
    },
    {
      title: 'common.text.updateAt',
      width: '150px'
    },
    {
      title: 'common.text.updatedBy'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
    private ds: DatastoreService,
    private wfService: WorkflowService,
    private modal: NzModalService,
    private i18n: I18NService,
    private ls: LanguageService,
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
  }

  // 检索表单
  seachForm: FormGroup;
  datastores: any[] = [];
  selectData: any[] = [];
  selectAll = false;
  confirmModal: NzModalRef;

  isSmall = false;
  isZoomFlg = false;

  total = 0;
  index = 1;
  size = 100;

  ngOnInit() {
    this.seachForm = this.fb.group({
      canCheck: [null, []],
      showInMenu: [null, []]
    });
    this.search();
  }

  search() {
    const canCheck = this.seachForm.get('canCheck').value ? 'true' : '';
    const showInMenu = this.seachForm.get('showInMenu').value ? 'true' : '';
    this.datastores = [];
    this.ds.getDatastores({ canCheck: canCheck, showInMenu: showInMenu }).then((data: any[]) => {
      if (data) {
        const datas = [];
        for (let i = 0; i < data.length; i++) {
          const element = data[i];
          element.display_order = i + 1;
          datas.push(element);
        }
        this.datastores = datas;
      }
    });
  }

  fowardToInfo(datastoreId: string) {
    const url = `/datastores/${datastoreId}/info`;
    this.router.navigate([url]);
  }

  fowardToAdd() {
    const url = `/datastores/add`;
    this.router.navigate([url]);
  }
  fowardToGen() {
    const url = `/generate`;
    this.router.navigate([url]);
  }

  /**
   * @description: 全选
   */
  checkAll(event) {
    this.datastores.forEach(f => (f.checked = event));
    this.selectData = this.datastores.filter(d => d.checked === true);
  }

  hardDelete() {
    const datastoreList = [];
    let count = 0;
    this.selectData.forEach(d => {
      datastoreList.push(d.datastore_id);
      this.wfService.getWorkflows({ datastore: d.datastore_id }).then((forms: any) => {
        if (forms) {
          count++;
        }
      });
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.datastoreDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.datastoreDelContent')}`,
      nzOnOk: async () => {
        // 关联的台账检查
        if (count > 0) {
          this.message.error(this.i18n.translateLang('common.message.error.E_028'));
          return;
        } else {
          // 物理删除台账&台账字段&台账数据&关联报表&关联仪表盘&相关多语言项(台账名称，字段名称，报表名称，仪表盘名称)
          await this.ds.harddeleteSelectDatastores(datastoreList);
          this.selectData = [];
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          this.search();
        }
      }
    });
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.datastores.filter(d => d.checked === true);

    if (this.selectData.length === this.datastores.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  /**
   * @description: 刷新
   */
  refresh() {
    this.search();
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
  /**
   * @description: 拖动改变排序台账顺序
   */
  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.datastores, event.previousIndex, event.currentIndex);
    this.datastores.forEach((s, i) => {
      s.display_order = i + 1;
    });
  }
  /**
   * @description: 拖动改变排序台账顺序
   */
  saveSort(): void {
    this.ds.updateDatastoreSort({ datastores_sort: this.datastores }).then(data => {
      if (data) {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
      }
    });
  }
}
