import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { Observable, Observer } from 'rxjs';

import { Location } from '@angular/common';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FileService, QuestionService } from '@api';
import { FileUtilService, I18NService, TokenStorageService } from '@core';

@Component({
  selector: 'app-question-add',
  templateUrl: './question-add.component.html',
  styleUrls: ['./question-add.component.less']
})
export class QuestionAddComponent implements OnInit {
  // 固定集合-种类
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
  // 固定集合-位置
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

  // 表单
  validateForm: FormGroup;

  // 上传图片用
  supportFile = [];
  questionPics: string[] = [];
  fileList: NzUploadFile[] = [];
  // 上传图片预览用
  previewImage: string | undefined = '';
  previewVisible = false;

  // 提问者
  qName = '';
  //是否保存上传图片
  save = false;

  // 构造
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private i18n: I18NService,
    private message: NzMessageService,
    private location: Location,
    private http: HttpClient,
    private tokenService: TokenStorageService,
    private fileUtil: FileUtilService,
    private file: FileService
  ) {
    this.validateForm = this.fb.group({
      type: [null, [Validators.required]],
      position: [null, [Validators.required]],
      title: [null, [Validators.required], [this.titleNameAsyncValidator]],
      content: [null, [Validators.required]]
    });
    this.supportFile = this.fileUtil.getSupportTypes(true);
  }

  /**
   * @description: 初期化処理
   */
  async ngOnInit(): Promise<void> {
    this.qName = this.tokenService.getUserName();
  }

  /**
   * @description: 表单提交
   */
  async submitForm() {
    // tslint:disable-next-line:forin
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }

    // 图片信息编辑
    this.questionPics = [];
    this.fileList.forEach(file => {
      const status = file.status;
      if (status === 'done') {
        this.questionPics.push(file.response.url);
      }
    });

    // 参数编辑
    const params = {
      title: this.validateForm.controls.title.value,
      type: this.validateForm.controls.type.value,
      function: this.validateForm.controls.position.value,
      images: this.questionPics,
      content: this.validateForm.controls.content.value,
      questioner_name: this.qName
    };

    // 添加问题
    this.questionService.creatQuestion(params).then(async () => {
      this.message.success(this.i18n.translateLang('common.message.success.S_001'));
      this.cancel();
    });
    // 当用户提交时，将上传的文件修改为保存状态
    this.save = true;
    this.location.back();
  }

  /**
   * @description: 点击图片预览
   */
  handlePreview = (file: NzUploadFile) => {
    this.previewImage = file.url || file.thumbUrl;
    this.previewVisible = true;
  };

  /**
   * @description: 上传文件
   */
  handleChange({ file, fileList }): void {
    const status = file.status;
    if (status !== 'uploading') {
    }
    // 文件上传成功
    if (status === 'done') {
      fileList = [];
      this.message.success(this.i18n.translateLang('common.message.success.S_006'));
    } else if (status === 'error') {
      this.message.error(this.i18n.translateLang('common.message.error.E_006'));
    }
    // 删除画面上 被删除的文件 对应的minio中的文件
    if (status === 'removed') {
      this.file.deletePublicHeaderFile(file.response.url);
    }
  }

  // 图片上传前检查
  beforeUploadPic = (file: NzUploadFile, fileList: NzUploadFile[]): boolean => {
    // 上传文件类型限制
    const isSupportFileType = this.fileUtil.checkSupport(file.type, true);
    if (!isSupportFileType) {
      this.message.error(this.i18n.translateLang('common.validator.uploadFileType'));
      return false;
    }
    // 上传文件大小限制
    const isLt5M = this.fileUtil.checkSize(file.size);
    if (!isLt5M) {
      this.message.error(this.i18n.translateLang('common.validator.uploadFileSize'));
      return false;
    }
    return true;
  };

  // 自定义上传
  customReq = (item: NzUploadXHRArgs) => {
    // 构建一个 FormData 对象，用于存储文件或其他参数
    const formData = new FormData();
    // tslint:disable-next-line:no-any
    formData.append('file', item.file as any);
    // tslint:disable-next-line: no-non-null-assertion
    const req = new HttpRequest('POST', item.action!, formData, {
      headers: new HttpHeaders({
        token: 'true'
      }),
      reportProgress: true,
      withCredentials: true
    });
    // 始终返回一个 `Subscription` 对象，nz-upload 会在适当时机自动取消订阅
    return this.http.request(req).subscribe(
      (event: HttpEvent<{}>) => {
        if (event.type === HttpEventType.UploadProgress) {
          // tslint:disable-next-line: no-non-null-assertion
          if (event.total! > 0) {
            // tslint:disable-next-line:no-non-null-assertion
            (event as any).percent = (event.loaded / event.total!) * 100;
          }
          // 处理上传进度条，必须指定 `percent` 属性来表示进度
          // tslint:disable-next-line: no-non-null-assertion
          item.onProgress!(event, item.file!);
        } else if (event instanceof HttpResponse) {
          // 处理成功
          // tslint:disable-next-line: no-non-null-assertion
          item.onSuccess!(event.body, item.file!, event);
        }
      },
      err => {
        // 处理失败
        // tslint:disable-next-line: no-non-null-assertion
        item.onError!(err, item.file!);
      }
    );
  };

  /**
   * @description: 问题标题唯一性检查
   */
  titleNameAsyncValidator = (control: FormControl) =>
    new Observable((observer: Observer<ValidationErrors | null>) => {
      this.questionService.titleNameAsyncValidator(control.value).then((data: boolean) => {
        if (!data) {
          observer.next({ error: true, duplicated: true });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });

  /**
   * @description: 重置表单事件
   */
  reset() {
    this.validateForm.reset();
    // 当用户点击重置按钮时，删除minio中已经上传了的文件
    this.fileList.forEach(f => {
      this.file.deletePublicHeaderFile(f.response.url);
    });
    this.fileList = [];
  }

  /**
   * @description: 取消当前操作，返回上级
   */
  cancel() {
    this.location.back();
  }
}
