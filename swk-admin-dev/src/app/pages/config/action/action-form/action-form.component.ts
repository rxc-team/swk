import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ActionService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-action-form',
  templateUrl: './action-form.component.html',
  styleUrls: ['./action-form.component.less']
})
export class ActionFormComponent implements OnInit {
  // 遷移元判断用、デフォルトは追加モード
  status = 'add';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private i18n: I18NService,
    private message: NzMessageService,
    private as: ActionService,
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
      actionKey: ['', [Validators.required], []],
      actionNameZh: ['', [Validators.required], []],
      actionNameEn: ['', [Validators.required], []],
      actionNameJa: ['', [Validators.required], []],
      actionNameTh: ['', [Validators.required], []],
      actionObject: ['', [Validators.required]],
      actionGroup: ['', [Validators.required]]
    });
  }

  isSmall = false;

  // フォームデータ
  form: FormGroup;

  // アクショングループ
  groups = [
    { label: 'page.action.base', value: 'base' },
    { label: 'page.action.import', value: 'import' },
    { label: 'page.action.export', value: 'export' },
    { label: 'page.action.lease', value: 'lease' },
    { label: 'page.action.other', value: 'other' }
  ];

  // アクション対象
  types = [
    { label: 'page.allow.allowType.datastore', value: 'datastore' },
    { label: 'page.allow.allowType.report', value: 'report' },
    { label: 'page.allow.allowType.document', value: 'folder' },
    { label: 'page.allow.allowType.shiwake', value: 'journal' }
  ];

  /**
   * @description:初期化
   */
  ngOnInit(): void {
    const actionObject = this.route.snapshot.paramMap.get('obj');
    const actionKey = this.route.snapshot.paramMap.get('key');
    if (actionKey) {
      this.status = 'edit';
      this.getActionInfo(actionObject, actionKey);
    }
  }

  /**
   * @description: アクション詳細情報を取得する
   */
  getActionInfo(actionObject: string, actionKey: string) {
    this.as.getActionByKey(actionObject, actionKey).then(res => {
      this.form.controls.actionKey.setValue(res.action_key);
      this.form.controls.actionNameZh.setValue(res.action_name['zh_CN']);
      this.form.controls.actionNameEn.setValue(res.action_name['en_US']);
      this.form.controls.actionNameJa.setValue(res.action_name['ja_JP']);
      this.form.controls.actionNameTh.setValue(res.action_name['th_TH']);
      this.form.controls.actionObject.setValue(res.action_object);
      this.form.controls.actionGroup.setValue(res.action_group);
    });
  }

  /**
   * @description: 現在の多言語を取得する
   */
  langs() {
    return this.i18n.getLangs();
  }

  /**
   * @description: フォームコミット
   */
  submitForm = () => {
    const langMap = {
      zh_CN: this.form.controls.actionNameZh.value,
      ja_JP: this.form.controls.actionNameJa.value,
      en_US: this.form.controls.actionNameEn.value,
      th_TH: this.form.controls.actionNameTh.value
    };
    const params = {
      action_key: this.form.controls.actionKey.value,
      action_name: langMap,
      action_object: this.form.controls.actionObject.value,
      action_group: this.form.controls.actionGroup.value
    };

    const actionKey = this.route.snapshot.paramMap.get('key');
    const actionObject = this.route.snapshot.paramMap.get('obj');
    if (actionKey && actionObject) {
      this.as.updateAction(actionObject, actionKey, params).then(async () => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        this.location.back();
      });
    } else {
      this.as.addAction(params).then(async () => {
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        this.location.back();
      });
    }
  };

  /**
   * @description: フォームリセット
   */
  reset(): void {
    this.form.reset();
  }

  /**
   * @description: 操作キャンセル
   */
  cancel() {
    this.location.back();
  }
}
