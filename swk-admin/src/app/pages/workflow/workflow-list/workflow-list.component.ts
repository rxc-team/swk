import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { forkJoin } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ApproveService, WorkflowService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-workflow-list',
  templateUrl: './workflow-list.component.html',
  styleUrls: ['./workflow-list.component.less']
})
export class WorkflowListComponent implements OnInit {
  cols = [
    {
      title: 'page.workflow.validTitle',
      width: '150px'
    },
    {
      title: 'page.workflow.workflowName',
      width: '150px'
    },
    {
      title: 'page.workflow.menuName',
      width: '150px'
    },
    {
      title: 'common.text.createdAt',
      width: '150px'
    },
    {
      title: 'common.text.updateAt'
    }
  ];

  searchForm: FormGroup;

  total = 0;

  displayData = [];

  // 选中的数据
  selectData = [];
  // 是否全部选中
  selectAll = false;

  isSmall = false;
  isZoomFlg = false;

  confirmModal: NzModalRef;

  constructor(
    private ws: WorkflowService,
    private router: Router,
    private i18n: I18NService,
    private message: NzMessageService,
    private modal: NzModalService,
    private as: ApproveService,
    private bs: NzBreakpointService,
    private event: NgEventBus
  ) {
    this.searchForm = new FormGroup({
      wfName: new FormControl('', []),
      menuName: new FormControl('', [])
    });
    this.event.on('workflow:refresh').subscribe(() => {
      this.refresh();
    });

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

  ngOnInit(): void {
    this.search();
  }

  /**
   * @description: 全选
   */
  checkAll(event: boolean) {
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
   * @description: 跳转到角色详细页面
   */
  goToDetail(wfId: string) {
    const editUrl = `/workflow/${wfId}/setting`;
    this.router.navigateByUrl(editUrl);
  }

  foward() {
    this.router.navigateByUrl('/workflow/add');
  }

  refresh() {
    this.search();
  }

  search() {
    this.ws.getWorkflows().then((data: any) => {
      if (data) {
        this.displayData = data;
        this.total = data.length;
      } else {
        this.displayData = [];
        this.total = 0;
      }
    });
  }

  async delete() {
    const workflows = this.selectData.map(w => w.wf_id);
    const checkJobs = this.selectData.map(w => this.as.getItems({ wf_id: w.wf_id, status: '1' }));
    let hasError = false;
    await forkJoin(checkJobs)
      .toPromise()
      .then((data: any[]) => {
        if (data && data.length > 0) {
          data.forEach(d => {
            if (d && d.total && d.total > 0) {
              hasError = true;
            }
          });
        }
      });

    if (hasError) {
      this.message.warning(this.i18n.translateLang('common.message.warning.W_013'));
      return;
    }

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.selWorkflowDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.selWorkflowDelContent')}`,
      nzOnOk: () => {
        this.ws.deleteWorkflow(workflows).then(() => {
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          this.selectData = [];
          this.selectAll = false;
          this.search();
        });
      }
    });
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
