/*
 * @Description: 语言服务
 * @Author: RXC 呉見華
 * @Date: 2019-08-05 17:53:29
 * @LastEditors  : RXC 呉見華
 * @LastEditTime : 2020-01-07 14:56:48
 */
import { en_US, ja_JP, NzI18nService, zh_CN, th_TH } from 'ng-zorro-antd/i18n';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { registerLocaleData } from '@angular/common';
import ngEn from '@angular/common/locales/en';
import ngJa from '@angular/common/locales/ja';
import ngZh from '@angular/common/locales/zh';
import ngTh from '@angular/common/locales/th';
import { Injectable } from '@angular/core';
import { LanguageService } from '@api';
import { TranslateService } from '@ngx-translate/core';

import { TokenStorageService } from '../services/token.service';

// 语言接口格式
interface LangData {
  text: string;
  ng: any;
  zorro: any;
  abbr: string;
}

// 默认语言
const DEFAULT = 'zh-CN';
// 语言列表（目前支持中日英三国语言）
const LANGS: { [key: string]: LangData } = {
  'zh-CN': {
    text: '简体中文',
    ng: ngZh,
    zorro: zh_CN,
    abbr: '🇨🇳'
  },
  'ja-JP': {
    text: '日本語',
    ng: ngJa,
    zorro: ja_JP,
    abbr: '🇯🇵'
  },
  'en-US': {
    text: 'English',
    ng: ngEn,
    zorro: en_US,
    abbr: '🇬🇧'
  },
  'th-TH': {
    text: 'ไทย',
    ng: ngTh,
    zorro: th_TH,
    abbr: '🇹🇭'
  }
};

@Injectable({ providedIn: 'root' })
export class I18NService {
  // 默认语言
  private _default = DEFAULT;
  // 语言改变事件
  private change$ = new BehaviorSubject<string>(null);
  // 语言列表
  private _langs = Object.keys(LANGS).map(code => {
    const item = LANGS[code];
    return { code, text: item.text, abbr: item.abbr };
  });

  constructor(
    private nzI18nService: NzI18nService,
    private tokenService: TokenStorageService,
    private languageService: LanguageService,
    private translate: TranslateService
  ) {
    this.initLangData();
  }
  /**
   * @description: 初始化语言数据
   */
  private initLangData() {
    const lang = this.tokenService.getUserLang();
    try {
      if (lang) {
        const defaultLan = lang;
        // `@ngx-translate/core` 预先知道支持哪些语言
        const lans = this._langs.map(item => item.code);
        this.translate.addLangs(lans);

        this._default = lans.find(n => n === defaultLan) ? defaultLan : lans[0];
        this.translate.setDefaultLang(this._default);
        this.translate.use(defaultLan.match(/ja-JP|en-US|zh-CN|th-TH/) ? defaultLan : DEFAULT);
        this.updateLangData(this._default);
        this.updateDynamicLangData(this._default);
      } else {
        const defaultLan = this.getBrowserLang();
        // `@ngx-translate/core` 预先知道支持哪些语言
        const lans = this._langs.map(item => item.code);
        this.translate.addLangs(lans);

        this._default = lans.find(n => n === defaultLan) ? defaultLan : lans[0];
        this.translate.use(defaultLan.match(/ja-JP|en-US|zh-CN|th-TH/) ? defaultLan : DEFAULT);
        this.updateLangData(this._default);
        this.updateDynamicLangData(this._default);
      }
    } catch (error) {
      const defaultLan = this.getBrowserLang();
      // `@ngx-translate/core` 预先知道支持哪些语言
      const lans = this._langs.map(item => item.code);
      this.translate.addLangs(lans);

      this._default = lans.find(n => n === defaultLan) ? defaultLan : lans[0];
      this.translate.use(defaultLan.match(/ja-JP|en-US|zh-CN|th-TH/) ? defaultLan : DEFAULT);
      this.updateLangData(this._default);
    }
  }

  /**
   * @description: 获取浏览器语言
   * @return: 浏览器语言
   */
  private getBrowserLang() {
    let browserLang = this.translate.getBrowserLang();
    switch (browserLang) {
      case 'ja':
        browserLang = `${browserLang}-JP`;
        break;
      case 'en':
        browserLang = `${browserLang}-US`;
        break;
      case 'zh':
        browserLang = `${browserLang}-CN`;
        break;
      case 'th':
        browserLang = `${browserLang}-TH`;
        break;
      case 'zh-CN':
        browserLang = browserLang;
        break;
      default:
        break;
    }
    return browserLang;
  }

  /**
   * @description: 更新语言信息
   * @param string 语言cd
   */
  private updateLangData(lang: string) {
    const item = LANGS[lang];
    registerLocaleData(item.ng);
    this.nzI18nService.setLocale(item.zorro);
  }

  get change(): Observable<string> {
    return this.change$.asObservable().pipe(filter(w => w != null));
  }

  /**
   * @description: 获取动态语言数据，并更新
   */
  async updateDynamicLangData(lang?: string) {
    const token = this.tokenService.getToken();
    if (token) {
      // 获取语言
      await this.languageService.getLanguageData(lang || this.currentLang).then(langData => {
        this.translate.setTranslation(lang || this.currentLang, langData, true);
      });
    }
  }

  /** 切换语言 */
  async switchLanguage(lang: string) {
    const lans = this._langs.map(item => item.code);
    lang = lang ? lang : lans[0];
    await this.use(lang);
    // 设置语言到store中
    this.tokenService.updateUser({ language: lang });
    await this.updateDynamicLangData(lang);
  }

  async serchLanguage(lang: string) {
    const lans = this._langs.map(item => item.code);
    lang = lang ? lang : lans[0];
    await this.use(lang);
    await this.updateDynamicLangData(lang);
  }

  async use(lang: string) {
    lang = lang || this.translate.getDefaultLang();
    if (this.currentLang === lang) {
      return;
    }
    this.updateLangData(lang);
    await this.translate.use(lang).subscribe(() => this.change$.next(lang));
  }

  /** 获取语言列表 */
  getLangs() {
    return this._langs;
  }

  /** 翻译 */
  translateLang(key: string, interpolateParams?: Object) {
    return this.translate.instant(key, interpolateParams);
  }

  /** 默认语言 */
  get defaultLang() {
    return this._default;
  }

  /** 当前语言 */
  get currentLang() {
    return this.translate.currentLang || this.translate.getDefaultLang() || this._default;
  }
}
