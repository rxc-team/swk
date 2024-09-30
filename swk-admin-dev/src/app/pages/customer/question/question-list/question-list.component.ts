import * as _ from 'lodash';
import { NgEventBus } from 'ng-event-bus';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService, QuestionService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.less']
})
export class QuestionListComponent implements OnInit {
  cols = [
    {
      title: 'page.customer.qa.title',
      width: '250px'
    },
    {
      title: 'page.customer.qa.customerName',
      width: '150px'
    },
    {
      title: 'page.customer.qa.type',
      width: '100px'
    },
    {
      title: 'page.customer.qa.place',
      width: '100px'
    },
    {
      title: 'page.customer.qa.status',
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
      title: 'page.customer.qa.questioner',
      width: '100px'
    },
    {
      title: 'page.customer.qa.answerer'
    }
  ];

  // 顾客下拉菜单数据
  customerSelectData = [];
  // 一览数据
  listOfDataDisplay = [];

  // 固定集合
  // 种类
  questionTypes = [
    {
      label: 'page.customer.qa.type01',
      value: 'OperationProblem'
    },
    {
      label: 'page.customer.qa.type02',
      value: 'SystemError'
    },
    {
      label: 'page.customer.qa.type03',
      value: 'Request'
    }
  ];

  // 状态
  questionStatuss = [
    {
      label: 'page.customer.qa.statusOpen',
      value: 'open'
    },
    {
      label: 'page.customer.qa.statusClose',
      value: 'closed'
    }
  ];

  selectData = [];
  loading = false;
  seachForm: FormGroup;
  selectAll = false;
  confirmModal: NzModalRef;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private customer: CustomerService,
    private questionService: QuestionService,
    private modal: NzModalService,
    private i18n: I18NService,
    private event: NgEventBus,
    private message: NzMessageService
  ) {
    this.event.on('question:refresh').subscribe(() => {
      this.search();
    });
    this.seachForm = this.fb.group({
      questionTitle: ['', []],
      domain: ['', []],
      questionType: ['', []],
      questionPos: ['', []],
      questionStatus: ['', []]
    });
  }

  /**
   * @description: 画面初期化処理
   */
  ngOnInit() {
    // 取得顾客下拉菜单数据
    this.getCustomerSelectData();
    // 问题一览数据取得
    this.search();
  }

  /**
   * @description: 取得顾客下拉菜单数据
   */
  getCustomerSelectData() {
    this.customer.getCustomers().then((data: any[]) => {
      if (data) {
        this.customerSelectData = data;
      } else {
        this.customerSelectData = [];
      }
    });
  }

  /**
   * @description: 问题一览数据取得
   */
  search() {
    this.loading = true;
    // 参数编辑
    const qTitle = this.seachForm.controls.questionTitle.value;
    const domain = this.seachForm.controls.domain.value;
    const qType = this.seachForm.controls.questionType.value;
    const qPos = this.seachForm.controls.questionPos.value;
    const qStatus = this.seachForm.controls.questionStatus.value;
    const params = {
      title: qTitle,
      domain: domain,
      type: qType,
      function: qPos,
      status: qStatus
    };
    // 数据取得
    this.questionService
      .getQuestions(params)
      .then((data: any) => {
        if (data) {
          this.listOfDataDisplay = data;
        } else {
          this.listOfDataDisplay = [];
        }
      })
      .finally(() => {
        this.loading = false;
      });
    this.selectData = [];
  }

  /**
   * @description: 全选
   */
  checkAll(event: boolean) {
    this.listOfDataDisplay.forEach(f => (f.checked = event));
    this.selectData = this.listOfDataDisplay.filter(d => d.checked === true);
  }

  /**
   * @description: 选中一项
   */
  checked() {
    this.selectData = this.listOfDataDisplay.filter(d => d.checked === true);
    if (this.selectData.length === this.listOfDataDisplay.length) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  /**
   * @description: 跳转到问题详细页面
   */
  goToDetail(domain: string, questionId: string) {
    const cs = this.customerSelectData.find(c => c.domain === domain);
    if (cs) {
      const url = `/customer/${cs.customer_id}/question/edit/${questionId}`;
      this.router.navigate([url]);
    }
  }

  /**
   * @description: 取得问题状态名称
   */
  getStatusName(statusValue: string): string {
    const st = this.questionStatuss.filter(s => s.value === statusValue)[0];
    if (st) {
      return st.label;
    }
    return statusValue;
  }

  /**
   * @description: 取得种类名称
   */
  getTypeName(typeValue: string): string {
    const ty = this.questionTypes.filter(t => t.value === typeValue)[0];
    if (ty) {
      return ty.label;
    }
    return typeValue;
  }

  /**
   * @description: 取得公司名称
   */
  getCustomerName(domain: string): string {
    const cus = this.customerSelectData.filter(customer => customer.domain === domain)[0];
    if (cus) {
      return cus.customer_name;
    }
    return domain;
  }

  /**
   * @description: 彻底删除选择中问题
   */
  hardDeleteAll(): void {
    const params = [];
    this.selectData.forEach(q => {
      params.push(q.question_id);
    });

    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.deleteTitle')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.deleteContent')}`,
      nzOnOk: () =>
        this.questionService.deleteSelectQuestions(params).then(async res => {
          this.selectAll = false;
          this.message.success(this.i18n.translateLang('common.message.success.S_003'));
          this.search();
        })
    });
  }

  /**
   * @description: 重新初始化处理
   */
  async refresh() {
    this.seachForm.reset();
    // 取得顾客下拉菜单数据
    this.getCustomerSelectData();
    // 问题一览数据取得
    this.search();
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
