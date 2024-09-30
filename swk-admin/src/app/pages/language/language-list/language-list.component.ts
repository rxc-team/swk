/*
 * @Description: 多语言一览控制器
 * @Author: RXC 廖云江
 * @Date: 2019-09-10 13:25:26
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-08-21 09:39:37
 */

import { format } from 'date-fns';
import * as _ from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';

import { Component, OnInit } from '@angular/core';
import { DatastoreService, LanguageService, OptionService } from '@api';
import { FileUtilService, I18NService, TokenStorageService } from '@core';

interface DownLanguageData {
  typeName: string;
  typeId: string;
  itemId: string;
  itemZhName: string;
  itemEnName: string;
  itemJaName: string;
  itemThName: string;
}

@Component({
  selector: 'app-language-list',
  templateUrl: './language-list.component.html',
  styleUrls: ['./language-list.component.less']
})
export class LanguageListComponent implements OnInit {
  // 语言数据
  zhData: any;
  enData: any;
  jaData: any;
  thData: any;

  // 编辑字段的台账数据
  selFieldDatastoreId = '';
  // 编辑映射的台账数据
  selMappingDatastoreId = '';

  // 当前APP
  appId = '';

  // 渲染画面
  show = false;

  // 多语言数据下载用
  downDataList: DownLanguageData[] = [];
  showDown = false;
  selTypes = [];
  selFDs = [];
  selMDs = [];
  selOpts = [];
  selOps = [];
  selWs = [];
  datastores: any[] = [];
  optionGroups: any[] = [];
  lanTypes = [
    {
      type: 'apps',
      type_name: 'page.language.labelAppName'
    },
    {
      type: 'dashboards',
      type_name: 'page.language.labelDashboards'
    },
    {
      type: 'datastores',
      type_name: 'page.language.labelDatastores'
    },
    {
      type: 'fields',
      type_name: 'page.language.labelFields'
    },
    {
      type: 'groups',
      type_name: 'page.language.labelGroups'
    },
    {
      type: 'mappings',
      type_name: 'page.language.labelMappings'
    },
    {
      type: 'options',
      type_name: 'page.language.labelOptions'
    },
    {
      type: 'reports',
      type_name: 'page.language.labelReports'
    },
    {
      type: 'workflows',
      type_name: 'page.language.labelWorkflows'
    }
  ];

  // 多语言数据上传用
  showUp = false;
  fileList: NzUploadFile[] = [];
  encoding = 'utf-8';

  // 构造器
  constructor(
    private languageService: LanguageService,
    private i18n: I18NService,
    private message: NzMessageService,
    private tokenService: TokenStorageService,
    private datastoreService: DatastoreService,
    private optionService: OptionService,
    private fileUtil: FileUtilService
  ) {}

  /**
   * @description: 画面初期化処理
   */
  ngOnInit() {
    this.appId = this.tokenService.getUserApp();
    this.init();
  }

  /**
   * @description: 初期化处理
   */
  init() {
    this.search();
    // 下载用初期化
    this.downloadInit();
  }

  /**
   * @description: 多语言数据检索
   */
  async search() {
    // 中文数据取得
    await this.languageService.getLanguageData('zh-CN').then(data => {
      if (data) {
        this.zhData = data;
      } else {
        this.zhData = [];
      }
    });
    // 英文数据取得
    await this.languageService.getLanguageData('en-US').then(data => {
      if (data) {
        this.enData = data;
      } else {
        this.enData = [];
      }
    });
    // 日文数据取得
    await this.languageService.getLanguageData('ja-JP').then(data => {
      if (data) {
        this.jaData = data;
      } else {
        this.jaData = [];
      }
    });
    // 泰文数据取得
    await this.languageService.getLanguageData('th-TH').then(data => {
      if (data) {
        this.thData = data;
      } else {
        this.thData = [];
      }
    });
    this.show = true;
  }

