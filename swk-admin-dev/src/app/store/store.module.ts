/*
 * @Description: ストアーモジュール
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:41
 * @LastEditors: RXC 陈辉宇
 * @LastEditTime: 2020-06-16 09:18:10
 */
import { NgModule } from '@angular/core';
import { environment } from '@env/environment';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';

import { AsideMenuState } from './menu/aside/aside.state';
import { MessageState } from './notify/notify.state';
import { SettingInfoState } from './setting/setting.state';
import { ThemeInfoState } from './theme/theme.state';

const STATE = [ThemeInfoState, SettingInfoState, AsideMenuState, MessageState];

@NgModule({
  imports: [
    NgxsModule.forRoot([...STATE], { developmentMode: !environment.production }),
    NgxsStoragePluginModule.forRoot({ key: ['dev_aside', 'dev_message', 'dev_setting', 'dev_theme'] })
  ]
})
export class StoreModule {}
