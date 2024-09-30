import { NzMessageService } from 'ng-zorro-antd/message';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { forkJoin } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  DatabaseService, DatastoreService, ItemService, JournalService, SubjectService
} from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-subject-list',
  templateUrl: './subject-list.component.html',
  styleUrls: ['./subject-list.component.less']
})
export class SubjectListComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private ds: DatastoreService,
    private db: DatabaseService,
    private subs: SubjectService,
    private js: JournalService,
    private message: NzMessageService,
    private i18n: I18NService
  ) {
    this.seachForm = fb.group({
      manageFlag: ['common', []],
      assetsType: ['', []]
    });
  }

  cols = [
    {
      title: 'common.text.no',
      width: '40px'
    },
    {
      title: 'page.subject.key',
      width: '120px'
    },
    {
      title: 'page.subject.defaultName',
      width: '120px'
    },
    {
      title: 'page.subject.name'
    }
  ];

  seachForm: FormGroup;

  subjects = [];
  assets = [];

  status = false;

  ngOnInit(): void {
    this.search();

    this.searchAssetsData();
  }

  async search() {
    const flag = this.seachForm.get('manageFlag').value;
    if (flag === 'common') {
      this.subs.getSubjects().then((data: any[]) => {
        console.log(data);
        if (data) {
          this.subjects = data;
        } else {
          this.subjects = [];
        }
      });
    } else {
      const assetsType = this.seachForm.get('assetsType').value;
      if (assetsType) {
        await this.subs.getSubjects(assetsType).then((data: any[]) => {
          if (data) {
            this.subjects = data;
          } else {
            this.subjects = [];
          }
        });
        // 当前资源没有设置资产分类的时候，显示共通值
        if (this.subjects.length === 0) {
          this.subs.getSubjects().then((data: any[]) => {
            if (data) {
              this.subjects = data;
            } else {
              this.subjects = [];
            }
          });
        }
      } else {
        this.subjects = [];
      }
    }
  }

  async searchAssetsData() {
    let datastoreId = '';
    await this.ds.getDatastoreByKey('assets').then((data: any) => {
      if (data) {
        datastoreId = data.datastore_id;
      } else {
        datastoreId = '';
      }
    });

    if (!datastoreId) {
      return;
    }

    const sorts = [
      {
        sort_key: 'assets_class_id',
        sort_value: 'ascend'
      }
    ];

    const params = {
      condition_list: [],
      condition_type: 'and',
      sorts: sorts
    };

    let items = [];

    await this.db.getItems(datastoreId, params).then((data: any) => {
      if (data && data.total > 0 && data.items_list) {
        items = data.items_list;
      } else {
        items = [];
      }
    });

    if (items && items.length > 0) {
      items.forEach((it: any) => {
        const itemMap = it.items;
        this.assets.push({
          label: itemMap.assets_class_name.value,
          value: itemMap.assets_class_id.value
        });
      });
    }
  }

  startEdit() {
    this.status = true;
  }

  stopEdit() {
    this.status = false;
  }

  async save() {
    this.stopEdit();

    const flag = this.seachForm.get('manageFlag').value;
    if (flag === 'common') {
      const jobs = this.subjects.map(v => {
        const param = {
          pattern_id: v.pattern_id,
          subject_key: v.subject_key,
          subject_name: v.subject_name
        };
        return this.js.updateJournal(v.journal_id, param);
      });

      forkJoin(jobs)
        .toPromise()
        .then((data: any[]) => {
          if (data) {
            this.message.success(this.i18n.translateLang('common.message.success.S_002'));
          }
        });
    } else {
      const assetsType = this.seachForm.get('assetsType').value;
      const jobs = this.subjects.map(v => {
        const param = {
          assets_type: assetsType,
          default_name: v.default_name,
          subject_name: v.subject_name
        };
        return this.subs.updateSubject(v.subject_key, param);
      });

      forkJoin(jobs)
        .toPromise()
        .then((data: any[]) => {
          if (data) {
            this.message.success(this.i18n.translateLang('common.message.success.S_002'));
          }
        });
    }
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }
}
