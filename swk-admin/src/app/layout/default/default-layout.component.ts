/*
 * @Description: 默认布局控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-06-04 14:35:36
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-08-19 14:09:58
 */

import { differenceInCalendarDays, format, parse } from 'date-fns';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { forkJoin, Observable } from 'rxjs';
import { filter, map, mergeMap, take } from 'rxjs/operators';

import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { AppService, UserService } from '@api';
import { CommonService, I18NService, RouteStrategyService, ThemeService, TitleService, TokenStorageService, WebsocketService } from '@core';
import { Select, Store } from '@ngxs/store';
import {
  AsideMenuState,
  ChangeStatus,
  Message,
  MessageState,
  SelectAsideMenu,
  SetSliderCollapse,
  SettingInfoState,
  ThemeInfo,
  ThemeInfoState
} from '@store';

import { MessageService } from '../../api/message.service';

@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.less']
})
export class DefaultLayoutComponent implements OnInit {
  /**
   * @description: 构造函数
   */
  constructor(
    private router: Router,
    private title: TitleService,
    private location: Location,
    private appService: AppService,
    private i18n: I18NService,
    private userService: UserService,
    private common: CommonService,
    private ws: WebsocketService,
    private themeService: ThemeService,
    private activatedRoute: ActivatedRoute,
    private bs: NzBreakpointService,
    private tokenService: TokenStorageService,
    private store: Store,
    private messageService: MessageService
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

  // 收缩
  isCollapsed = false;
  show = false;
  // 面包屑
  breadcrumb = '';
  // 是否返回
  canBack = false;
  // 所有app选项
  appsOption: any[] = [];
  // menu缩放Flg
  isSmall = false;

  // APP使用剩余日数表示关联变量
  expiredType = '';
  showExpired = false;
  daysRemain = 0;

  userInfo: any = {};

  // Select 当前的侧边栏菜单信息
  @Select(AsideMenuState.getAsideMenuList) asideMenu$: Observable<any>;

  // Select 当前的主题名称
  @Select(ThemeInfoState.getThemeInfo) currentTheme$: Observable<ThemeInfo>;

  // Select 当前的是否收缩侧边栏
  @Select(SettingInfoState.getSliderCollapse) isCollapsed$: Observable<boolean>;

  // Select 当前的侧边栏宽度
  @Select(SettingInfoState.getSliderWidth) sliderWidth$: Observable<number>;

  // Select 系统消息
  @Select(MessageState.getUnreadUpdateMessages) unReadUpdateMessages$: Observable<Message[]>;

  async init() {
    // 当前APP试用或者使用期限情报展示判断编辑
    this.expiredShow();
    // 加载共通数据
    this.common.load();
    // 更新菜单选中效果
    this.store.dispatch(new SelectAsideMenu(this.getUrl(this.activatedRoute.snapshot)));
  }

  /**
   * @description: 当前APP试用或者使用期限情报展示判断编辑
   */
  expiredShow() {
    // 获取当前APP情报
    if (this.userInfo.current_app) {
      this.appService.getAppByID(this.userInfo.current_app, this.userInfo.customer_id).then(res => {
        if (res) {
          // 初期化
          this.showExpired = false;
          this.daysRemain = 0;

          // 试用
          if (res.is_trial) {
            this.showExpired = true;
            this.expiredType = 'trial';
            this.daysRemain = this.getValidDays(res.end_time);
          } else {
            this.expiredType = 'formal';
            this.daysRemain = this.getValidDays(res.end_time);
            if (this.daysRemain <= 30) {
              this.showExpired = true;
            }
          }
        }
      });
    }
  }

  /**
   * @description: 标记系统通知消息为已读
   */
  async onCloseSysInfo(id: string) {
    this.store.dispatch(new ChangeStatus(id));
  }

  /**
   * @description: 获取有效天数
   */
  getValidDays(endTime: string): number {
    const startDate = new Date();
    const endDate = parse(endTime, 'yyyy-MM-dd', new Date());
    return differenceInCalendarDays(endDate, startDate);
  }

  /**
   * @description: APP切换事件
   */
  async appChange() {
    // 重新初始化
    await this.init();
    // 清除路由缓存
    RouteStrategyService.clear();
    // 跳转到首页
    this.router.navigateByUrl(`/home`);
  }

  /**
   * @description: 画面初始化处理
   */
  async ngOnInit() {
    this.show = true;

    this.isCollapsed$.subscribe(data => {
      this.isCollapsed = data;
    });

    // 通过ID连接websocket服务
    this.ws.connect(this.userInfo.id);

    const jobs = [this.userService.getUserByID({ type: '0', user_id: this.userInfo.id }), this.appService.getUserApps()];

    forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const userData = data[0];
          const appData = data[1];
          // 设置用户信息

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
              notice_email: userData.notice_email,
              current_app: app,
              signature: userData.signature,
              roles: userData.roles,
              apps: userData.apps,
              language: userData.language,
              theme: userData.theme,
              domain: userData.domain,
              logo: userData.logo,
              customer_name: userData.customer_name,
              customer_id: userData.customer_id,
              timezone: userData.timezone ? userData.timezone : '210'
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
          // 设置app选项
          if (appData) {
            this.appsOption = appData;
            this.appsOption.forEach(app => {
              const endDate = new Date(app.end_time).getTime();
              const nowDate = new Date(format(new Date(), 'yyyy-MM-dd')).getTime();
              if (nowDate > endDate) {
                app['isValid'] = false;
              } else {
                app['isValid'] = true;
              }
            });
          } else {
            this.appsOption = [];
          }
        }
      });

    // 初始化数据
    await this.init();
    this.show = false;
  }

  /**
   * @description: 导航到某一路径
   * @param string 路径
   */
  tabs(path: string) {
    if (path === '') {
      return;
    }
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
