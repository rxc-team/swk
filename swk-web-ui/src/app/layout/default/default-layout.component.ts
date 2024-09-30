/*
 * @Description: 默认布局
 * @Author: RXC 呉見華
 * @Date: 2019-08-30 17:12:22
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2021-02-05 11:04:57
 */

import { differenceInCalendarDays, format, parse } from 'date-fns';
import * as _ from 'lodash';
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
// 第三方服务
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { forkJoin, Observable } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
// angular框架
import { Location } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { AllowService, AppService, DatastoreService, QueryService, ReportService, UserService, WorkflowService } from '@api';
// 自定义服务
import { AclService, I18NService, RouteStrategyService, ThemeService, TitleService, TokenStorageService, WebsocketService } from '@core';
import { Select, Store } from '@ngxs/store';
import {
  AddAsideMenu,
  AddQueryMenu,
  AsideMenuState,
  ChangeStatus,
  Message,
  MessageState,
  RemoveQureyMenu,
  ResetMenu,
  ResetQureyMenu,
  SetSliderCollapse,
  SettingInfoState,
  ThemeInfo,
  ThemeInfoState,
  RefreshMessage
} from '@store';

import { MessageService } from '../../api/message.service';

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
    private datastore: DatastoreService,
    private report: ReportService,
    private i18n: I18NService,
    private ws: WebsocketService,
    private activatedRoute: ActivatedRoute,
    private message: NzMessageService,
    private modal: NzModalService,
    private appService: AppService,
    private userService: UserService,
    private bs: NzBreakpointService,
    private store: Store,
    private themeService: ThemeService,
    private eventBus: NgEventBus,
    private tokenService: TokenStorageService,
    private wf: WorkflowService,
    private query: QueryService,
    private as: AllowService,
    private acl: AclService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
  ) {
    // 监听添加query菜单事件
    eventBus.on('menu:add-query').subscribe(() => {
      this.updateMenu();
    });

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

    this.store.dispatch(new ResetMenu());

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
  // head 菜单显示
  show = false;
  // 面包屑
  breadcrumb = '';
  // 是否返回
  canBack = false;
  confirmModal: NzModalRef;
  // 所有app选项
  appsOption: any[] = [];
  // 是否显示临时资产管理菜单
  isShowTemMenu = false;
  // 处理月度
  processData = '';

  // APP使用剩余日数表示关联变量
  today = new Date();
  expiredType = '';
  showExpired = false;
  daysRemain = 0;

  // menu缩放Flg
  isSmall = false;
  width = 0;
  userInfo: any = {};

  sizeMaps: Map<string, any> = new Map();
  datastoreChildren: any[] = [];
  datastoreChildrenExist = true
  reportChildren: any[] = [];
  reportChildrenExist = true
  queryChildren: any[] = [];
  queryChildrenExist = true
  datastoreloading = false;
  reportloading = false;
  queryloading = false;
  datastoreisRunning = false;
  reportisRunning = false;
  queryisRunning = false;

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
    this.store.dispatch(new RefreshMessage());
    await this.acl.init();
    try {
      // 当前APP情报设置&侧边菜单栏数据库动态菜单生成
      const jobs = [
        this.appService.getAppByID(this.userInfo.current_app, this.userInfo.customer_id),
        //this.datastore.getDatastores({ showInMenu: 'true' }),
        //this.report.getReports(),
        //this.wf.getWorkflows(),
        //this.query.getQueries(),
        this.as.checkAllow('journal')
      ];

      forkJoin(jobs)
        .toPromise()
        .then((data: any[]) => {
          if (data) {
            const appData = data[0];
            //const dsData = data[1];
            //const rpData = data[2];
            //const wfData = data[3];
            //const qyData = data[1];
            const showJournal = data[1];

            // 当前APP情报设置
            if (appData) {
              // 初期化
              this.expiredType = '';
              this.showExpired = false;
              this.daysRemain = 0;

              // 试用
              if (appData.is_trial) {
                this.showExpired = true;
                this.expiredType = 'trial';
                this.daysRemain = this.getValidDays(appData.end_time);
              } else {
                this.expiredType = 'formal';
                this.daysRemain = this.getValidDays(appData.end_time);
                if (this.daysRemain <= 30) {
                  this.showExpired = true;
                }
              }
            }

            if (appData.app_type === 'rent' && showJournal) {
              // 分录菜单设置
              const journalMenu = {
                level: 1,
                path: '/journal',
                title: 'menu.journalSetting',
                icon: 'account-book',
                open: false,
                selected: false,
                disabled: false,
                children: [
                  {
                    level: 2,
                    path: `/journal/list`,
                    title: `menu.journal`,
                    open: false,
                    selected: false,
                    disabled: false
                  },
                  {
                    level: 2,
                    path: `/journal/subjects`,
                    title: `menu.subject`,
                    open: false,
                    selected: false,
                    disabled: false
                  }
                ]
              };
              this.store.dispatch(new AddAsideMenu(journalMenu));
            }

            /* if (qyData) {
              qyData.forEach(element => {
                const child = {
                  level: 2,
                  path: `/datastores/${element.datastore_id}/list/queries/${element.query_id}`,
                  title: `${element.query_name}`,
                  extend: {
                    child: [
                      {
                        name: 'menu.deleteShortcut',
                        path: `/datastores/${element.datastore_id}/list/queries/${element.query_id}`,
                        type: 'query',
                        deleteId: element.query_id
                      }
                    ]
                  }
                };
                this.store.dispatch(new AddQueryMenu(child));
              });
            } else {
              const child = {
                level: 2,
                path: ``,
                title: 'menu.empty',
                disabled: true
              };
              this.store.dispatch(new AddQueryMenu(child));
            } */

            /* 
          // 审批菜单设置
          const wfMenu = {
            level: 1,
            path: '/approve',
            title: 'menu.approveTitle',
            icon: 'node-expand',
            open: false,
            selected: false,
            disabled: false,
            children: []
          };
          // 审批子菜单设置
          if (wfData) {
            const wfList = _.orderBy(wfData, ['created_at'], ['asc']);
            wfList.forEach(element => {
              if (element.is_valid) {
                const child = {
                  level: 2,
                  path: `/approve/${element.wf_id}/list`,
                  title: `${element.menu_name}`,
                  open: false,
                  selected: false,
                  disabled: true
                };
                wfMenu.children.push(child);
              }
            });

            this.sizeMaps[wfMenu.title] = {
              is_open: false,
              num: wfMenu.children.length ? wfMenu.children.length : 0
            };

            if (wfMenu.children.length === 0) {
              const child = {
                level: 2,
                path: ``,
                title: 'menu.empty',
                open: false,
                selected: false,
                disabled: true
              };
              wfMenu.children.push(child);
            }
          } else {
            const child = {
              level: 2,
              path: ``,
              title: 'menu.empty',
              open: false,
              selected: false,
              disabled: true
            };
            wfMenu.children.push(child);

            this.sizeMaps[wfMenu.title] = {
              is_open: false,
              num: 0
            };
          }

          this.store.dispatch(new AddAsideMenu(wfMenu)); */

            // 台账菜单设置
            /* const menu = {
              level: 1,
              path: '/datastores',
              title: 'menu.datastoreTitle',
              icon: 'database',
              open: false,
              selected: false,
              disabled: false,
              children: []
            }; */
            // 台账子菜单设置
            /*  if (dsData) {
               const dsList = _.orderBy(dsData, ['display_order', 'created_at'], ['asc']);
               dsList.forEach(element => {
                 const child = {
                   level: 2,
                   path: `/datastores/${element.datastore_id}/list`,
                   title: `${element.datastore_name}`,
                   open: false,
                   selected: false,
                   disabled: false
                 };
                 menu.children.push(child);
               });
 
               this.sizeMaps[menu.title] = {
                 is_open: false,
                 num: menu.children.length ? menu.children.length : 0
               };
             } else {
               const child = {
                 level: 2,
                 path: ``,
                 title: 'menu.empty',
                 open: false,
                 selected: false,
                 disabled: true
               };
               menu.children.push(child);
 
               this.sizeMaps[menu.title] = {
                 is_open: false,
                 num: 0
               };
             } */

            //this.store.dispatch(new AddAsideMenu(menu));

            // 报表菜单设置
            /* const rpMenu = {
              level: 1,
              path: '/report',
              title: 'menu.reportTitle',
              icon: 'table',
              open: false,
              selected: false,
              disabled: false,
              children: []
            }; */
            // 报表子菜单设置
            /* if (rpData) {
              const rpList = _.orderBy(rpData, ['created_at'], ['asc']);
              rpList.forEach(element => {
                const child = {
                  level: 2,
                  path: `/report/${element.report_id}/list`,
                  title: `${element.report_name}`,
                  open: false,
                  selected: false,
                  disabled: false
                };

                rpMenu.children.push(child);

                this.sizeMaps[rpMenu.title] = {
                  is_open: false,
                  num: rpMenu.children.length ? rpMenu.children.length : 0
                };
              });
            } else {
              const child = {
                level: 2,
                path: ``,
                title: 'menu.empty',
                open: false,
                selected: false,
                disabled: true
              };
              rpMenu.children.push(child);

              this.sizeMaps[rpMenu.title] = {
                is_open: false,
                num: 0
              };
            } */

            /*  this.store.dispatch(new AddAsideMenu(rpMenu)); */
          }
        });
    } catch (error) {
      this.router.navigateByUrl('login');
    }
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
   * @description: 标记系统通知消息为已读
   */
  async onCloseSysInfo(id: string) {
    this.store.dispatch(new ChangeStatus(id));
  }

  /**
   * @description: 侧边栏伸缩事件 下拉时获取快捷方式
   */
  openChange(open: boolean, menu: any) {
    if (!this.datastoreisRunning) {
      if (menu.title == "menu.datastoreTitle" && this.datastoreChildrenExist) {
        this.datastoreisRunning = true
        this.datastoreloading = true
        this.datastore.getDatastores({ showInMenu: 'true' }).then((dsData: any[]) => {
          if (dsData) {
            const dsList = _.orderBy(dsData, ['display_order', 'created_at'], ['asc']);
            dsList.forEach(element => {
              const child = {
                level: 2,
                path: `/datastores/${element.datastore_id}/list`,
                title: `${element.datastore_name}`,
                open: false,
                selected: false,
                disabled: false
              };
              this.datastoreChildren.push(child);
              this.cdr.detectChanges();
              this.datastoreChildrenExist = false
              this.datastoreloading = false
              this.datastoreisRunning = false
            });
          } else {
            const child = {
              level: 2,
              path: ``,
              title: 'menu.empty',
              open: false,
              selected: false,
              disabled: true
            };
            this.datastoreChildren.push(child);
            this.cdr.detectChanges();
            this.datastoreChildrenExist = false
            this.datastoreloading = false
            this.datastoreisRunning = false
          }
        });
      }
    }
    if (!this.reportisRunning) {
      if (menu.title == "menu.reportTitle" && this.reportChildrenExist) {
        this.reportisRunning = true
        this.reportloading = true
        this.report.getReports().then((rpData: any[]) => {
          if (rpData) {
            const rpList = _.orderBy(rpData, ['created_at'], ['asc']);
            rpList.forEach(element => {
              const child = {
                level: 2,
                path: `/report/${element.report_id}/list`,
                title: `${element.report_name}`,
                open: false,
                selected: false,
                disabled: false
              };
              this.reportChildren.push(child);
              this.cdr.detectChanges();
              this.reportChildrenExist = false
              this.reportloading = false
              this.reportisRunning = false
            });
          } else {
            const child = {
              level: 2,
              path: ``,
              title: 'menu.empty',
              open: false,
              selected: false,
              disabled: true
            };
            this.reportChildren.push(child);
            this.cdr.detectChanges();
            this.reportChildrenExist = false
            this.reportloading = false
            this.reportisRunning = false
          }
        });
      }
    }
  }

  //下拉时获取快捷方式
  openChangeQuery() {
    if (!this.queryisRunning) {
      if (this.queryChildrenExist) {
        this.queryisRunning = true
        this.queryloading = true
        this.query.getQueries().then((qyData: any[]) => {
          if (qyData) {
            qyData.forEach(element => {
              const child = {
                level: 2,
                path: `/datastores/${element.datastore_id}/list/queries/${element.query_id}`,
                title: `${element.query_name}`,
                extend: {
                  child: [
                    {
                      name: 'menu.deleteShortcut',
                      path: `/datastores/${element.datastore_id}/list/queries/${element.query_id}`,
                      type: 'query',
                      deleteId: element.query_id
                    }
                  ]
                }
              };
              this.queryChildren.push(child);
              this.cdr.detectChanges();
              this.queryChildrenExist = false
              this.queryisRunning = false
              this.queryloading = false
            });
          } else {
            const child = {
              level: 2,
              path: ``,
              title: 'menu.empty',
              disabled: true
            };
            this.queryChildren.push(child);
            this.cdr.detectChanges();
            this.queryChildrenExist = false
            this.queryisRunning = false
            this.queryloading = false
          }
        });
      }
    }
  }

  /**
   * @description: APP切换事件
   */
  async appChange() {
    this.datastoreChildren = [];
    this.reportChildren = [];
    this.queryChildren = [];
    this.datastoreChildrenExist = true
    this.reportChildrenExist = true
    this.queryChildrenExist = true
    this.datastoreloading = false;
    this.reportloading = false;
    // 清空当前动态menu
    this.store.dispatch(new ResetMenu()).subscribe(async () => {
      // 重新设置动态menu
      await this.init();
      // 跳转到首页
      this.router.navigateByUrl(`/home`);
    });
  }

  /**
   * @description: 更新菜单
   */
  async updateMenu() {
    // 获取Query
    this.query.getQueries().then(data => {
      if (data) {
        // 有数据时删除empty菜单
        this.store.dispatch(new ResetQureyMenu());
        data.forEach(element => {
          const child = {
            level: 2,
            path: `/datastores/${element.datastore_id}/list/queries/${element.query_id}`,
            title: `${element.query_name}`,
            extend: {
              child: [
                {
                  name: 'menu.deleteShortcut',
                  path: `/datastores/${element.datastore_id}/list/queries/${element.query_id}`,
                  type: 'query',
                  deleteId: element.query_id
                }
              ]
            }
          };
          this.store.dispatch(new AddQueryMenu(child));
        });
      } else {
        const child = {
          level: 2,
          path: ``,
          title: 'menu.empty',
          disabled: true
        };
        this.store.dispatch(new AddQueryMenu(child));
      }
    });
  }

  /**
   * @description: 画面初始化处理
   */
  async ngOnInit() {
    this.show = true;

    // 通过ID连接websocket服务
    this.ws.connect(this.userInfo.id);

    const jobs = [this.userService.getUserByID({ type: '0', user_id: this.userInfo.id }), this.appService.getUserApps()];

    this.isCollapsed$.subscribe(data => {
      this.isCollapsed = data;
    });

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
            this.i18n.serchLanguage(userData.language);
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
    // 清除路由缓存
    RouteStrategyService.deleteRouteSnapshot(path);
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
    // this.store.dispatch(new SetSliderCollapse(isColl));
  }

  delete(deleteId: string, path: string, type: string) {
    switch (type) {
      case 'query':
        this.deleteQuery(deleteId, path);
        break;

      default:
        break;
    }
  }

  /**
   * @description: 删除query
   */
  deleteQuery(deleteId: string, path: string): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: `${this.i18n.translateLang('common.message.confirm.deleteShortcutConfirm')}`,
      nzContent: `${this.i18n.translateLang('common.message.confirm.deleteTwiceConfirm')}`,
      nzOnOk: () =>
        this.query.deleteQuery(deleteId).then(res => {
          if (res) {
            this.message.success(this.i18n.translateLang('common.message.success.S_003'));
            this.router.navigate(['/home']);
            this.store.dispatch(new RemoveQureyMenu(path));
          }
        })
    });
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