  /**
   * @description: 保存编辑
   */
  async saveEdit(ids: string[], listOfData: any[], editCache: any, subProject: string, lang: string, datastoreId?: string) {
    // 所有更新任务
    const allJobs = [];
    const data = listOfData[lang];
    // 循环更新对象项,检查唯一并添加更新任务
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      // 项目唯一性check
      let isUnique = true;
      data.forEach(element => {
        if (element.itemName === editCache[id].data.itemName && element.itemId !== id && element.itemName !== '') {
          switch (lang) {
            case 'ja-JP':
              this.message.warning(`${this.i18n.translateLang('common.validator.jaDuplicated')}`);
              break;
            case 'en-US':
              this.message.warning(`${this.i18n.translateLang('common.validator.enDuplicated')}`);
              break;
            case 'zh-CN':
              this.message.warning(`${this.i18n.translateLang('common.validator.zhDuplicated')}`);
              break;
            case 'th-TH':
              this.message.warning(`${this.i18n.translateLang('common.validator.thDuplicated')}`);
              break;
          }
          isUnique = false;
        }
      });
      if (!isUnique) {
        return;
      }
      // 画面数据状态更新
      const index = data.findIndex(item => item.itemId === id);
      Object.assign(data[index], editCache[id].data);
      // editCache[id].edit = false;
      const jobs = [];
      // 共通类型
      if (subProject === 'assignes' || subProject === 'schedules' || subProject === 'groups') {
        // 应用程序语言添加
        if (data[index].itemName) {
          const Params = {
            type: subProject,
            key: id,
            value: data[index].itemName
          };
          jobs.push(this.languageService.addCommonLanguageData(lang, Params));
        }
      } else if (subProject === 'apps') {
        // 应用程序语言添加
        if (data[index].itemName) {
          jobs.push(this.languageService.addLanguageData(data[index].itemId, lang, data[index].itemName));
        }
      } else {
        // 报表 & 字段 & 仪表盘 & 选项 & 台账 & 流程的语言添加
        if (data[index].itemName) {
          const Params = {
            app_id: this.appId,
            type: subProject,
            key: id,
            value: data[index].itemName
          };
          jobs.push(this.languageService.addAppLanguageData(lang, Params));
        }
      }
      // 多语言翻译若有翻译文字为空的场合
      if (jobs.length == 0) {
        this.message.warning(`${this.i18n.translateLang('common.message.warning.W_007')}`);
      }
      // 添加更新任务到集合
      allJobs.push(...jobs);
    }

    // 字段或者映射的场合,保留台账ID信息
    if (subProject === 'fields') {
      this.selFieldDatastoreId = datastoreId;
    }
    if (subProject === 'mappings') {
      this.selMappingDatastoreId = datastoreId;
    }

    // 执行汇总
    await forkJoin(allJobs)
      .toPromise()
      .then(async data => {
        this.message.success(this.i18n.translateLang('common.message.success.S_002'));
      });

