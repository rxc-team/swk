/*
 * @Description: app module
 * @Author: RXC 廖欣星
 * @Date: 2019-05-13 13:00:16
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-07-01 14:12:47
 */

import { NgEventBus } from 'ng-event-bus';
import { NZ_CONFIG, NzConfig } from 'ng-zorro-antd/core/config';
import { NZ_I18N, zh_CN as zorroLang } from 'ng-zorro-antd/i18n';
import { CookieService } from 'ngx-cookie-service';
import { MarkdownModule } from 'ngx-markdown';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { registerLocaleData } from '@angular/common';
import {
    HTTP_INTERCEPTORS, HttpClient, HttpClientModule, HttpClientXsrfModule
} from '@angular/common/http';
import zh from '@angular/common/locales/zh';
import { APP_INITIALIZER, ErrorHandler, LOCALE_ID, NgModule, SecurityContext } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import {
    AppInterceptor, AuthInterceptor, CookieInterceptor, CoreModule, MyMissingTranslationHandler,
    NotTranslatedService, ResponseInterceptor, RouteStrategyService, SpinInterceptor,
    StartupService, URLInterceptor
} from '@core';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SharedModule } from '@shared';
import { StoreModule } from '@store';

import { AppComponent } from './app.component';
import { LayoutModule } from './layout/layout.module';
import { PagesModule } from './pages/pages.module';

const LANG = {
  abbr: '🇨🇳',
  ng: zh,
  zorro: zorroLang
};
registerLocaleData(LANG.ng, LANG.abbr);
const LANG_PROVIDES = [
  { provide: LOCALE_ID, useValue: LANG.abbr },
  { provide: NZ_I18N, useValue: LANG.zorro }
];

// 加载i18n语言文件
export function I18nHttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, `assets/languages/`, '.json');
}

const I18NSERVICE_MODULES = [
  TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: I18nHttpLoaderFactory,
      deps: [HttpClient]
    },
    useDefaultLang: false,
    missingTranslationHandler: {
      provide: MissingTranslationHandler,
      useClass: MyMissingTranslationHandler,
      deps: [NotTranslatedService]
    }
  })
];

const INTERCEPTOR_PROVIDES = [
  { provide: HTTP_INTERCEPTORS, useClass: SpinInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: URLInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: CookieInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ResponseInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true }
];

export function StartupServiceFactory(startupService: StartupService): Function {
  return () => startupService.load();
}
const APPINIT_PROVIDES = [
  StartupService,
  {
    provide: APP_INITIALIZER,
    useFactory: StartupServiceFactory,
    deps: [StartupService],
    multi: true
  }
];

const ngZorroConfig: NzConfig = {
  // 注意组件名称没有 nz 前缀
  message: { nzTop: 10, nzMaxStack: 1 },
  notification: { nzTop: 64, nzMaxStack: 1 }
};

const NZ_CONFIG_PROVIDES = [{ provide: NZ_CONFIG, useValue: ngZorroConfig }];

const ROUTE_REUSE_STRATEGY = [{ provide: RouteReuseStrategy, useClass: RouteStrategyService }];
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'csrf_token',
      headerName: 'X-CSRF-Token'
    }),
    MarkdownModule.forRoot({ sanitize: SecurityContext.NONE }),
    CoreModule,
    SharedModule,
    LayoutModule,
    DragDropModule,
    PagesModule,
    StoreModule,
    LoadingBarRouterModule,
    ...I18NSERVICE_MODULES
    // ...MOCKMODULE
  ],
  providers: [
    NgEventBus,
    ...LANG_PROVIDES,
    ...INTERCEPTOR_PROVIDES,
    ...APPINIT_PROVIDES,
    ...NZ_CONFIG_PROVIDES,
    ...ROUTE_REUSE_STRATEGY,
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
