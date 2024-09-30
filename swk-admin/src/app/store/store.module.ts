/*
 * @Description: store module
 * @Author: RXC 廖欣星
 * @Date: 2019-04-22 10:19:56
 * @LastEditors: RXC 廖欣星
 * @LastEditTime: 2019-06-20 09:37:59
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
    NgxsStoragePluginModule.forRoot({ key: ['adm_aside', 'adm_message', 'adm_setting', 'adm_theme'] })
  ]
})
export class StoreModule {}
