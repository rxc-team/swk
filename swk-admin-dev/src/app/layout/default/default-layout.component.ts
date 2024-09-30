/*
 * @Description: ディフォルトレイアウト設定コントローラー
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:40
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-08-17 14:10:20
 */
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { forkJoin, Observable } from 'rxjs';
import { filter, map, mergeMap, take } from 'rxjs/operators';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { AuthService, UserService } from '@api';
import {
    CommonService, I18NService, ThemeService, TitleService, TokenStorageService, WebsocketService
} from '@core';
import { Select, Store } from '@ngxs/store';
import {
    AsideMenuState, SetSliderCollapse, SettingInfoState, ThemeInfo, ThemeInfoState
} from '@store';

@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.less']
})
export class DefaultLayoutComponent implements OnInit {
  constructor(
    private router: Router,
    private title: TitleService,
    private location: Location,
    private i18n: I18NService,
    private ws: WebsocketService,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private bs: NzBreakpointService,
    private themeService: ThemeService,
    private tokenService: TokenStorageService,
    private commonService: CommonService,
    private message: NzMessageService,
    private store: Store
  ) {
    bs.subscribe({
      xs: '480px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1600px',
      xxl: '1600px'
    }).subscribe(data => {
      if (data === 'xs') {
        this.isSmall = true;
        this.store.dispatch(new SetSliderCollapse('hidde'));
      } else if (data === 'sm' || data === 'md') {
        this.isSmall = false;
        this.store.dispatch(new SetSliderCollapse('middle'));
      } else {
        this.isSmall = false;
        this.store.dispatch(new SetSliderCollapse('default'));
      }
    });
    // 路由事件
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data)
      )
      .subscribe(event => {
        // 设定面包屑
        const bc = event.breadcrumb;
        if (bc !== 'home') {
          this.breadcrumb = bc;
        } else {
          this.breadcrumb = '';
        }
        // 设定返回
        this.canBack = event.canBack;
        // 设置title
        this.title.setTitle();
      });

    this.userInfo = this.tokenService.getUser();
    this.tokenService.getUserInfo().subscribe(data => {
      if (data) {
        this.userInfo = data;
      }
    });
  }

  // menu缩放Flg
  isSmall = false;
  // 收缩
  isCollapsed = false;

  show = false;
  // 面包屑
  breadcrumb = '';
  // 是否返回
  canBack = false;
  confirmModal: NzModalRef;

  userInfo: any = {};

  // Select 当前的侧边栏菜单信息
  @Select(AsideMenuState.getAsideMenuList) asideMenu$: Observable<any>;

  // Select 当前的主题名称
  @Select(ThemeInfoState.getThemeInfo) currentTheme$: Observable<ThemeInfo>;

  // Select 当前的是否收缩侧边栏
  @Select(SettingInfoState.getSliderCollapse) isCollapsed$: Observable<boolean>;

  // Select 当前的侧边栏宽度
  @Select(SettingInfoState.getSliderWidth) sliderWidth$: Observable<number>;

  /**
   * @description: 画面初始化处理
   */
  async ngOnInit() {
    this.isCollapsed$.subscribe(data => {
      this.isCollapsed = data;
    });

    this.ws.connect(this.userInfo.id);
    await this.userService.getUserByID(this.userInfo.id).then(userData => {
      if (userData) {
        let app = '';
        if (userData.current_app) {
          app = userData.current_app;
        } else {
          app = userData.apps[0];
        }

        const userInfo = {
          id: userData.user_id,
          name: userData.user_name,
          avatar: userData.avatar,
          email: userData.email,
          current_app: app,
          signature: userData.signature,
          roles: userData.roles,
          apps: userData.apps,
          language: userData.language,
          theme: userData.theme,
          domain: userData.domain,
          timezone: userData.timezone ? userData.timezone : 'Asia/Tokyo'
        };

        this.tokenService.saveUser(userInfo);

        if (userData.theme) {
          this.themeService.changeTheme(userData.theme);
        } else {
          // 重置主题
          this.themeService.changeTheme('default');
        }
        // 设置语言
        this.i18n.switchLanguage(userData.language);
      }
    });
    // 初始化基本数据
    this.commonService.load();
  }

  /**
   * @description: 导航到某一路径
   * @param string 路径
   */
  tabs(path: string) {
    this.router.navigate([path]);
  }

  /**
   * @description: 返回上一路由
   */
  back() {
    this.location.back();
  }

  /**
   * @description: 切换收缩侧边栏
   * @param boolean 是否收缩
   */
  toggle() {
    if (this.isSmall) {
      if (this.isCollapsed) {
        this.store.dispatch(new SetSliderCollapse('hidde'));
      } else {
        this.store.dispatch(new SetSliderCollapse('middle'));
      }
    } else {
      if (this.isCollapsed) {
        this.store.dispatch(new SetSliderCollapse('default'));
      } else {
        this.store.dispatch(new SetSliderCollapse('middle'));
      }
    }
  }

  /**
   * @description: 根据快照获取URL地址
   * @param ActivatedRouteSnapshot 路由
   * @return: URL地址
   */
  getUrl(route: ActivatedRouteSnapshot): string {
    let next = this.getTruthRoute(route);
    const segments = [];
    while (next) {
      segments.push(next.url.join('/'));
      next = next.parent;
    }
    const url =
      '/' +
      segments
        .filter(i => i)
        .reverse()
        .join('/');
    return url;
  }

  /**
   * @description: 获取下一个子路由
   * @param ActivatedRouteSnapshot 路由
   * @return: 返回下一个子路由
   */
  getTruthRoute(route: ActivatedRouteSnapshot) {
    let next = route;
    while (next.firstChild) {
      next = next.firstChild;
    }
    return next;
  }
}
