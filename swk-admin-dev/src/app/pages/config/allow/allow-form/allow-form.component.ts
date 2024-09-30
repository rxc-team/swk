import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ActionService, AllowService } from '@api';
import { I18NService, TokenStorageService } from '@core';

@Component({
  selector: 'app-allow-form',
  templateUrl: './allow-form.component.html',
  styleUrls: ['./allow-form.component.less']
})
export class AllowFormComponent implements OnInit {
  // 判断迁移元用，默认是添加
  status = 'add';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private i18n: I18NService,
    private message: NzMessageService,
    private tokenService: TokenStorageService,
    private as: ActionService,
    private als: AllowService,
    private location: Location,
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
    this.form = this.fb.group({
      allowName: ['', [Validators.required], []],
      allowType: ['', [Validators.required]],
      objectType: ['', [Validators.required]],
      actionList: [[], [Validators.required]]
    });
  }

  isSmall = false;
  lang = 'ja-JP';
  actions = [];
  objectList = [];
  actionList = [];

  // 表单数据
  form: FormGroup;

  objTypes = [
    { label: 'page.allow.objectType.datastore', value: 'base', base: 'datastore' },
    { label: 'page.allow.objectType.checkDatastore', value: 'check', base: 'datastore' },
    { label: 'page.allow.objectType.leaseDatastore', value: 'lease', base: 'datastore' },
    { label: 'page.allow.objectType.leaseRelationDatastore', value: 'lease_relation', base: 'datastore' },
    { label: 'page.allow.objectType.shiwakeDatastore', value: 'journal', base: 'datastore' },
    { label: 'page.allow.objectType.report', value: 'report', base: 'report' },
    { label: 'page.allow.objectType.document', value: 'folder', base: 'folder' },
    { label: 'page.allow.objectType.shiwake', value: 'journal', base: 'journal' }
  ];

  types = [
    { label: 'page.allow.allowType.datastore', value: 'datastore' },
    { label: 'page.allow.allowType.report', value: 'report' },
    { label: 'page.allow.allowType.document', value: 'folder' },
    { label: 'page.allow.allowType.shiwake', value: 'journal' }
  ];

  async ngOnInit() {
    await this.getActions();

    this.i18n.change$.subscribe(() => {
      this.lang = this.i18n.currentLang;
    });

    const allowId = this.route.snapshot.paramMap.get('a_id');
    if (allowId) {
      this.status = 'edit';
      this.getAllowInfo(allowId);
    }
  }

  allowTypeChange(type: string) {
    this.objectList = this.objTypes.filter(o => o.base === type);
    this.actionList = this.actions.filter(o => o.action_object === type);
  }

  /**
   * @description: 操作情报取得
   */
  async getActions() {
    await this.as.getActions({}).then(data => {
      if (data) {
        this.actions = data;
      } else {
        this.actions = [];
      }
    });
  }

  /**
   * @description: 许可情报取得
   */
  getAllowInfo(allowId: string) {
    this.als.getAllowById(allowId).then(data => {
      if (data) {
        this.form.controls.allowName.setValue(data.allow_name);
        this.form.controls.allowType.setValue(data.allow_type);
        this.form.controls.objectType.setValue(data.object_type);
        const actList = data.actions.map(a => a.api_key);
        this.actionList = this.actions.filter(o => o.action_object === data.allow_type);
        this.form.controls.actionList.setValue(actList);
      }
    });
  }

  submitForm = () => {
    const actions: string[] = this.form.controls.actionList.value;
    const actList = [];
    actions.forEach(element => {
      const act = this.actions.find(a => a.action_key === element);
      actList.push({
        api_key: act.action_key,
        group_key: act.action_group,
        action_name: act.action_name.ja_JP
      });
    });

    const params = {
      allow_name: this.form.controls.allowName.value,
      allow_type: this.form.controls.allowType.value,
      object_type: this.form.controls.objectType.value,
      actions: actList
    };

    const id = this.route.snapshot.paramMap.get('a_id');
    if (id) {
      this.als.updateAllow(id, params).then(async () => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        this.location.back();
      });
    } else {
      this.als.addAllow(params).then(async () => {
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        this.location.back();
      });
    }
  };

  reset(): void {
    this.form.reset();
  }

  cancel() {
    this.location.back();
  }
}
