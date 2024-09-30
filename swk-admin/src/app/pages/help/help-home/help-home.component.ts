import { forkJoin } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HelpService, HelpTypeService } from '@api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-help-home',
  templateUrl: './help-home.component.html',
  styleUrls: ['./help-home.component.less']
})
export class HelpHomeComponent implements OnInit {
  inputValue: string;
  searchHelps = [];
  types = [];
  normalHelps = [];
  searchForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private helpService: HelpService,
    private translate: TranslateService,
    private router: Router,
    private helpTypeService: HelpTypeService
  ) {
    this.searchForm = this.fb.group({
      inputValue: [null, []]
    });

    this.translate.onLangChange.subscribe(() => {
      this.init();
    });
  }

  ngOnInit() {
    this.init();
  }

  async init() {
    await this.getTypes();
    await this.getHelpsOfType();
  }

  /* 获取需要要显示的类别列表 */
  async getTypes() {
    const jobs = [this.helpTypeService.getHelpTypes({ show: 'true' }), this.helpService.getHelps({ tag: 'normal' })];
    await forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const types = data[0];
          const normalHelps = data[1];
          if (types) {
            this.types = types;
          } else {
            this.types = [];
          }
          if (normalHelps) {
            this.normalHelps = normalHelps;
          } else {
            this.normalHelps = [];
          }
        }
      });
  }
  // 获取已显示的类别下的帮助列表
  async getHelpsOfType() {
    const jobs = this.types.map(t => {
      const params = {
        type: t.type_id
      };
      return this.helpService.getHelps(params);
    });

    await forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          data.forEach((helps: any[], index) => {
            if (helps) {
              this.types[index].helps = helps.slice(0, 3);
            } else {
              this.types[index].helps = [];
            }
          });
        }
      });
  }
  // 根据搜索框輸入值查找helps
  onInput(value: string) {
    if (value) {
      const params = {
        title: value
      };
      this.helpService.getHelps(params).then(res => {
        if (res) {
          this.searchHelps = res;
        } else {
          this.searchHelps = [];
        }
      });
    } else {
      this.searchHelps = [];
    }
  }

  stop(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
    }
  }

  goDetail(index: number) {
    if (index < this.searchHelps.length) {
      this.router.navigate([`/help/detail/${this.searchHelps[index].help_id}`]);
    }
  }
}
