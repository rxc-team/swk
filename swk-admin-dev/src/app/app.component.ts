import { NgEventBus } from 'ng-event-bus';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime } from 'rxjs/operators';

/*
 * @Description: app控制器
 * @Author: RXC 廖欣星
 * @Date: 2019-04-22 10:19:56
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-24 14:58:00
 */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpSpinService, I18NService, RouteStrategyService, TitleService } from '@core';
import { Store } from '@ngxs/store';
import { ClearMessage } from '@store';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
  constructor(
    private http: HttpClient,
    private httpSpin: HttpSpinService,
    private titleService: TitleService,
    private notify: NzNotificationService,
    private store: Store,
    private router: Router,
    private i18n: I18NService,
    private eventBus: NgEventBus
  ) {
    this.http
      .get('assets/app-data.json')
      .toPromise()
      .then((appData: any) => {
        // 设置标题
        this.titleService.preffix = appData.app.name;
        this.titleService.separator = ' ';
        this.titleService.suffix = '';
        this.titleService.setTitle();
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
        this.router.navigate(['service_error']);
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
