/*
 * @Description: 审批一览
 * @Author: RXC 廖云江
 * @Date: 2019-09-18 14:38:36
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-09-22 15:51:16
 */
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { forkJoin } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApproveService, UserService } from '@api';
import { I18NService, SelectItem, TokenStorageService } from '@core';

@Component({
  selector: 'app-approve-list',
  templateUrl: './approve-list.component.html',
  styleUrls: ['./approve-list.component.less']
})
export class ApproveListComponent implements OnInit {
  cols = [
    {
      title: 'page.approve.status',
      width: '120px'
    },
    {
      title: 'page.approve.datastoreRecode',
      width: '180px'
    },
    {
      title: 'page.approve.oldDatastoreRecode',
      width: '180px'
    },
    {
      title: 'page.approve.applicant',
      width: '100px'
    },
    {
      title: 'page.approve.approvalStage',
      width: '180px'
    },
    {
      title: 'page.approve.finalApprover',
      width: '100px'
    },
    {
      title: 'page.approve.approvalAt'
    }
  ];

  // 加载状态
  loading = false;
  datastore = '';
  // 台账字段集
  searchFields: any[] = [];
  changeFields: any[] = [];
  updateFields: any[] = [];
  // 台账字段集
  fields: any[] = [];
  // 一览数据
  dataSet: any[] = [];
  // 一览数据
  displayDataSet: any[] = [];
  // 选中的数据
  selectData = [];
  // 是否全部选中
  selectAll = false;
  // 分页使用-当前页
  pageIndex = 1;
  // 分页使用-每页显示条数
  pageSize = 50;
  // 分页使用-总的条数
  total = 0;
  // 检索表单
  seachForm: FormGroup;

  // 检索条件
  conditionParam = {
    condition_list: [],
    condition_type: 'and',
    search_type: 'item',
    status: 1
  };

  confirmModal: NzModalRef;

  // 共通数据
  userList = [];
  userId = '';

  // 构造器
  constructor(
    private as: ApproveService,
    private router: Router,
    private tokenService: TokenStorageService,
    private route: ActivatedRoute,
    private userService: UserService,
    private message: NzMessageService,
    private i18n: I18NService,
    private modal: NzModalService
  ) {
    this.userId = this.tokenService.getUserId();
  }

  /**
   * @description: 画面初期化処理
   */
  ngOnInit(): void {
    this.init();
  }

  async init() {
    this.route.data.subscribe((data: { listData: any }) => {
      this.searchFields = data.listData.searchFields;
      this.updateFields = data.listData.changeFields;
      this.datastore = data.listData.datastore;
      this.search();
    });
  }

  /**
   * @description: 检索条件变更事件
   */
  queryChange(param) {
    this.conditionParam = param;
  }

  /**
   * @description: 数据检索取得
   */
  async search() {
    const wfId = this.route.snapshot.paramMap.get('wf_id');
    // 指定台账数据取得
    if (wfId) {
      const jobs = [
        this.userService.getUsers({ invalid: 'true' }),
        this.as.getItems(
          { wf_id: wfId },
          {
            datastore_id: this.datastore,
            condition_list: this.conditionParam.condition_list,
            condition_type: this.conditionParam.condition_type,
            search_type: this.conditionParam.search_type,
            status: this.conditionParam.status || 0,
            page_index: 1,
            page_size: 30
          }
        )
      ];

      await forkJoin(jobs)
        .toPromise()
        .then(async (data: any[]) => {
          if (data) {
            const usersData = data[0];
            const itemsData = data[1];

            if (usersData) {
              const userList: Array<SelectItem> = [];
              usersData.forEach(user => {
                userList.push({ label: user.user_name, value: user.user_id });
              });
              this.userList = userList;
            } else {
              this.userList = [];
            }
            if (itemsData) {
              const fieldList: Array<SelectItem> = [];
              if (this.searchFields) {
                this.searchFields.forEach(field => {
                  fieldList.push({ label: field.field_name, value: field.field_id });
                });
              }
              this.fields = fieldList;
              const changeFieldList: Array<SelectItem> = [];
              if (this.updateFields) {
                this.updateFields.forEach(field => {
                  changeFieldList.push({ label: field.field_name, value: field.field_id });
                });
              }
              this.changeFields = changeFieldList;
              if (itemsData.items_list) {
                // 一览数据编辑
                this.dataSet = itemsData.items_list;
                this.displayDataSet = itemsData.items_list;
                this.total = itemsData.total;
                // 数据件数合计
              } else {
                this.dataSet = [];
                this.displayDataSet = [];
                this.total = 0;
              }
            } else {
              this.dataSet = [];
              this.displayDataSet = [];
              this.total = 0;
            }
          }
        });
    }
  }

  getIndex(nodes: any[], current: string) {
    return nodes.findIndex(f => f.node_id === current);
  }

  toInfoPage(itemId: string, datastoreId: string) {
    this.router.navigate(['approve', itemId, 'info'], { queryParams: { datastoreId } });
  }

  /**
   * @description: 全选
   */
  checkAll(event: boolean) {
    this.displayDataSet.forEach(f => {
      if (f.status.applicant === this.userId && f.status.approve_status !== 1) {
        f.checked = event;
      }
    });
    this.selectData = this.displayDataSet.filter(d => d.checked === true);
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.displayDataSet.filter(d => d.checked === true);

    if (this.selectData.length === this.displayDataSet.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  disableCheck(applicant: string, status: number) {
    if (this.userId === applicant && status === 1) {
      return true;
    }
    return false;
  }

  /**
   * @description: 数据刪除
   */
  async delete() {
    const items = [];
    this.selectData.forEach(e => {
      items.push(e.example_id);
    });
    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.templateDelTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.templateDelContent')}`,
      nzOnOk: async () => {
        await this.as.deleteItems(items).then(async res => {
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          this.displayDataSet = [];
          this.selectAll = false;
          this.selectData = [];
          this.search();
        });
      }
    });
  }

  /**
   * @description: 审批日志下载
   */
  async download() {
    // 从路由获取参数
    const wfId = this.route.snapshot.paramMap.get('wf_id');
    this.as
      .logDownload(
        { wf_id: wfId },
        {
          datastore_id: this.datastore,
          condition_list: this.conditionParam.condition_list,
          condition_type: this.conditionParam.condition_type,
          search_type: this.conditionParam.search_type,
          status: this.conditionParam.status || 0,
          page_index: 1,
          page_size: 30
        }
      )
      .then((data: any) => {
        this.message.info(this.i18n.translateLang('common.message.info.I_002'));
      });
  }

  /**
   * @description: 重新初始化处理
   */
  async refresh() {
    this.seachForm.reset();
    await this.search();
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
