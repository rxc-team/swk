import * as _ from 'lodash';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { QuestionService } from '@api';

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.less']
})
export class QuestionListComponent implements OnInit {
  // 一览表头
  cols = [
    {
      title: 'page.question.title',
      width: '250px'
    },
    {
      title: 'page.question.type',
      width: '100px'
    },
    {
      title: 'page.question.place',
      width: '100px'
    },
    {
      title: 'page.question.status',
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
      title: 'page.question.questioner',
      width: '100px'
    },
    {
      title: 'page.question.answerer'
    }
  ];

  // 一览数据
  listOfDataDisplay = [];

  // 固定集合
  // 种类
  questionTypes = [
    {
      label: 'page.question.type01',
      value: 'OperationProblem'
    },
    {
      label: 'page.question.type02',
      value: 'SystemError'
    },
    {
      label: 'page.question.type03',
      value: 'Request'
    }
  ];

  // 状态
  questionStatuss = [
    {
      label: 'page.question.statusOpen',
      value: 'open'
    },
    {
      label: 'page.question.statusClose',
      value: 'closed'
    }
  ];

  // 位置
  questionAdminPositions = [
    {
      label: 'page.question.questionAdminPos01',
      value: 'admin_home'
    },
    {
      label: 'page.question.questionAdminPos02',
      value: 'admin_doc'
    },
    {
      label: 'page.question.questionAdminPos03',
      value: 'admin_group'
    },
    {
      label: 'page.question.questionAdminPos04',
      value: 'admin_option'
    },
    {
      label: 'page.question.questionAdminPos05',
      value: 'admin_lang'
    },
    {
      label: 'page.question.questionAdminPos06',
      value: 'admin_role'
    },
    {
      label: 'page.question.questionAdminPos07',
      value: 'admin_user'
    },
    {
      label: 'page.question.questionAdminPos08',
      value: 'admin_datastore'
    },
    {
      label: 'page.question.questionAdminPos09',
      value: 'admin_report'
    },
    {
      label: 'page.question.questionAdminPos10',
      value: 'admin_dashboard'
    }
  ];
  questionWebPositions = [
    {
      label: 'page.question.questionWedPos01',
      value: 'web_home'
    },
    {
      label: 'page.question.questionWedPos02',
      value: 'web_doc'
    },
    {
      label: 'page.question.questionWedPos03',
      value: 'web_datastore'
    },
    {
      label: 'page.question.questionWedPos04',
      value: 'web_report'
    }
  ];

  loading = false;
  seachForm: FormGroup;

  selectData = [];
  selectAll = false;

  constructor(private fb: FormBuilder, private router: Router, private questionService: QuestionService) {
    this.seachForm = this.fb.group({
      questionTitle: ['', []],
      questionType: ['', []],
      questionPos: ['', []],
      questionStatus: ['', []]
    });
  }

  /**
   * @description: 画面初期化処理
   */
  ngOnInit() {
    // 问题一览数据取得
    this.search();
  }

  /**
   * @description: 问题一览数据取得
   */
  search() {
    this.loading = true;
    // 参数编辑
    const qTitle = this.seachForm.controls.questionTitle.value;
    const qType = this.seachForm.controls.questionType.value;
    const qPos = this.seachForm.controls.questionPos.value;
    const qStatus = this.seachForm.controls.questionStatus.value;
    const params = {
      title: qTitle,
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
   * @description: 跳转到APP添加页面
   */
  foward() {
    this.router.navigate([`/question/add`]);
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
  goToDetail(questionId: string) {
    const editUrl = `/question/edit/${questionId}`;
    this.router.navigate([editUrl]);
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
   * @description: 取得问题发生机能位置名称
   */
  getFuncName(funcValue: string): string {
    const ap = this.questionAdminPositions.filter(f => f.value === funcValue)[0];
    if (ap) {
      return ap.label;
    }
    const wp = this.questionWebPositions.filter(f => f.value === funcValue)[0];
    if (wp) {
      return wp.label;
    }
    return funcValue;
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
   * @description: 重新初始化处理
   */
  async refresh() {
    this.seachForm.reset();
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
