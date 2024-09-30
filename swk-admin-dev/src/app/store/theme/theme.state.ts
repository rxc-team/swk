/*
 * @Description: テーマ管理
 * @Author: RXC 廖云江
 * @Date: 2019-06-18 10:47:41
 * @LastEditors: RXC 廖云江
 * @LastEditTime: 2019-06-19 17:16:13
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
  name: 'dev_theme',
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

  /**
   * @description: テーマ設定
   */
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

  /**
   * @description: テーマリセット　ディフォルト設定
   */
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
