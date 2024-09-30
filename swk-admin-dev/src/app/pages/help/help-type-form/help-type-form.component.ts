import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { NfValidators } from '@shared';

import { HelpTypeService } from '../../../api/help-type.service';
import { FileService } from '@api';

@Component({
  selector: 'app-help-type-form',
  templateUrl: './help-type-form.component.html',
  styleUrls: ['./help-type-form.component.less']
})
export class HelpTypeFormComponent implements OnInit {
  fileList = [];
  icon = '';

  langList = this.langs();

  // 判断迁移元用，默认是添加
  status = 'add';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private i18n: I18NService,
    private message: NzMessageService,
    private helpTypeService: HelpTypeService,
    private event: NgEventBus,
    private location: Location,
    private bs: NzBreakpointService,
    private file: FileService
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
    this.typeForm = this.fb.group({
      typeName: ['', [Validators.required], [this.typeNameAsyncValidator]],
      icon: [null, []],
      show: ['', []],
      langCD: [this.langList[0].code, [Validators.required]]
    });
  }

  isSmall = false;
  // 表单数据
  typeForm: FormGroup;
  initicon = '';
  save = false;

  ngOnInit(): void {
    const typeID = this.route.snapshot.paramMap.get('id');
    if (typeID) {
      this.status = 'edit';
      this.getTypeInfo(typeID);
    }
  }

  /**
   * @description: 类型情报取得
   */
  getTypeInfo(typeID: string) {
    this.helpTypeService.getTypeByID(typeID).then(res => {
      this.typeForm.controls.typeName.setValue(res.type_name);
      if (res.show === 'true') {
        this.typeForm.controls.show.setValue(true);
      } else {
        this.typeForm.controls.show.setValue(false);
      }
      this.typeForm.controls.langCD.setValue(res.lang_cd);
      this.icon = res.icon;
      this.initicon = res.icon;
    });
  }

  /**
   * @description: 获取当前语言列表
   */
  langs() {
    return this.i18n.getLangs();
  }

  submitForm = () => {
    // tslint:disable-next-line: forin
    for (const i in this.typeForm.controls) {
      this.typeForm.controls[i].markAsDirty();
      this.typeForm.controls[i].updateValueAndValidity();
    }

    let show = 'false';
    if (this.typeForm.controls.show.value) {
      show = 'true';
    }

    const params = {
      type_name: this.typeForm.controls.typeName.value,
      show: show,
      icon: this.icon,
      lang_cd: this.typeForm.controls.langCD.value
    };

    this.save = true;
    const typeID = this.route.snapshot.paramMap.get('id');
    if (typeID) {
      this.helpTypeService.updateType(typeID, params).then(async () => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
        this.event.cast('helpType:refresh');
        this.location.back();
      });
    } else {
      this.helpTypeService.creatType(params).then(async () => {
        this.message.success(this.i18n.translateLang('common.message.success.S_001'));
        this.event.cast('helpType:refresh');
        this.location.back();
      });
    }
  };

  reset(): void {
    this.typeForm.reset();
    this.icon = '';
  }

  cancel() {
    this.location.back();
  }

  /**
   * @description: 上传文件
   */
  handleChange({ file, fileList }): void {
    const status = file.status;
    if (status !== 'uploading') {
    }
    // 文件上传成功后设置url
    if (status === 'done') {
      const url = file.response.url;
      // 新LOGO文件上传成功后删除变更前的LOGO文件(数据尚未更新保留初始化时的LOGO文件信息)
      if (this.icon && this.icon !== this.initicon) {
        this.file.deletePublicHeaderFile(this.icon);
      }
      this.icon = url;
      fileList = [];
      this.fileList = [];
      this.message.success(this.i18n.translateLang('common.message.success.S_006'));
    } else if (status === 'error') {
      this.message.error(this.i18n.translateLang('common.message.error.E_006'));
    }
  }
  /**
   * @description: 类别名称唯一性检查
   */
  typeNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      const typeID = this.route.snapshot.paramMap.get('id');
      this.helpTypeService.typeNameAsyncValidator(typeID, control.value).then((type: boolean) => {
        if (!type) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }

        observer.complete();
      });
    });
}
