import { formatDistance } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';

import { Location } from '@angular/common';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from '@api';
import { FileUtilService, I18NService, TokenStorageService } from '@core';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.less']
})
export class QuestionFormComponent implements OnInit {
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
  // 固定集合-状态
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
  // 固定集合-admin位置
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
  // 固定集合-web位置
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

  // 表单
  validateForm: FormGroup;

  // 问题展示情报
  titleInfo = '';
  typeInfo = '';
  positionInfo = '';
  statusInfo = '';
  qpicListInfo: string[] = [];
  detailInfo = '';

  // 追记文字用
  submitting = false;
  psdata: any[] = [];
  psuser: {
    u_id: string;
    author: string;
    avatar: string;
  };
  psValue = '';
  // 追记图片用
  supportFile = [];
  psFileList: NzUploadFile[] = [];
  psPics: string[] = [];

  // 是否打开图片窗口
  showImage = false;
  // 图片窗口的图片路径
  imageUrl = '';

  // 当前用户是否是问题提出者
  isOwner = false;
  // 问题是否开放中
  isOpen = false;

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
    private fileUtil: FileUtilService
  ) {
    this.validateForm = this.fb.group({
      postscript: [null, []]
    });
    this.supportFile = this.fileUtil.getSupportTypes(true);
  }

  /**
   * @description: 画面初期化処理
   */
  async ngOnInit(): Promise<void> {
    // 获取当前的用户信息
    const user = this.tokenService.getUser();
    this.psuser = {
      u_id: user.id,
      author: user.name,
      avatar: user.avatar
    };

    // 问题情报取得设置
    this.route.data.subscribe(data => {
      this.getQuestionInfo(data.question);
    });
  }

  /**
   * @description: 问题情报取得设置
   */
  getQuestionInfo(res: any) {
    this.psdata = [];
    if (res) {
      // 当前用户是否是问题提出者
      if (res.created_by === this.psuser.u_id) {
        this.isOwner = true;
      }
      // 画面问题展示情报设置
      this.titleInfo = res.title;
      this.typeInfo = res.type;
      this.positionInfo = res.function;
      this.statusInfo = res.status;
      this.qpicListInfo = res.images;
      this.detailInfo = res.content.replaceAll('\n', '<br/>');
      if (this.statusInfo === 'open') {
        this.isOpen = true;
      }
      // 追记设置
      if (res.postscripts) {
        res.postscripts.forEach((postscript: any) => {
          const componentUser = {
            author: postscript.postscripter_name,
            avatar: postscript.avatar
          };
          this.submitting = false;
          this.psdata = [
            ...this.psdata,
            {
              ...componentUser,
              content: postscript.content,
              images: postscript.images,
              link: postscript.link,
              datetime: new Date(postscript.postscripted_at),
              displayTime: formatDistance(new Date(), new Date(), {
                includeSeconds: true,
                addSuffix: true,
                locale: enUS
              })
            }
          ].map(e => {
            return {
              ...e,
              displayTime: formatDistance(e.datetime, new Date(), {
                includeSeconds: true,
                addSuffix: true,
                locale: enUS
              })
            };
          });
        });
      }
    }
  }

  /**
   * @description: 关闭问题
   */
  async closeQuestion() {
    const questionID = this.route.snapshot.paramMap.get('question_id');
    const params = {
      question_id: questionID,
      status: 'closed'
    };
    this.questionService.updateQuestion(questionID, params).then(async () => {
      this.message.success(this.i18n.translateLang('common.message.success.S_002'));
      this.cancel();
    });
  }

  /**
   * @description: 追记文字
   */
  handleSubmit(): void {
    this.submitting = true;
    const contentVal = this.psValue;
    this.psValue = '';
    this.submitting = false;
    this.psdata = [
      ...this.psdata,
      {
        ...this.psuser,
        content: contentVal,
        datetime: new Date(),
        displayTime: formatDistance(new Date(), new Date(), {
          includeSeconds: true,
          addSuffix: true,
          locale: enUS
        })
      }
    ].map(e => {
      return {
        ...e,
        displayTime: formatDistance(e.datetime, new Date(), {
          includeSeconds: true,
          addSuffix: true,
          locale: enUS
        })
      };
    });

    // 追记文字更新到表
    const questionID = this.route.snapshot.paramMap.get('question_id');
    const ps = {
      postscripter: this.psuser.u_id,
      postscripter_name: this.psuser.author,
      avatar: this.psuser.avatar,
      content: contentVal
    };
    const params = {
      question_id: questionID,
      postscript: ps
    };
    this.questionService.updateQuestion(questionID, params).then(async () => {
      this.message.success(this.i18n.translateLang('common.message.success.S_002'));
    });
  }

  /**
   * @description: 追记图片集
   */
  psHandleChange({ file, fileList }): void {
    const status = file.status;
    if (status !== 'uploading') {
    }
    // 文件上传成功
    if (status === 'done') {
      fileList = [];
      this.setPsImages();
      this.psFileList = [];
      this.message.success(this.i18n.translateLang('common.message.success.S_006'));
    } else if (status === 'error') {
      this.message.error(this.i18n.translateLang('common.message.error.E_006'));
    }
  }

  /**
   * @description: 追记图片集
   */
  setPsImages() {
    this.psPics = [];
    this.psFileList.forEach(file => {
      const status = file.status;
      if (status === 'done') {
        this.psPics.push(file.response.url);
      }
    });
    // 追记图片集
    this.submitting = true;
    this.submitting = false;
    this.psdata = [
      ...this.psdata,
      {
        ...this.psuser,
        images: this.psPics,
        datetime: new Date(),
        displayTime: formatDistance(new Date(), new Date(), {
          includeSeconds: true,
          addSuffix: true,
          locale: enUS
        })
      }
    ].map(e => {
      return {
        ...e,
        displayTime: formatDistance(e.datetime, new Date(), {
          includeSeconds: true,
          addSuffix: true,
          locale: enUS
        })
      };
    });

    // 追记图片集更新到表
    const questionID = this.route.snapshot.paramMap.get('question_id');
    const ps = {
      postscripter: this.psuser.u_id,
      postscripter_name: this.psuser.author,
      avatar: this.psuser.avatar,
      images: this.psPics
    };
    const params = {
      question_id: questionID,
      postscript: ps
    };
    this.questionService.updateQuestion(questionID, params).then(async () => {
      this.message.success(this.i18n.translateLang('common.message.success.S_002'));
    });
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
   * @description: 取消当前操作，返回上级
   */
  cancel() {
    this.location.back();
  }

  /**
   * @description: 问题种类标签
   */
  getTypeInfoLabel(value: string): string {
    const res = this.questionTypes.filter(target => target.value === value)[0];
    if (res) {
      return res.label;
    }
    return value;
  }

  /**
   * @description: 问题位置标签
   */
  getPosInfoLabel(value: string): string {
    const resA = this.questionAdminPositions.filter(target => target.value === value)[0];
    if (resA) {
      return resA.label;
    }
    const resW = this.questionWebPositions.filter(target => target.value === value)[0];
    if (resW) {
      return resW.label;
    }
    return value;
  }

  /**
   * @description: 问题状态标签
   */
  getStatusInfoLabel(value: string): string {
    const res = this.questionStatuss.filter(target => target.value === value)[0];
    if (res) {
      return res.label;
    }
    return value;
  }

  // 打开图片窗口
  showImageModal(url: string) {
    this.imageUrl = url;
    this.showImage = true;
  }
  // 隐藏图片窗口
  hideImageModal() {
    this.showImage = false;
  }
}
