/*
 * @Description: 启动服务管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-23 15:21:06
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2019-09-04 16:56:40
 */
import { NzIconService } from 'ng-zorro-antd/icon';
import { Observable, zip } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Select, Store } from '@ngxs/store';
import { SetAsideMenu, ThemeInfo, ThemeInfoState } from '@store';

import { I18NService } from '../i18n/i18n.service';
import { ThemeService } from '../services/theme.service';

/**
 * 用于应用启动时
 * 一般用来获取应用所需要的基础数据等
 */
@Injectable()
export class StartupService {
  // Select 当前的主题
  @Select(ThemeInfoState.getThemeInfo) theme$: Observable<ThemeInfo>;

  constructor(
    iconSrv: NzIconService,
    private store: Store,
    private translate: TranslateService,
    private i18n: I18NService,
    private themeService: ThemeService,
    private httpClient: HttpClient
  ) {
    // 加载字体
    iconSrv.fetchFromIconfont({
      scriptUrl: 'assets/iconfont/font.js'
    });
  }

  /**
   * @description: 加载事件
   */
  load(): Promise<any> {
    return new Promise(resolve => {
      zip(
        // 获取程序的固定信息
        this.httpClient.get('assets/app-data.json'),
        // 获取主题信息
        this.theme$
      )
        .pipe(
          // 接收其他拦截器后产生的异常消息
          catchError(([appData, theme]) => {
            resolve(null);
            return [appData, theme];
          })
        )
        .subscribe(
          ([appData, theme]) => {
            // setting language data
            this.translate.setDefaultLang(this.i18n.defaultLang);
            // 初始化左侧菜单
            this.store.dispatch(new SetAsideMenu(appData.slideMenu));

            // 初始化主题系统
            this.themeService.changeTheme(theme.name);
          },
          () => {},
          () => {
            resolve(null);
          }
        );
    });
  }
}
