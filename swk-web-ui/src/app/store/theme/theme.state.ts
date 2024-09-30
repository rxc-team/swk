/*
 * @Description: 主题状态管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-31 10:07:00
 * @LastEditors: RXC 廖欣星
 * @LastEditTime: 2019-06-21 13:28:48
 */
import { Injectable } from '@angular/core';
import { TokenStorageService } from '@core/services/token.service';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { ResetTheme, SetTheme } from './theme.actions';
import { ThemeInfo } from './theme.interface';

// state
export class ThemeInfoStateModel {
  current: ThemeInfo | null;
}

@State<ThemeInfoStateModel>({
  name: 'web_theme',
  defaults: {
    current: {
      name: 'default',
      mode: 'light',
      isDefault: true
    }
  }
})
@Injectable()
export class ThemeInfoState {
  constructor(private tokenService: TokenStorageService) {}

  @Selector()
  static getThemeName(state: ThemeInfoStateModel) {
    return state.current.name;
  }
  @Selector()
  static getThemeInfo(state: ThemeInfoStateModel) {
    return state.current;
  }

  // 设置主题
  @Action(SetTheme)
  set({ getState, setState }: StateContext<ThemeInfoStateModel>, { payload }: SetTheme) {
    const state = getState();
    if (state.current.name !== payload.name) {
      setState({
        current: payload
      });

      this.tokenService.updateUser({ theme: payload.name });
    }
  }

  // 恢复默认主题信息
  @Action(ResetTheme)
  reset({ setState }: StateContext<ThemeInfoStateModel>) {
    setState({
      current: {
        name: 'default',
        mode: 'light',
        isDefault: true
      }
    });
  }
}
