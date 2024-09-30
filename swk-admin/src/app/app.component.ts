/*
 * @Description: app控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-04-22 10:19:56
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2020-04-27 13:30:27
 */

import { NgEventBus } from 'ng-event-bus';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime } from 'rxjs/operators';

import { Location } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '@api';
import {
    CommonService, HttpCancelService, HttpSpinService, I18NService, RouteStrategyService,
    TitleService, TokenStorageService
} from '@core';
import { Store } from '@ngxs/store';
import { ClearMessage } from '@store';

import { AppValidSelectComponent } from './layout/valid/app-valid-select.component';

@Component({
  selector: 'app-root',
  template: `
    <ngx-loading-bar [includeSpinner]="false"></ngx-loading-bar>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  // APP过期弹出框关联变量
  private static appSelectOpen = false;
  private static appConfirmOpen = false;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private httpSpin: HttpSpinService,
    private titleService: TitleService,
    private tokenService: TokenStorageService,
    private i18n: I18NService,
    private notify: NzNotificationService,
    private store: Store,
    private modal: NzModalService,
    private location: Location,
    private router: Router,
    private common: CommonService,
    private route: ActivatedRoute,
    private eventBus: NgEventBus
  ) {
    this.http
      .get('assets/app-data.json')
      .toPromise()
      .then((appData: any) => {
        // 设置标题
        this.titleService.default = '';
        this.titleService.preffix = appData.app.name;
        this.titleService.separator = ' ';
        this.titleService.suffix = '';
        this.titleService.setTitle();
      });

    // 监听当前APP事件
    eventBus
      .on('currentApp:invalid')
      .pipe(debounceTime(300))
      .subscribe(async () => {
        if (AppComponent.appSelectOpen) {
          return;
        }
        AppComponent.appSelectOpen = true;
        await this.i18n.updateDynamicLangData();
        // 获取APP选项
        const modalSel = this.modal.create({
          nzTitle: this.i18n.translateLang('page.home.validAppChoose'),
          nzMaskClosable: false,
          nzClosable: false,
          nzContent: AppValidSelectComponent,
          nzFooter: [
            {
              label: this.i18n.translateLang('page.home.switch'),
              disabled: componentInstance => componentInstance.selectedAppId === '',
              onClick: async componentInstance => {
                await componentInstance.change();
                modalSel.close(true);
              }
            },
            {
              label: this.i18n.translateLang('page.home.quit'),
              onClick: componentInstance => {
                componentInstance.logout();
                modalSel.close();
              }
            }
          ]
        });

        // open
        modalSel.afterOpen.subscribe(() => {
          AppComponent.appSelectOpen = true;
        });

        // close
        modalSel.afterClose.subscribe((change: boolean) => {
          AppComponent.appSelectOpen = false;
          if (change) {
            this.router.navigateByUrl(`/home`);
          }
        });
      });

    // 监听当前APP事件
    eventBus
      .on('currentApp:match')
      .pipe(debounceTime(300))
      .subscribe(async () => {
        if (AppComponent.appConfirmOpen) {
          return;
        }
        AppComponent.appConfirmOpen = true;
        const userId = this.tokenService.getUserId();
        // 获取APP选项
        const modalSel = this.modal.confirm({
          nzTitle: `${this.i18n.translateLang('common.message.confirm.matchTitle')}`,
          nzContent: `${this.i18n.translateLang('common.message.confirm.matchContent')}`,
          nzOnOk: async () => {
            await this.userService.getUserByID({ type: '0', user_id: userId }).then(async userData => {
              if (!this.checkNullObj(userData)) {
                let app = '';
                if (userData.current_app) {
                  app = userData.current_app;
                } else {
                  app = userData.apps[0];
                }

                await this.tokenService.updateUser({ current_app: app });
                this.eventBus.cast('refresh:app', app);
                this.router.navigateByUrl('/home');
              } else {
                this.router.navigateByUrl('/login');
              }
            });
          },
          nzOnCancel: async () => {
            const app = this.tokenService.getUserApp();
            await this.tokenService.updateUser({ current_app: app });
            this.eventBus.cast('refresh:app', app);

            const url = this.location.path(true);
            this.router.navigateByUrl(url);
          }
        });

        // open
        modalSel.afterOpen.subscribe(() => {
          AppComponent.appConfirmOpen = true;
        });

        // close
        modalSel.afterClose.subscribe(() => {
          AppComponent.appConfirmOpen = false;
        });
      });

    this.eventBus
      .on('logout')
      .pipe(debounceTime(200))
      .subscribe((err: any) => {
        this.logout(err);
      });

    this.eventBus.on('http:error').subscribe((err: any) => {
      this.httpError(err);
    });
  }

  checkNullObj(obj: Object) {
    return Object.keys(obj).length === 0;
  }

  private logout(error?: any) {
    this.httpSpin.reset();

    // 清除通知消息
    this.store.dispatch(new ClearMessage());
    // 退出用户,清除token
    if (error) {
      this.notify.warning(this.i18n.translateLang('common.message.warningTitle'), this.i18n.translateLang('common.message.warning.W_001'));
      // 清除路由缓存
      RouteStrategyService.clear();
      this.router.navigate(['login']);
    } else {
      // 清除路由缓存
      RouteStrategyService.clear();
      this.router.navigate(['login']);
    }
  }

  private httpError(error: HttpErrorResponse) {
    switch (error.status) {
      case 504:
        this.router.navigate(['/it-support']);
        break;

      default:
        this.notify.error(
          this.i18n.translateLang('common.message.errorTitle'),
          error.error.message ? error.error.message : this.i18n.translateLang('common.message.error.E_008')
        );
        break;
    }
  }
}
