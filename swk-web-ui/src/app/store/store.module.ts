/*
 * @Description: store module管理
 * @Author: RXC 廖欣星
 * @Date: 2019-04-15 11:51:28
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2019-10-10 11:43:58
 */
import { NgModule } from '@angular/core';
import { environment } from '@env/environment';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';

import { AsideMenuState } from './menu/aside/aside.state';
import { MessageState } from './notify/notify.state';
import { SearchConditionState } from './search/search.state';
import { SettingInfoState } from './setting/setting.state';
import { ThemeInfoState } from './theme/theme.state';

const STATE = [ThemeInfoState, SettingInfoState, AsideMenuState, MessageState, SearchConditionState];

@NgModule({
  imports: [
    NgxsModule.forRoot([...STATE], { developmentMode: !environment.production }),
    NgxsStoragePluginModule.forRoot({ key: ['web_aside', 'web_message', 'web_setting', 'web_theme', 'web_search'] })
  ]
})
export class StoreModule {}
