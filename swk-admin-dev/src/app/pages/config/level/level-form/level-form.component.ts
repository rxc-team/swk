import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AllowService, LevelService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-level-form',
  templateUrl: './level-form.component.html',
  styleUrls: ['./level-form.component.less']
})
export class LevelFormComponent implements OnInit {
  // 判断迁移元用，默认是添加
  status = 'add';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private i18n: I18NService,
    private message: NzMessageService,
    private ls: LevelService,
    private as: AllowService,
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
      levelName: ['', [Validators.required], []],
      allows: [[], []]
    });
  }

  isSmall = false;
  allowList = [];
  // 表单数据
  form: FormGroup;

  async ngOnInit(): Promise<void> {
    await this.as.getAllows({}).then((data: any) => {
      if (data) {
        this.allowList = data;
      } else {
        this.allowList = [];
      }
    });

    const levelId = this.route.snapshot.paramMap.get('id');
    if (levelId) {
      this.status = 'edit';
      this.getLevelInfo(levelId);
    }
  }

  /**
   * @description: 类型情报取得
   */
  getLevelInfo(levelId: string) {
    this.ls.getLevelById(levelId).then(res => {
      this.form.controls.levelName.setValue(res.level_name);
      this.form.controls.allows.setValue(res.allows);
    });
  }

  /**
   * @description: 获取当前语言列表
   */
  langs() {
    return this.i18n.getLangs();
  }

  submitForm = () => {
    const params = {
      level_name: this.form.controls.levelName.value,
      allows: this.form.controls.allows.value
    };

    const levelId = this.route.snapshot.paramMap.get('id');
    if (levelId) {
      this.ls.updateLevel(levelId, params).then(async () => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        this.location.back();
      });
    } else {
      this.ls.addLevel(params).then(async () => {
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

  /**
   * @description: 类别名称唯一性检查
   */
  levelNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      this.ls.getLevels().then((levels: any[]) => {
        const levelId = this.route.snapshot.paramMap.get('id');
        if (levelId) {
          if (levels) {
            if (levels.filter(a => a.level_name === control.value && a.level_id !== levelId).length > 0) {
              observer.next({ error: true, duplicated: true });
            } else {
              observer.next(null);
            }
          } else {
            observer.next(null);
          }
        } else {
          if (levels) {
            if (levels.filter(a => a.level_name === control.value).length > 0) {
              observer.next({ error: true, duplicated: true });
            } else {
              observer.next(null);
            }
          } else {
            observer.next(null);
          }
        }
        observer.complete();
      });
    });

  /**
   * @description: 类别名称唯一性检查
   */
  levelIdAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const levelId = this.route.snapshot.paramMap.get('id');
      if (levelId === control.value) {
        observer.next(null);
      } else {
        this.ls.getLevelById(control.value).then(data => {
          if (data) {
            observer.next({ error: true, duplicated: true });
          } else {
            observer.next(null);
          }
        });
      }
      observer.complete();
    });
}
