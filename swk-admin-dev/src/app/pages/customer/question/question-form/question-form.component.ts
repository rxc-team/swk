import { formatDistance } from 'date-fns';
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload/interface';

import { Location } from '@angular/common';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HelpService, QuestionService } from '@api';
import { FileUtilService, I18NService, TimeZoneService, TokenStorageService } from '@core';

interface LocationInfo {
  locationName: string;
  locationValue: string;
  transkbn: boolean;
}

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.less']
})
export class QuestionFormComponent implements OnInit {
  // 固定集合-种类
  questionTypes = [
    {
      label: 'page.customer.qa.type01',
      value: 'OperationProblem'
    },
    {
      label: 'page.customer.qa.type02',
      value: 'SystemError'
    },
    {
      label: 'page.customer.qa.type03',
      value: 'Request'
    }
  ];
  // 固定集合-状态
  questionStatuss = [
    {
      label: 'page.customer.qa.statusOpen',
      value: 'open'
    },
    {
      label: 'page.customer.qa.statusClose',
      value: 'closed'
    }
  ];

  // 问题展示情报
  titleInfo = '';
  typeInfo = '';
  positionInfo = '';
  statusInfo = '';
  qpicListInfo: string[] = [];
  detailInfo = '';
  locationInfos: LocationInfo[] = [];

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
  // 追记链接用
  inputValue: string;
  searchHelps = [];
  psLinkVisible = false;

  // 是否打开图片窗口
  showImage = false;
  // 图片窗口的图片路径
  imageUrl = '';

  // 问题是否开放中
  isOpen = false;

  // 时区列表
  timezones = [];

  size = 'default';

  // 构造
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private tokenService: TokenStorageService,
    private i18n: I18NService,
    private message: NzMessageService,
    private location: Location,
    private event: NgEventBus,
    private http: HttpClient,
    private timeService: TimeZoneService,
    private helpService: HelpService,
    private fileUtil: FileUtilService,
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
        this.size = 'small';
      } else {
        this.size = 'default';
      }
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

    // 时区列表
    await this.timeService.getTimeZones().then((data: any[]) => {
      if (data) {
        this.timezones = data;
      } else {
        this.timezones = [];
      }
    });

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
      // 画面问题展示情报设置
      this.titleInfo = res.title;
      this.typeInfo = res.type;
      this.positionInfo = res.function;
      this.statusInfo = res.status;
      this.qpicListInfo = res.images;
      this.detailInfo = res.content.replaceAll('\n', '<br/>');
      const locInfoStr: string = res.locations;
      this.editLocation(locInfoStr.substr(0, locInfoStr.length - 1));

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
                addSuffix: true
              })
            }
          ].map(e => {
            return {
              ...e,
              displayTime: formatDistance(e.datetime, new Date(), {
                includeSeconds: true,
                addSuffix: true
              })
            };
          });
        });
      }
    }
  }

  /**
   * @description: 问题定位编辑
   */
  editLocation(locationInfoStr: string) {
    const infos = locationInfoStr.split(';');
    infos.forEach(info => {
      const kv = info.split(':');
      if (kv.length === 2) {
        if (kv[1]) {
          const lif = this.getLocNameVal(kv[0], kv[1]);
          this.locationInfos = [...this.locationInfos, lif];
        }
      }
    });
  }

  /**
   * @description: 问题定位名称和值编辑
   */
  getLocNameVal(locKey: string, locVal: string): LocationInfo {
    switch (locKey.toUpperCase()) {
      case 'CUSTOMER':
        // 公司名称
        return { locationName: 'common.questitle.001', locationValue: locVal, transkbn: false };
      case 'DOMAIN':
        // 公司域名
        return { locationName: 'common.questitle.002', locationValue: locVal, transkbn: false };
      case 'USER':
        // 提问用户名称
        return { locationName: 'common.questitle.003', locationValue: locVal, transkbn: false };
      case 'USERTYPE':
        let name = '';
        // 提问用户类型
        if (locVal === '2') {
          // 超级管理员
          name = 'common.questitle.009';
        } else if (locVal === '1') {
          // 管理员
          name = 'common.questitle.010';
        } else {
          // 普通用户
          name = 'common.questitle.011';
        }
        return { locationName: 'common.questitle.004', locationValue: name, transkbn: true };
      case 'APP':
        // 应用名称
        return { locationName: 'common.questitle.005', locationValue: locVal, transkbn: false };
      case 'SYORIYM':
        // 处理月度
        return { locationName: 'common.questitle.006', locationValue: locVal, transkbn: false };
      case 'LANGUAGE':
        let lanName = '';
        // 语言
        if (locVal === 'zh-CN') {
          // 简体中文
          lanName = '简体中文';
        } else if (locVal === 'ja-JP') {
          // 日本語
          lanName = '日本語';
        } else {
          // English
          lanName = 'English';
        }
        return { locationName: 'common.questitle.007', locationValue: lanName, transkbn: false };
      case 'TIMEZONE':
        // 时区
        const rt = this.timezones.find(t => t.value === locVal);
        if (rt) {
          return { locationName: 'common.questitle.008', locationValue: rt.code, transkbn: true };
        } else {
          return { locationName: 'common.questitle.008', locationValue: locVal, transkbn: false };
        }
      default:
        // 默认
        return { locationName: locKey, locationValue: locVal, transkbn: false };
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
      this.event.cast('question:refresh');
      this.location.back();
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
          addSuffix: true
        })
      }
    ].map(e => {
      return {
        ...e,
        displayTime: formatDistance(e.datetime, new Date(), {
          includeSeconds: true,
          addSuffix: true
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
          addSuffix: true
        })
      }
    ].map(e => {
      return {
        ...e,
        displayTime: formatDistance(e.datetime, new Date(), {
          includeSeconds: true,
          addSuffix: true
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

  /**
   * @description: 追记链接
   */
  psHandleChangeLink(hid: string): void {
    this.inputValue = '';
    if (this.psLinkVisible) {
      this.psLinkVisible = false;
    }
    // 追记链接
    this.submitting = true;
    this.submitting = false;
    this.psdata = [
      ...this.psdata,
      {
        ...this.psuser,
        link: hid,
        datetime: new Date(),
        displayTime: formatDistance(new Date(), new Date(), {
          includeSeconds: true,
          addSuffix: true
        })
      }
    ].map(e => {
      return {
        ...e,
        displayTime: formatDistance(e.datetime, new Date(), {
          includeSeconds: true,
          addSuffix: true
        })
      };
    });

    // 追记链接更新到表
    const questionID = this.route.snapshot.paramMap.get('question_id');
    const ps = {
      postscripter: this.psuser.u_id,
      postscripter_name: this.psuser.author,
      avatar: this.psuser.avatar,
      link: hid
    };
    const params = {
      question_id: questionID,
      postscript: ps
    };
    this.questionService.updateQuestion(questionID, params).then(async () => {
      this.message.success(this.i18n.translateLang('common.message.success.S_002'));
    });
  }

  // 回车选择帮助文章链接
  onKeyup(e: any) {
    const code = e.keyCode;
    if (code === 13) {
      const Thelp = this.searchHelps.filter(h => (h.title = this.inputValue));
      if (Thelp.length > 0) {
        this.psHandleChangeLink(Thelp[0].help_id);
      }
    }
  }

  // 根据搜索框輸入值查找帮助文章
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
