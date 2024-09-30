/*
 * @Description: 选项--多语言管理
 * @Author: RXC 陳平
 * @Date: 2020-06-15 15:25:13
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-09-14 14:58:32
 */

import * as _ from 'lodash';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OptionService } from '@api';
import { TokenStorageService, I18NService } from '@core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

interface LanguageData {
  itemId: string;
  itemName: string;
}

@Component({
  selector: 'app-languge-options',
  templateUrl: './languge-options.component.html'
})
export class LangugeOptionsComponent implements OnInit, OnChanges {
  langCols = [
    {
      title: 'page.language.chinese',
      key: 'zh-CN',
      width: '200px'
    },
    {
      title: 'page.language.english',
      key: 'en-US',
      width: '200px'
    },
    {
      title: 'page.language.japanese',
      key: 'ja-JP',
      width: '200px'
    },
    {
      title: 'page.language.thai',
      key: 'th-TH',
      width: '200px'
    }
  ];

  // 语言数据
  @Input() zhData: any = {};
  @Input() enData: any = {};
  @Input() jaData: any = {};
  @Input() thData: any = {};
  // 当前APP
  @Input() appId: string;
  // 子页面调用父页面的方法
  @Output() saveEdit = new EventEmitter<any>();

  // 一览数据
  editCache: { [key: string]: any } = {};
  listOfData: LanguageData[] = [];
  mainLangData: LanguageData[] = [];
  langMap: { [key: string]: LanguageData[] } = {};
  // 所属项目
  subProject = 'options';

  // 是否没有变更
  isUnChanged = true;

  // 检索表单
  seachForm: FormGroup;

  optionGroups: any[] = [];
  // 弹出框组件对象
  confirmModal: NzModalRef;

  constructor(
    private fb: FormBuilder,
    private optionService: OptionService,
    private token: TokenStorageService,
    private modal: NzModalService,
    private i18n: I18NService
  ) {
    this.seachForm = this.fb.group({
      optionType: ['optionGroup', []],
      optionGroup: ['', []]
    });
  }
  // 当前main语言
  langCd = this.token.getUserLang();
  // 选择更新的语言
  currentLang = '';

  ngOnChanges(changes: SimpleChanges): void {
    this.init();
  }

  /**
   * @description: 画面初期化処理
   */
  ngOnInit() {
    this.init();
  }

  /**
   * @description: 初期化处理
   */
  async init() {
    await this.getOptionGroupList();
    await this.search();
  }

  /**
   * @description: 选项卡下拉表单取得事件
   */
  async getOptionGroupList() {
    await this.optionService.getOptions(this.appId).then((data: any[]) => {
      if (data) {
        this.optionGroups = data;
        this.seachForm.controls.optionGroup.setValue(this.optionGroups[0].option_id);
      } else {
        this.optionGroups = [];
      }
    });
  }

  /**
   * @description: 多语言数据检索
   */
  async search() {
    // 获取选项多语言数据
    this.listOfData = [];
    this.editCache = {};
    // 中文
    if (this.zhData.apps && this.zhData.apps[this.appId] && this.zhData.apps[this.appId][this.subProject]) {
      // tslint:disable-next-line:forin
      for (const key in this.zhData.apps[this.appId][this.subProject]) {
        const ld: LanguageData = {
          itemId: key,
          itemName: ''
        };
        ld.itemName = this.zhData.apps[this.appId][this.subProject][key];
        this.listOfData.push(ld);
      }
      this.langMap['zh-CN'] = this.listOfData;
      this.listOfData = [];
    } else {
      this.langMap['zh-CN'] = this.listOfData;
      this.listOfData = [];
    }
    // 日文
    if (this.jaData.apps && this.jaData.apps[this.appId] && this.jaData.apps[this.appId][this.subProject]) {
      // tslint:disable-next-line:forin
      for (const key in this.jaData.apps[this.appId][this.subProject]) {
        const ld: LanguageData = {
          itemId: key,
          itemName: ''
        };
        ld.itemName = this.jaData.apps[this.appId][this.subProject][key];
        this.listOfData.push(ld);
      }
      this.langMap['ja-JP'] = this.listOfData;
      this.listOfData = [];
    } else {
      this.langMap['ja-JP'] = this.listOfData;
      this.listOfData = [];
    }
    // 英文
    if (this.enData.apps && this.enData.apps[this.appId] && this.enData.apps[this.appId][this.subProject]) {
      // tslint:disable-next-line:forin
      for (const key in this.enData.apps[this.appId][this.subProject]) {
        const ld: LanguageData = {
          itemId: key,
          itemName: ''
        };
        ld.itemName = this.enData.apps[this.appId][this.subProject][key];
        this.listOfData.push(ld);
      }
      this.langMap['en-US'] = this.listOfData;
      this.listOfData = [];
    } else {
      this.langMap['en-US'] = this.listOfData;
      this.listOfData = [];
    }
    // 泰文
    if (this.thData.apps && this.thData.apps[this.appId] && this.thData.apps[this.appId][this.subProject]) {
      // tslint:disable-next-line:forin
      for (const key in this.thData.apps[this.appId][this.subProject]) {
        const ld: LanguageData = {
          itemId: key,
          itemName: ''
        };
        ld.itemName = this.thData.apps[this.appId][this.subProject][key];
        this.listOfData.push(ld);
      }
      this.langMap['th-TH'] = this.listOfData;
      this.listOfData = [];
    } else {
      this.langMap['th-TH'] = this.listOfData;
      this.listOfData = [];
    }

    const radioOptionValue = this.seachForm.get('optionType').value;
    const optionGroupId = this.seachForm.get('optionGroup').value;

    // 选项组筛选
    if (radioOptionValue === 'optionGroup') {
      this.mainLangData = this.langMap[this.langCd].filter(d => d.itemId.includes('_') === false);
      this.updateEditCache(this.currentLang, '');
    } else if (radioOptionValue === 'option') {
      this.mainLangData = this.langMap[this.langCd].filter(d => d.itemId.startsWith(optionGroupId));
      this.mainLangData = this.mainLangData.filter(d => d.itemId.includes('_'));
      this.updateEditCache(this.currentLang, optionGroupId);
    }
  }

