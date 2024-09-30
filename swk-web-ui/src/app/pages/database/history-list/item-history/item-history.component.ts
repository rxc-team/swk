/*
 * @Author: RXC 呉見華
 * @Date: 2019-12-31 09:25:49
 * @LastEditTime: 2020-12-31 10:14:29
 * @LastEditors: Rxc 陳平
 * @Description: 履历一览
 * @FilePath: /web-ui/src/app/pages/database/item-history/item-history.component.ts
 * @
 */
import { format } from 'date-fns';
import { NgEventBus } from 'ng-event-bus';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { forkJoin } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FieldService, HistoryService, OptionService, UserService } from '@api';
import { CommonService, I18NService, SelectItem } from '@core';

import { HistoryPreviewComponent } from '../history-preview/history-preview.component';

@Component({
  selector: 'app-item-history',
  templateUrl: './item-history.component.html',
  styleUrls: ['./item-history.component.less']
})
export class ItemHistoryComponent implements OnInit {
  cols = [
    {
      title: 'page.history.historyId',
      width: '180px'
    },
    {
      title: 'page.history.fieldTitle',
      width: '120px'
    },
    {
      title: 'page.history.oldValue',
      width: '100px'
    },
    {
      title: 'page.history.newValue',
      width: '100px'
    },
    {
      title: 'page.history.typeTitle',
      width: '150px'
    },
    {
      title: 'page.history.createdAtTitle',
      width: '150px'
    },
    {
      title: 'page.history.createdByTitle'
    }
  ];

  // 履历一览
  historyList = [];
  // 台账字段
  searchFields = [];
  // 检索表单
  searchForm: FormGroup;
  // 检索条件
  // TODO Mapping download
  // conditionParam = {
  //   fieldId: '',
  //   changeType: '',
  //   formTime: '',
  //   toTime: ''
  // };
  // 当前页面index
  pageIndex = 1;
  // 当前页面展示数据条数
  pageSize = 30;
  // 总的条数
  total = 0;
  // 共通数据
  userList = [];

  constructor(
    private fb: FormBuilder,
    private historyService: HistoryService,
    private fieldService: FieldService,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private modal: NzModalService,
    private common: CommonService,
    private eventBus: NgEventBus,
    private userService: UserService,
    private optionService: OptionService,
    private i18n: I18NService
  ) {}

  async ngOnInit() {
    // 初始化检索表单
    this.searchForm = this.fb.group({
      fieldId: [null, []],
      changeType: [null, []],
      createdAt: [null, [this.timeCompare]],
      oldValue: [null, []],
      newValue: [null, []]
    });
    await this.init();
    this.search();
  }

  /**
   * @description: 初始化字段检索数据
   */
  async init() {
    // 从路由获取参数
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    // 判断路由是否获取到参数
    if (datastoreId) {
      await this.fieldService.getFields(datastoreId).then(async (data: any[]) => {
        if (data) {
          this.searchFields = data.filter(f => f.field_type !== 'function');
        } else {
          this.searchFields = [];
        }
      });
    }

    await this.userService.getUsers({ invalid: 'true' }).then((data: any[]) => {
      if (data) {
        const userList: Array<SelectItem> = [];
        data.forEach(user => {
          userList.push({ label: user.user_name, value: user.user_id });
        });
        this.userList = userList;
      } else {
        this.userList = [];
      }
    });
  }

  /**
   * @description: 检索
   * @return: 返回检索结果
   */
  async search() {
    // 从路由获取参数
    const itemId = this.route.snapshot.paramMap.get('i_id');
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    let formTime = '';
    let toTime = '';

    const dt = this.searchForm.get('createdAt').value;
    if (dt && dt.length > 0) {
      formTime = format(new Date(dt[0]), 'yyyy-MM-dd');
      toTime = format(new Date(dt[1]), 'yyyy-MM-dd');
    }
    // TODO Mapping download
    // this.conditionParam = {
    //   fieldId: this.searchForm.get('fieldId').value,
    //   changeType: this.searchForm.get('changeType').value,
    //   formTime: formTime,
    //   toTime: toTime
    // };

    // 获取所有履历数据
    this.historyService
      .getHistories({
        datastoreId: datastoreId,
        itemId: itemId ? itemId : '',
        fieldId: this.searchForm.get('fieldId').value,
        historyType: this.searchForm.get('changeType').value,
        oldValue: this.searchForm.get('oldValue').value,
        newValue: this.searchForm.get('newValue').value,
        createdFrom: formTime,
        createdTo: toTime,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      })
      .then((data: any) => {
        if (data && data.total > 0) {
          this.historyList = data.histories;
          this.total = data.total;
        } else {
          this.historyList = [];
          this.total = 0;
        }
      });
  }

  /**
   * @description:日期大小比较
   */
  timeCompare(control: AbstractControl): ValidationErrors | null {
    if (control.value && control.value.length > 0) {
      const startTime = control.value[0];
      const endTime = control.value[1];

      if (startTime >= endTime) {
        return { timeCompare: true };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  async download() {
    // 从路由获取参数
    const itemId = this.route.snapshot.paramMap.get('i_id');
    const datastoreId = this.route.snapshot.paramMap.get('d_id');

    let formTime = '';
    let toTime = '';

    const dt = this.searchForm.get('createdAt').value;
    if (dt && dt.length > 0) {
      formTime = format(new Date(dt[0]), 'yyyy-MM-dd');
      toTime = format(new Date(dt[1]), 'yyyy-MM-dd');
    }

    const jobId = `job_${format(new Date(), 'yyyyMMddHHmmssSSS')}`;

    // 获取所有履历数据
    await this.historyService
      .download({
        datastoreId: datastoreId,
        itemId: itemId ? itemId : '',
        fieldId: this.searchForm.get('fieldId').value,
        historyType: this.searchForm.get('changeType').value,
        oldValue: this.searchForm.get('oldValue').value,
        newValue: this.searchForm.get('newValue').value,
        createdFrom: formTime,
        createdTo: toTime,
        jobId: jobId
      })
      .then((data: any) => {
        this.message.info(this.i18n.translateLang('common.message.info.I_002'));
      });
  }

  openPreview(hid: string) {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    // 获取APP选项
    const modalSel = this.modal.create({
      nzTitle: this.i18n.translateLang('page.datastore.detail.history'),
      nzMaskClosable: false,
      nzWidth: 800,
      nzClosable: false,
      nzComponentParams: {
        did: datastoreId,
        hid: hid
      },
      nzContent: HistoryPreviewComponent,
      nzFooter: [
        {
          label: this.i18n.translateLang('common.button.cancel'),
          onClick: instance => {
            modalSel.close();
          }
        }
      ]
    });
  }

  isExist(id: string) {
    return this.searchFields.findIndex(f => f.field_id === id) >= 0;
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
