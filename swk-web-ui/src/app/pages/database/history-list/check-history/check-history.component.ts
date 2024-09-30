import { format } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CheckHistoryService, UserService } from '@api';
import { I18NService, SelectItem } from '@core';

@Component({
  selector: 'app-check-history',
  templateUrl: './check-history.component.html',
  styleUrls: ['./check-history.component.less']
})
export class CheckHistoryComponent implements OnInit {
  constructor(
    private us: UserService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private i18n: I18NService,
    private message: NzMessageService,
    private cs: CheckHistoryService
  ) {}

  cols = [
    {
      title: 'common.text.checkWay',
      width: '80px'
    },
    {
      title: 'common.text.checkStartDate',
      width: '120px'
    },
    {
      title: 'common.text.checkTime',
      width: '150px'
    },
    {
      title: 'common.text.checkBy'
    }
  ];

  // 盘点类型集合
  checkTypes = [
    {
      label: 'common.text.visuallycheck',
      value: 'Visual'
    },
    {
      label: 'common.text.imagecheck',
      value: 'Image'
    },
    {
      label: 'common.text.barcodecheck',
      value: 'Scan'
    }
  ];

  userList = [];
  historyList = [];
  dataSet = [];
  headerList = [];
  displayFields = [];
  pageSize = 10;
  pageIndex = 1;
  total = 0;
  tableWidth = 0;

  searchForm: FormGroup;

  ngOnInit(): void {
    // 初始化检索表单
    this.searchForm = this.fb.group({
      checkType: [null, []],
      checkStartDate: [null, []],
      checkedBy: [null, []],
      checkedAt: [null, [this.timeCompare]]
    });
    this.us.getUsers({ invalid: 'true' }).then((data: any[]) => {
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

    this.search();
  }

  async search() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const itemId = this.route.snapshot.paramMap.get('i_id');

    const checkType = this.searchForm.get('checkType').value;
    const checkStartDate = this.searchForm.get('checkStartDate').value;
    const checkedAt = this.searchForm.get('checkedAt').value;
    const checkedBy = this.searchForm.get('checkedBy').value;

    let checkedAtFrom = '';
    let checkedAtTo = '';

    if (checkedAt) {
      checkedAtFrom = format(new Date(checkedAt[0]), 'yyyy-MM-dd');
      checkedAtTo = format(new Date(checkedAt[1]), 'yyyy-MM-dd');
    }

    const params = {
      datastoreId: datastoreId,
      itemId: itemId || '',
      checkType: checkType || '',
      checkStartDate: checkStartDate || '',
      checkedAtFrom: checkedAtFrom,
      checkedAtTo: checkedAtTo,
      checkedBy: checkedBy,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize
    };
    await this.cs.getHistories(params).then((data: any) => {
      if (data) {
        this.historyList = data.histories || [];
        this.total = data.total;
        this.displayFields = data.fields;
      } else {
        this.historyList = [];
        this.total = 0;
        this.displayFields = [];
      }
    });

    this.generateTableData();
  }

  /**
   * @description: 生成table数据
   */
  generateTableData() {
    this.dataSet = [];
    this.headerList = [];
    this.tableWidth = 60;

    this.displayFields.forEach(fl => {
      if (fl.field_type !== 'file') {
        this.headerList.push(`${this.i18n.translateLang(fl.field_name)}`);
      }
      this.tableWidth += fl.width;
    });

    this.historyList.forEach((dt, index) => {
      const row: any[] = [];

      this.displayFields.forEach(fl => {
        let isAdd = false;
        // tslint:disable-next-line: forin
        for (const key in dt.items) {
          if (fl.field_id === key) {
            let value;
            switch (fl.field_type) {
              case 'text':
              case 'textarea':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'number':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'function':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'autonum':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'date':
              case 'datetime':
                if (dt.items[key]) {
                  const v = dt.items[key].value === '0001-01-01' ? '' : dt.items[key].value;
                  value = {
                    data_type: fl.field_type,
                    value: v
                  };
                }
                break;
              case 'time':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'user':
                if (dt.items[key]) {
                  const v: string = dt.items[key].value;
                  value = {
                    data_type: dt.items[key].data_type,
                    value: JSON.parse(v.slice(0, v.length))
                  };
                }
                break;
              case 'file':
                if (dt.items[key]) {
                  const v: string = dt.items[key].value;
                  value = {
                    data_type: dt.items[key].data_type,
                    value: JSON.parse(v.slice(0, v.length))
                  };
                }
                break;
              case 'switch':
                if (dt.items[key] !== '') {
                  value = dt.items[key];
                }
                break;
              case 'options':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              case 'lookup':
                if (dt.items[key]) {
                  value = dt.items[key];
                }
                break;
              default:
                value = dt.items[key];
                break;
            }
            row.push(value);

            isAdd = true;
          }
        }
        if (!isAdd) {
          row.push(``);
        }
      });

      const it = {
        items: row,
        checkType: dt.check_type,
        checkStartDate: dt.check_start_date,
        checkedAt: dt.checked_at,
        checkedBy: dt.checked_by
      };

      this.dataSet = [...this.dataSet, it];
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

  showTypeName(v: string) {
    return this.checkTypes.find(c => c.value === v).label;
  }

  download() {
    const datastoreId = this.route.snapshot.paramMap.get('d_id');
    const itemId = this.route.snapshot.paramMap.get('i_id');

    const checkType = this.searchForm.get('checkType').value;
    const checkStartDate = this.searchForm.get('checkStartDate').value;
    const checkedAt = this.searchForm.get('checkedAt').value;
    const checkedBy = this.searchForm.get('checkedBy').value;

    let checkedAtFrom = '';
    let checkedAtTo = '';

    if (checkedAt) {
      checkedAtFrom = format(new Date(checkedAt[0]), 'yyyy-MM-dd');
      checkedAtTo = format(new Date(checkedAt[1]), 'yyyy-MM-dd');
    }

    const jobId = `job_${format(new Date(), 'yyyyMMddHHmmssSSS')}`;

    const params = {
      datastoreId: datastoreId,
      itemId: itemId || '',
      checkType: checkType || '',
      checkStartDate: checkStartDate || '',
      checkedAtFrom: checkedAtFrom,
      checkedAtTo: checkedAtTo,
      checkedBy: checkedBy,
      jobId: jobId
    };
    this.cs.download(params).then((data: any) => {
      if (data) {
        this.message.info(this.i18n.translateLang('common.message.info.I_002'));
      }
    });
  }
}