  /**
   * @description: 数据显示控制处理
   */
  updateEditCache(lang: string, optionGroupId: string): void {
    if (this.langMap[lang]) {
      if (lang != '' && optionGroupId == '') {
        this.listOfData = this.langMap[lang].filter(d => d.itemId.includes('_') === false);
      } else if (lang != '' && optionGroupId != '') {
        this.listOfData = this.langMap[lang].filter(d => d.itemId.startsWith(optionGroupId));
        this.listOfData = this.listOfData.filter(d => d.itemId.includes('_'));
      } else {
        this.listOfData = [];
      }
    } else {
      this.listOfData = [];
    }
    // 以main语言为主重新编辑listOfData数据
    if (this.listOfData) {
      this.mainLangData.forEach(it => {
        let data = this.listOfData.find(item => item.itemId === it.itemId);
        if (!data) {
          const ld: LanguageData = {
            itemId: it.itemId,
            itemName: ''
          };
          this.listOfData.push(ld);
        }
      });
    } else {
      this.mainLangData.forEach(it => {
        const ld: LanguageData = {
          itemId: it.itemId,
          itemName: ''
        };
        this.listOfData.push(ld);
      });
    }
    // 重设当前修改语言的数据
    this.langMap[this.currentLang] = this.listOfData;
    this.listOfData.forEach(item => {
      this.editCache[item.itemId] = {
        data: { ...item }
      };
    });
  }

  /**
   * @description: 切换语言
   */
  changeLang(lang: string) {
    // 记录修改前的语言key
    const beforeLang = this.currentLang;
    // 无更改时，直接切换，否则提示保存
    if (lang) {
      this.currentLang = lang;
    } else {
      this.currentLang = '';
    }
    const radioOptionValue = this.seachForm.get('optionType').value;
    const optionGroupId = this.seachForm.get('optionGroup').value;
    if (this.isUnChanged) {
      // 选项组筛选
      if (radioOptionValue === 'optionGroup') {
        this.updateEditCache(this.currentLang, '');
      } else if (radioOptionValue === 'option') {
        this.updateEditCache(this.currentLang, optionGroupId);
      }
    } else {
      this.confirmModal = this.modal.confirm({
        nzTitle: `${this.i18n.translateLang('common.message.confirm.languageSaveTitle')}`,
        nzContent: `${this.i18n.translateLang('common.message.confirm.languageSaveContent')}`,
        nzOnOk: async () => {
          // 保存当前修改的语言数据
          this.getSaveEdit(beforeLang);
          // 选项组筛选
          if (radioOptionValue === 'optionGroup') {
            this.updateEditCache(this.currentLang, '');
          } else if (radioOptionValue === 'option') {
            this.updateEditCache(this.currentLang, optionGroupId);
          }
        },
        nzOnCancel: async () => {
          this.currentLang = beforeLang;
        }
      });
    }
  }

  /**
   * @description: input输入变更事件
   */
  inputValueChange(): void {
    this.checkIsUnChanged();
  }

  /**
   * @description: 检查是否有修改
   */
  checkIsUnChanged(): void {
    for (let index = 0; index < this.listOfData.length; index++) {
      const item = this.listOfData[index];
      const newItem = this.editCache[item.itemId].data;
      if (newItem.itemName !== item.itemName) {
        this.isUnChanged = false;
        break;
      } else {
        this.isUnChanged = true;
      }
    }
  }

  /**
   * @description: 保存编辑
   */
  SaveEdit() {
    this.getSaveEdit(this.currentLang);
  }
  /**
   * @description: 保存数据
   */
  async getSaveEdit(language: string) {
    var itemIds: string[] = [];
    for (const key in this.editCache) {
      if (Object.prototype.hasOwnProperty.call(this.editCache, key)) {
        const element = this.editCache[key];
        itemIds.push(element.data.itemId);
      }
    }
    this.saveEdit.emit({
      ids: itemIds,
      listOfData: this.langMap,
      editCache: this.editCache,
      subProject: this.subProject,
      lang: language
    });
    this.isUnChanged = true;
    this.search();
  }
}