    this.search();
  }

  /**
   * @description: 下载用初期化处理
   */
  async downloadInit() {
    await this.getDatastoreList();
    await this.getOptionGroupList();
  }

  /**
   * @description: Datastore下拉表单取得事件
   */
  async getDatastoreList() {
    const params = {
      appID: this.appId
    };
    await this.datastoreService.getDatastores(params).then((data: any[]) => {
      if (data) {
        this.datastores = data;
      } else {
        this.datastores = [];
      }
    });
  }

  /**
   * @description: 选项卡下拉表单取得事件
   */
  async getOptionGroupList() {
    await this.optionService.getOptions(this.appId).then((data: any[]) => {
      if (data) {
        this.optionGroups = data;
      } else {
        this.optionGroups = [];
      }
    });
  }

  /**
   * @description: 下载选择框显示控制
   */
  showDownLoad() {
    this.showDown = true;
  }

  /**
   * @description: 取消下载
   */
  downloadCancel() {
    this.showDown = false;
    this.selTypes = [];
    this.selFDs = [];
    this.selMDs = [];
    this.selOpts = [];
    this.selOps = [];
    this.selWs = [];
  }

  /**
   * @description: 下载多语言为CSV文件
   */
  downloadCSV() {
    this.showDown = false;
    this.downDataList = [];
    // 多语言数据编辑
    this.downloadCSVEdit();
    // 多语言数据
    const csvItems = [];
    // 项目标题(名称)
    const nameHeaders = [
      this.i18n.translateLang('page.language.languageTypeName'),
      this.i18n.translateLang('page.language.languageTypeID'),
      this.i18n.translateLang('page.language.languageKey'),
      this.i18n.translateLang('page.language.chinese'),
      this.i18n.translateLang('page.language.english'),
      this.i18n.translateLang('page.language.japanese'),
      this.i18n.translateLang('page.language.thai')
    ];
    // 项目标题(key)
    const keyHeaders = ['type_name', 'type_id', 'key', 'zh_value', 'en_value', 'ja_value', 'th_value'];
    // 循环多语言表数据,编辑文件内容
    this.downDataList.forEach((dt, index) => {
      // 行数据编辑
      const item: any[] = [];
      // 类型名称
      item.push(dt.typeName);
      // 类型ID
      item.push(dt.typeId);
      // Key
      item.push(dt.itemId);
      // 中
      item.push(dt.itemZhName);
      // 英
      item.push(dt.itemEnName);
      // 日
      item.push(dt.itemJaName);
      // 泰
      item.push(dt.itemThName);

      // 第一次循环的时候添加项目标题数据
      if (index === 0) {
        csvItems.push(nameHeaders);
        csvItems.push(keyHeaders);
      }

      // 将行数据添加到集合中
      csvItems.push(item);
    });

    // 当数据为空的时候，只下载表头
    if (this.downDataList.length === 0) {
      csvItems.push(nameHeaders);
      csvItems.push(keyHeaders);
    }

    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(csvItems);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* get the file name */
    const csvFileName = 'language_data' + '_' + format(new Date(), 'yyyyMMddHHmmss') + '.csv';

    /* save to file */
    XLSX.writeFile(wb, csvFileName);

    /* clear the before */
    this.selTypes = [];
    this.selFDs = [];
    this.selMDs = [];
    this.selOpts = [];
    this.selOps = [];
    this.selWs = [];

    this.message.success(this.i18n.translateLang('common.message.success.S_013'));
  }

  /**
   * @description: 下载用多语言数据编辑
   */
  downloadCSVEdit() {
    if (this.selTypes.length > 0) {
      // APP名称
      if (this.selTypes.includes('apps')) {
        this.downDataList.push(...this.getAppNameData());
      }
      // APP下属-台账
      if (this.selTypes.includes('datastores')) {
        this.downDataList.push(...this.getAppItemData('datastores'));
      }
      // APP下属-字段
      if (this.selTypes.includes('fields')) {
        const ds = this.getAppItemData('fields');
        if (this.selFDs.length > 0) {
          this.selFDs.forEach(datastoreId => {
            this.downDataList.push(...ds.filter(d => d.itemId.startsWith(datastoreId)));
          });
        } else {
          this.downDataList.push(...ds);
        }
      }
      // APP下属-映射
      if (this.selTypes.includes('mappings')) {
        const ds = this.getAppItemData('mappings');
        if (this.selMDs.length > 0) {
          this.selMDs.forEach(datastoreId => {
            this.downDataList.push(...ds.filter(d => d.itemId.startsWith(datastoreId)));
          });
        } else {
          this.downDataList.push(...ds);
        }
      }
      // APP下属-选项
      if (this.selTypes.includes('options')) {
        const opts = this.getAppItemData('options');
        // 选项组
        if (this.selOpts.length === 1) {
          if (this.selOpts.includes('optionGroup')) {
            this.downDataList.push(...opts.filter((d: any) => d.itemId.includes('_') === false));
          }
        } else {
          this.downDataList.push(...opts.filter((d: any) => d.itemId.includes('_') === false));
        }
        // 子选项
        if (this.selOpts.length === 0) {
          this.downDataList.push(...opts.filter((d: any) => d.itemId.includes('_')));
        }
        if ((this.selOpts.length === 1 && this.selOpts.includes('option')) || this.selOpts.length === 2) {
          if (this.selOps.length > 0) {
            this.selOps.forEach(op => {
              var ogs = opts.filter(d => d.itemId.startsWith(op));
              ogs = ogs.filter(d => d.itemId.includes('_'));
              this.downDataList.push(...ogs);
            });
          } else {
            this.downDataList.push(...opts.filter((d: any) => d.itemId.includes('_')));
          }
        }
      }
      // APP下属-报表
      if (this.selTypes.includes('reports')) {
        this.downDataList.push(...this.getAppItemData('reports'));
      }
      // APP下属-仪表盘
      if (this.selTypes.includes('dashboards')) {
        this.downDataList.push(...this.getAppItemData('dashboards'));
      }

      // COMMON下属-用户组
      if (this.selTypes.includes('groups')) {
        this.downDataList.push(...this.getCommonItemData('groups'));
      }
      // COMMON下属-流程
      if (this.selTypes.includes('workflows')) {
        if (this.selWs.length === 1) {
          const ws = this.getAppItemData('workflows');
          if (this.selWs.includes('wf')) {
            this.downDataList.push(...ws.filter(d => d.itemId.includes('menu') === false));
          } else {
            this.downDataList.push(...ws.filter(d => d.itemId.includes('menu')));
          }
        } else {
          this.downDataList.push(...this.getAppItemData('workflows'));
        }
      }
    } else {
      this.downDataList.push(...this.getAppNameData());
      this.downDataList.push(...this.getAppItemData('datastores'));
      this.downDataList.push(...this.getAppItemData('fields'));
      this.downDataList.push(...this.getAppItemData('mappings'));
      this.downDataList.push(...this.getAppItemData('options'));
      this.downDataList.push(...this.getAppItemData('reports'));
      this.downDataList.push(...this.getAppItemData('dashboards'));
      this.downDataList.push(...this.getCommonItemData('groups'));
      this.downDataList.push(...this.getAppItemData('workflows'));
    }
  }

  /**
   * @description: 取得应用多语言
   */
  getAppNameData(): DownLanguageData[] {
    var listOfData: DownLanguageData[] = [];
    // 中文
    if (this.zhData.apps) {
      // tslint:disable-next-line:forin
      for (const appId in this.zhData.apps) {
        const ld: DownLanguageData = {
          typeName: this.i18n.translateLang('page.language.labelAppName'),
          typeId: 'apps',
          itemId: appId,
          itemZhName: '',
          itemEnName: '',
          itemJaName: '',
          itemThName: ''
        };
        ld.itemZhName = this.zhData.apps[appId].app_name;
        if (this.enData.apps && this.enData.apps[appId]) {
          ld.itemEnName = this.enData.apps[appId].app_name;
        } else {
          ld.itemEnName = '';
        }
        if (this.jaData.apps && this.jaData.apps[appId]) {
          ld.itemJaName = this.jaData.apps[appId].app_name;
        } else {
          ld.itemJaName = '';
        }
        if (this.thData.apps && this.thData.apps[appId]) {
          ld.itemThName = this.thData.apps[appId].app_name;
        } else {
          ld.itemThName = '';
        }
        if (this.appId === appId) {
          listOfData.push(ld);
        }
      }
    }

    // 英文
    if (this.enData.apps) {
      // tslint:disable-next-line:forin
      for (const appId in this.enData.apps) {
        const ld: DownLanguageData = {
          typeName: this.i18n.translateLang('page.language.labelAppName'),
          typeId: 'apps',
          itemId: appId,
          itemZhName: '',
          itemEnName: '',
          itemJaName: '',
          itemThName: ''
        };
        ld.itemEnName = this.enData.apps[appId].app_name;
        if (this.jaData.apps && this.jaData.apps[appId]) {
          ld.itemJaName = this.jaData.apps[appId].app_name;
        } else {
          ld.itemJaName = '';
        }
        if (this.zhData.apps && this.zhData.apps[appId]) {
          ld.itemZhName = this.zhData.apps[appId].app_name;
        } else {
          ld.itemZhName = '';
        }
        if (this.thData.apps && this.thData.apps[appId]) {
          ld.itemThName = this.thData.apps[appId].app_name;
        } else {
          ld.itemThName = '';
        }
        if (this.appId === appId) {
          listOfData.push(ld);
        }
      }
    }

    // 日文
    if (this.jaData.apps) {
      // tslint:disable-next-line:forin
      for (const appId in this.jaData.apps) {
        const ld: DownLanguageData = {
          typeName: this.i18n.translateLang('page.language.labelAppName'),
          typeId: 'apps',
          itemId: appId,
          itemZhName: '',
          itemEnName: '',
          itemJaName: '',
          itemThName: ''
        };
        ld.itemJaName = this.jaData.apps[appId].app_name;
        if (this.enData.apps && this.enData.apps[appId]) {
          ld.itemEnName = this.enData.apps[appId].app_name;
        } else {
          ld.itemEnName = '';
        }
        if (this.zhData.apps && this.zhData.apps[appId]) {
          ld.itemZhName = this.zhData.apps[appId].app_name;
        } else {
          ld.itemZhName = '';
        }
        if (this.thData.apps && this.thData.apps[appId]) {
          ld.itemThName = this.thData.apps[appId].app_name;
        } else {
          ld.itemThName = '';
        }
        if (this.appId === appId) {
          listOfData.push(ld);
        }
      }
    }
    // 泰文
    if (this.thData.apps) {
      // tslint:disable-next-line:forin
      for (const appId in this.thData.apps) {
        const ld: DownLanguageData = {
          typeName: this.i18n.translateLang('page.language.labelAppName'),
          typeId: 'apps',
          itemId: appId,
          itemZhName: '',
          itemEnName: '',
          itemJaName: '',
          itemThName: ''
        };
        ld.itemThName = this.thData.apps[appId].app_name;
        if (this.enData.apps && this.enData.apps[appId]) {
          ld.itemEnName = this.enData.apps[appId].app_name;
        } else {
          ld.itemEnName = '';
        }
        if (this.jaData.apps && this.jaData.apps[appId]) {
          ld.itemJaName = this.jaData.apps[appId].app_name;
        } else {
          ld.itemJaName = '';
        }
        if (this.zhData.apps && this.zhData.apps[appId]) {
          ld.itemZhName = this.zhData.apps[appId].app_name;
        } else {
          ld.itemZhName = '';
        }
        if (this.appId === appId) {
          listOfData.push(ld);
        }
      }
    }

    // 数据有无判断&去重
    if (listOfData.length > 0) {
      if (listOfData.length > 1) {
        listOfData = this.distinct(listOfData);
      }
    } else {
      listOfData = [];
    }

    return listOfData;
  }

  /**
   * @description: 取得应用下属多语言
   */
  getAppItemData(subProject: string): DownLanguageData[] {
    var listOfData: DownLanguageData[] = [];
    // 中文
    if (this.zhData.apps && this.zhData.apps[this.appId] && this.zhData.apps[this.appId][subProject]) {
      // tslint:disable-next-line:forin
      for (const key in this.zhData.apps[this.appId][subProject]) {
        const ld: DownLanguageData = {
          typeName: this.i18n.translateLang(this.lanTypes.find(l => l.type === subProject).type_name),
          typeId: subProject,
          itemId: key,
          itemZhName: '',
          itemEnName: '',
          itemJaName: '',
          itemThName: ''
        };
        ld.itemZhName = this.zhData.apps[this.appId][subProject][key];
        if (
          this.enData.apps &&
          this.enData.apps[this.appId] &&
          this.enData.apps[this.appId][subProject] &&
          this.enData.apps[this.appId][subProject][key]
        ) {
          ld.itemEnName = this.enData.apps[this.appId][subProject][key];
        } else {
          ld.itemEnName = '';
        }
        if (
          this.jaData.apps &&
          this.jaData.apps[this.appId] &&
          this.jaData.apps[this.appId][subProject] &&
          this.jaData.apps[this.appId][subProject][key]
        ) {
          ld.itemJaName = this.jaData.apps[this.appId][subProject][key];
        } else {
          ld.itemJaName = '';
        }
        if (
          this.thData.apps &&
          this.thData.apps[this.appId] &&
          this.thData.apps[this.appId][subProject] &&
          this.thData.apps[this.appId][subProject][key]
        ) {
          ld.itemThName = this.thData.apps[this.appId][subProject][key];
        } else {
          ld.itemThName = '';
        }
        listOfData.push(ld);
      }
    }
    // 日文
    if (this.jaData.apps && this.jaData.apps[this.appId] && this.jaData.apps[this.appId][subProject]) {
      // tslint:disable-next-line:forin
      for (const key in this.jaData.apps[this.appId][subProject]) {
        const ld: DownLanguageData = {
          typeName: this.i18n.translateLang(this.lanTypes.find(l => l.type === subProject).type_name),
          typeId: subProject,
          itemId: key,
          itemZhName: '',
          itemEnName: '',
          itemJaName: '',
          itemThName: ''
        };
        ld.itemJaName = this.jaData.apps[this.appId][subProject][key];
        if (
          this.enData.apps &&
          this.enData.apps[this.appId] &&
          this.enData.apps[this.appId][subProject] &&
          this.enData.apps[this.appId][subProject][key]
        ) {
          ld.itemEnName = this.enData.apps[this.appId][subProject][key];
        } else {
          ld.itemEnName = '';
        }
        if (
          this.zhData.apps &&
          this.zhData.apps[this.appId] &&
          this.zhData.apps[this.appId][subProject] &&
          this.zhData.apps[this.appId][subProject][key]
        ) {
          ld.itemZhName = this.zhData.apps[this.appId][subProject][key];
        } else {
          ld.itemZhName = '';
        }
        if (
          this.thData.apps &&
          this.thData.apps[this.appId] &&
          this.thData.apps[this.appId][subProject] &&
          this.thData.apps[this.appId][subProject][key]
        ) {
          ld.itemThName = this.thData.apps[this.appId][subProject][key];
        } else {
          ld.itemThName = '';
        }
        listOfData.push(ld);
      }
    }
    // 英文
    if (this.enData.apps && this.enData.apps[this.appId] && this.enData.apps[this.appId][subProject]) {
      // tslint:disable-next-line:forin
      for (const key in this.enData.apps[this.appId][subProject]) {
        const ld: DownLanguageData = {
          typeName: this.i18n.translateLang(this.lanTypes.find(l => l.type === subProject).type_name),
          typeId: subProject,
          itemId: key,
          itemZhName: '',
          itemEnName: '',
          itemJaName: '',
          itemThName: ''
        };
        ld.itemEnName = this.enData.apps[this.appId][subProject][key];
        if (
          this.zhData.apps &&
          this.zhData.apps[this.appId] &&
          this.zhData.apps[this.appId][subProject] &&
          this.zhData.apps[this.appId][subProject][key]
        ) {
          ld.itemZhName = this.zhData.apps[this.appId][subProject][key];
        } else {
          ld.itemZhName = '';
        }
        if (
          this.jaData.apps &&
          this.jaData.apps[this.appId] &&
          this.jaData.apps[this.appId][subProject] &&
          this.jaData.apps[this.appId][subProject][key]
        ) {
          ld.itemJaName = this.jaData.apps[this.appId][subProject][key];
        } else {
          ld.itemJaName = '';
        }
        if (
          this.thData.apps &&
          this.thData.apps[this.appId] &&
          this.thData.apps[this.appId][subProject] &&
          this.thData.apps[this.appId][subProject][key]
        ) {
          ld.itemThName = this.thData.apps[this.appId][subProject][key];
        } else {
          ld.itemThName = '';
        }
        listOfData.push(ld);
      }
    }
    // 泰文
    if (this.thData.apps && this.thData.apps[this.appId] && this.thData.apps[this.appId][subProject]) {
      // tslint:disable-next-line:forin
      for (const key in this.thData.apps[this.appId][subProject]) {
        const ld: DownLanguageData = {
          typeName: this.i18n.translateLang(this.lanTypes.find(l => l.type === subProject).type_name),
          typeId: subProject,
          itemId: key,
          itemZhName: '',
          itemEnName: '',
          itemJaName: '',
          itemThName: ''
        };
        ld.itemThName = this.thData.apps[this.appId][subProject][key];
        if (
          this.zhData.apps &&
          this.zhData.apps[this.appId] &&
          this.zhData.apps[this.appId][subProject] &&
          this.zhData.apps[this.appId][subProject][key]
        ) {
          ld.itemZhName = this.zhData.apps[this.appId][subProject][key];
        } else {
          ld.itemZhName = '';
        }
        if (
          this.jaData.apps &&
          this.jaData.apps[this.appId] &&
          this.jaData.apps[this.appId][subProject] &&
          this.jaData.apps[this.appId][subProject][key]
        ) {
          ld.itemJaName = this.jaData.apps[this.appId][subProject][key];
        } else {
          ld.itemJaName = '';
        }
        if (
          this.enData.apps &&
          this.enData.apps[this.appId] &&
          this.enData.apps[this.appId][subProject] &&
          this.enData.apps[this.appId][subProject][key]
        ) {
          ld.itemEnName = this.enData.apps[this.appId][subProject][key];
        } else {
          ld.itemEnName = '';
        }
        listOfData.push(ld);
      }
    }
    // 数据有无判断&去重
    if (listOfData.length > 0) {
      if (listOfData.length > 1) {
        listOfData = this.distinct(listOfData);
      }
    } else {
      listOfData = [];
    }

    return listOfData;
  }

  /**
   * @description: 取得共同下属多语言
   */
  getCommonItemData(subProject: string): DownLanguageData[] {
    var listOfData: DownLanguageData[] = [];
    // 中文
    if (this.zhData.common[subProject]) {
      // tslint:disable-next-line:forin
      for (const key in this.zhData.common[subProject]) {
        // tslint:disable-next-line:no-shadowed-variable
        const ld: DownLanguageData = {
          typeName: this.i18n.translateLang(this.lanTypes.find(l => l.type === subProject).type_name),
          typeId: subProject,
          itemId: key,
          itemZhName: '',
          itemEnName: '',
          itemJaName: '',
          itemThName: ''
        };
        ld.itemZhName = this.zhData.common[subProject][key];
        if (this.enData.common[subProject] && this.enData.common[subProject][key]) {
          ld.itemEnName = this.enData.common[subProject][key];
        } else {
          ld.itemEnName = '';
        }
        if (this.jaData.common[subProject] && this.jaData.common[subProject][key]) {
          ld.itemJaName = this.jaData.common[subProject][key];
        } else {
          ld.itemJaName = '';
        }
        if (this.thData.common[subProject] && this.thData.common[subProject][key]) {
          ld.itemThName = this.thData.common[subProject][key];
        } else {
          ld.itemThName = '';
        }
        listOfData.push(ld);
      }
    }
    // 英文
    if (this.enData.common[subProject]) {
      // tslint:disable-next-line:forin
      for (const key in this.enData.common[subProject]) {
        // tslint:disable-next-line:no-shadowed-variable
        const ld: DownLanguageData = {
          typeName: this.i18n.translateLang(this.lanTypes.find(l => l.type === subProject).type_name),
          typeId: subProject,
          itemId: key,
          itemZhName: '',
          itemEnName: '',
          itemJaName: '',
          itemThName: ''
        };
        ld.itemEnName = this.enData.common[subProject][key];
        if (this.jaData.common[subProject] && this.jaData.common[subProject][key]) {
          ld.itemJaName = this.jaData.common[subProject][key];
        } else {
          ld.itemJaName = '';
        }
        if (this.zhData.common[subProject] && this.zhData.common[subProject][key]) {
          ld.itemZhName = this.zhData.common[subProject][key];
        } else {
          ld.itemZhName = '';
        }
        if (this.thData.common[subProject] && this.thData.common[subProject][key]) {
          ld.itemThName = this.thData.common[subProject][key];
        } else {
          ld.itemThName = '';
        }
        listOfData.push(ld);
      }
    }
    // 日文
    if (this.jaData.common[subProject]) {
      // tslint:disable-next-line:forin
      for (const key in this.jaData.common[subProject]) {
        // tslint:disable-next-line:no-shadowed-variable
        const ld: DownLanguageData = {
          typeName: this.i18n.translateLang(this.lanTypes.find(l => l.type === subProject).type_name),
          typeId: subProject,
          itemId: key,
          itemZhName: '',
          itemEnName: '',
          itemJaName: '',
          itemThName: ''
        };
        ld.itemJaName = this.jaData.common[subProject][key];
        if (this.enData.common[subProject] && this.enData.common[subProject][key]) {
          ld.itemEnName = this.enData.common[subProject][key];
        } else {
          ld.itemEnName = '';
        }
        if (this.zhData.common[subProject] && this.zhData.common[subProject][key]) {
          ld.itemZhName = this.zhData.common[subProject][key];
        } else {
          ld.itemZhName = '';
        }
        if (this.thData.common[subProject] && this.thData.common[subProject][key]) {
          ld.itemThName = this.thData.common[subProject][key];
        } else {
          ld.itemThName = '';
        }
        listOfData.push(ld);
      }
    }
    // 泰文
    if (this.thData.common[subProject]) {
      // tslint:disable-next-line:forin
      for (const key in this.thData.common[subProject]) {
        // tslint:disable-next-line:no-shadowed-variable
        const ld: DownLanguageData = {
          typeName: this.i18n.translateLang(this.lanTypes.find(l => l.type === subProject).type_name),
          typeId: subProject,
          itemId: key,
          itemZhName: '',
          itemEnName: '',
          itemJaName: '',
          itemThName: ''
        };
        ld.itemThName = this.thData.common[subProject][key];
        if (this.enData.common[subProject] && this.enData.common[subProject][key]) {
          ld.itemEnName = this.enData.common[subProject][key];
        } else {
          ld.itemEnName = '';
        }
        if (this.zhData.common[subProject] && this.zhData.common[subProject][key]) {
          ld.itemZhName = this.zhData.common[subProject][key];
        } else {
          ld.itemZhName = '';
        }
        if (this.jaData.common[subProject] && this.jaData.common[subProject][key]) {
          ld.itemJaName = this.jaData.common[subProject][key];
        } else {
          ld.itemJaName = '';
        }
        listOfData.push(ld);
      }
    }
    // 数据有无判断&去重
    if (listOfData.length > 0) {
      if (listOfData.length > 1) {
        listOfData = this.distinct(listOfData);
      }
    } else {
      listOfData = [];
    }

    return listOfData;
  }

  /**
   * @description: 数组去重
   */
  distinct(arr) {
    arr = _.sortBy(arr, 'itemId');
    const result = [arr[0]];
    for (let i = 1, len = arr.length; i < len; i++) {
      // tslint:disable-next-line:no-unused-expression
      arr[i].itemId !== arr[i - 1].itemId && result.push(arr[i]);
    }
    return result;
  }

  /**
   * @description: 文件上传前检查
   */
  beforeUpload = (file: NzUploadFile): boolean => {
    // 上传文件类型限制
    const isSupportFileType = this.fileUtil.checkSupport(file.type, false);
    if (!isSupportFileType) {
      this.message.error(this.i18n.translateLang('common.validator.uploadFileType'));
      this.fileList = [];
      return false;
    }

    // 上传文件大小限制
    const isLt5M = this.fileUtil.checkSize(file.size);
    if (!isLt5M) {
      this.message.error(this.i18n.translateLang('common.validator.uploadFileSize'));
      this.fileList = [];
      return false;
    }

    // 一次上传文件大小个数限制
    if (this.fileList && this.fileList.length >= 1) {
      this.message.error(this.i18n.translateLang('common.validator.singleFileUpload'));
      this.fileList = [];
      return false;
    }

    this.fileList = this.fileList.concat(file);
    return false;
  };

  /**
   * @description: 多语言上传
   */
  handleUpload(): void {
    this.showUp = false;
    const formData = new FormData();
    // 编码
    formData.append('encoding', this.encoding);
    // 上传文件
    const file = this.fileList[0];
    formData.append('file', file as any);
    // 清空
    this.fileList = [];

    // 读取文件检查
    const reader: FileReader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        /* save data */
        const data = XLSX.utils.sheet_to_csv(ws);
        const dataList = data.split('\n');

        /* check size */
        if (dataList.length > 50003) {
          this.message.error(this.i18n.translateLang('common.validator.csvFileMaxLength'));
          return;
        }

        // 唯一性检查
        var indexs: { [key: string]: any } = {};
        var lanList: DownLanguageData[] = [];
        // 项目数定
        for (let index = 0; index < dataList.length; index++) {
          const line = dataList[index];
          const lineItems = line.split(',');
          if (line !== '' && lineItems.length < 3) {
            this.message.error(this.i18n.translateLang('common.validator.wrongItems'));
            return;
          }
        }
        const line = dataList[1];
        const lineItems = line.split(',');
        for (let index = 0; index < lineItems.length; index++) {
          switch (lineItems[index]) {
            case 'type_name':
              indexs['type_name'] = index;
              continue;
            case 'type_id':
              indexs['type_id'] = index;
              continue;
            case 'key':
              indexs['key'] = index;
              continue;
            case 'zh_value':
              indexs['zh_value'] = index;
              continue;
            case 'en_value':
              indexs['en_value'] = index;
              continue;
            case 'ja_value':
              indexs['ja_value'] = index;
              continue;
            case 'th_value':
              indexs['th_value'] = index;
              continue;
          }
        }

        // 获取文件里面的所有多语言数据
        for (let index = 2; index < dataList.length; index++) {
          const line = dataList[index];
          if (line !== '') {
            const lineItems = line.split(',');
            const ld: DownLanguageData = {
              typeName: lineItems[indexs['type_name']],
              typeId: lineItems[indexs['type_id']],
              itemId: lineItems[indexs['key']],
              itemZhName: lineItems[indexs['zh_value']],
              itemEnName: lineItems[indexs['en_value']],
              itemJaName: lineItems[indexs['ja_value']],
              itemThName: lineItems[indexs['th_value']]
            };
            lanList.push(ld);
          }
        }

        // 多语言数据编辑
        this.selTypes = [];
        this.selFDs = [];
        this.selMDs = [];
        this.selOpts = [];
        this.selOps = [];
        this.selWs = [];
        this.downDataList = [];
        this.downloadCSVEdit();
        // 唯一判断
        for (let index = 0; index < lanList.length; index++) {
          const lan = lanList[index];

          const databaseUnique = this.checkDuplicated(lan, this.getNeedDupArea(lan, this.downDataList));
          if (!databaseUnique) {
            return;
          }

          const fileUnique = this.checkDuplicated(lan, this.getNeedDupArea(lan, lanList));
          if (!fileUnique) {
            return;
          }
        }
      } catch (error) {
        this.message.error(this.i18n.translateLang('common.validator.mFileReadErr'));
        return;
      }

      this.languageService.AddManyLanData(formData).then(async () => {
        this.message.success(this.i18n.translateLang('common.message.success.S_006'));
        this.init();
      });
    };
    reader.readAsBinaryString(file as any);
  }

  /**
   * @description: 唯一性检查
   */
  checkDuplicated(lan: DownLanguageData, listOfData: DownLanguageData[]): boolean {
    // 唯一检查
    let isUnique = true;
    if (listOfData) {
      listOfData.forEach(element => {
        if (element.itemJaName === lan.itemJaName && element.itemId !== lan.itemId && element.itemJaName !== '') {
          this.message.warning(`${this.i18n.translateLang('common.validator.jaDuplicated')}`);
          isUnique = false;
        }
        if (element.itemEnName === lan.itemEnName && element.itemId !== lan.itemId && element.itemEnName !== '') {
          this.message.warning(`${this.i18n.translateLang('common.validator.enDuplicated')}`);
          isUnique = false;
        }
        if (element.itemZhName === lan.itemZhName && element.itemId !== lan.itemId && element.itemZhName !== '') {
          this.message.warning(`${this.i18n.translateLang('common.validator.zhDuplicated')}`);
          isUnique = false;
        }
      });
    } else {
      return true;
    }

    return isUnique;
  }

  /**
   * @description: 获取唯一性限制区域
   */
  getNeedDupArea(lan: DownLanguageData, lans: DownLanguageData[]): DownLanguageData[] {
    // 同类型数据
    const typeLans = lans.filter(l => l.typeId === lan.typeId);
    // 获取唯一性限制区域
    var targetLans: DownLanguageData[] = [];
    switch (lan.typeId) {
      case 'fields':
      case 'mappings':
        const prefix = lan.itemId.substring(0, lan.itemId.indexOf('_'));
        targetLans = typeLans.filter(l => l.itemId.startsWith(prefix));
        return targetLans;
      case 'options':
        if (lan.itemId.includes('_')) {
          const prefix = lan.itemId.substring(0, lan.itemId.indexOf('_'));
          targetLans = typeLans.filter(l => l.itemId.startsWith(prefix));
          targetLans = targetLans.filter(l => l.itemId.includes('_'));
          return targetLans;
        } else {
          targetLans = typeLans.filter(l => l.itemId.includes('_') === false);
        }
        return targetLans;
      case 'workflows':
        if (lan.itemId.includes('menu')) {
          targetLans = typeLans.filter(l => l.itemId.includes('menu'));
        } else {
          targetLans = typeLans.filter(l => l.itemId.includes('menu') === false);
        }
        return targetLans;
      default:
        return typeLans;
    }
  }

  /**
   * @description: 上传选择框显示控制
   */
  showUpLoad() {
    this.showUp = true;
  }
}
