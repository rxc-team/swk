import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, OnInit } from '@angular/core';
import { JournalService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-journal-list',
  templateUrl: './journal-list.component.html',
  styleUrls: ['./journal-list.component.less']
})
export class JournalListComponent implements OnInit {
  constructor(private js: JournalService, private message: NzMessageService, private i18n: I18NService, private modal: NzModalService) {}

  cols = [
    {
      title: 'common.text.no',
      width: '40px'
    },
    {
      title: 'page.journal.type',
      width: '120px'
    },
    {
      title: 'page.journal.debt',
      width: '20%'
    },
    {
      title: 'page.journal.credit',
      width: '30%'
    },
    {
      title: 'page.journal.amount',
      width: '50%'
    }
  ];

  journals = [];

  confirmModal: NzModalRef;

  ngOnInit(): void {
    this.js.getJournals().then((data: any[]) => {
      console.log(data);
      if (data) {
        this.journals = this.buildData(data);
      } else {
        this.journals = [];
      }
    });
  }

  buildData(data: any[]) {
    const dataList = [];
    let line = 1;
    data.forEach((journal, i) => {
      const patterns: any[] = journal.patterns;
      patterns.forEach((pattern, j) => {
        const subjects: any[] = pattern.subjects;
        dataList.push({
          no: line,
          name: pattern.pattern_name,
          debt: '',
          credit: '',
          amount: '',
          other: ''
        });
        subjects.forEach((subject, k) => {
          dataList.push({
            no: '',
            name: `${line}-${k + 1}`,
            debt: subject.lending_division === '2' ? subject.default_name : '',
            credit: subject.lending_division === '1' ? subject.default_name : '',
            amount: subject.amount_name,
            other: ''
          });
        });
        line++;
      });
    });
    return dataList;
  }

  compute(section?: string) {
    let confirmTitle = this.i18n.translateLang('common.message.confirm.journalTitle');
    let confirmContent = this.i18n.translateLang('common.message.confirm.journalContent');
    if (section === 'repay') {
      confirmTitle = this.i18n.translateLang('common.message.confirm.repayJournalTitle');
      confirmContent = this.i18n.translateLang('common.message.confirm.repayJournalContent');
    }
    if (section === 'pay') {
      confirmTitle = this.i18n.translateLang('common.message.confirm.payJournalTitle');
      confirmContent = this.i18n.translateLang('common.message.confirm.payJournalContent');
    }

    this.confirmModal = this.modal.confirm({
      nzTitle: confirmTitle,
      nzContent: confirmContent,
      nzOnOk: () =>
        this.js.computeJournal(section).then(data => {
          this.message.success(this.i18n.translateLang('common.message.success.S_013'));
        })
    });
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
