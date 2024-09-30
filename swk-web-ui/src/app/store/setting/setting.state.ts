/*
 * @Description: 设置状态管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-10 16:49:28
 * @LastEditors: RXC 陳平
 * @LastEditTime: 2020-07-13 15:15:32
 */
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import {
    ResetSetting, SetFullScreen, SetSearchImage, SetSearchKey, SetSliderCollapse
} from './setting.actions';
import { SettingInfo } from './setting.interface';

// state
export class SettingInfoStateModel {
  settingInfo: SettingInfo | null;
}

@State<SettingInfoStateModel>({
  name: 'web_setting',
  defaults: {
    settingInfo: {
      searchKey: 'S',
      langCd: 'zh-CN',
      isFullScreen: false,
      isCollapsed: false,
      sliderWidth: 200,
      isDefaultImage: true
    }
  }
})
@Injectable()
export class SettingInfoState {
  @Selector()
  static getSearchKey(state: SettingInfoStateModel) {
    return state.settingInfo.searchKey;
  }

  @Selector()
  static getLangCd(state: SettingInfoStateModel) {
    return state.settingInfo.langCd;
  }

  @Selector()
  static getIsFullScreen(state: SettingInfoStateModel) {
    return state.settingInfo.isFullScreen;
  }

  @Selector()
  static getSliderCollapse(state: SettingInfoStateModel) {
    return state.settingInfo.isCollapsed;
  }

  @Selector()
  static getSliderWidth(state: SettingInfoStateModel) {
    return state.settingInfo.sliderWidth;
  }

  @Selector()
  static getSearchImageInfo(state: SettingInfoStateModel) {
    return state.settingInfo.isDefaultImage;
  }

  // 设置检索key
  @Action(SetSearchKey)
  setSearchKey({ getState, setState }: StateContext<SettingInfoStateModel>, { payload }: SetSearchKey) {
    const state = getState();
    setState({
      settingInfo: {
        searchKey: payload,
        langCd: state.settingInfo.langCd,
        isFullScreen: state.settingInfo.isFullScreen,
        isCollapsed: state.settingInfo.isCollapsed,
        sliderWidth: state.settingInfo.sliderWidth,
        isDefaultImage: state.settingInfo.isDefaultImage
      }
    });
  }

  // 设置是否全屏
  @Action(SetFullScreen)
  setFullScreen({ getState, setState }: StateContext<SettingInfoStateModel>, { payload }: SetFullScreen) {
    const state = getState();
    setState({
      settingInfo: {
        searchKey: state.settingInfo.searchKey,
        langCd: state.settingInfo.langCd,
        isFullScreen: payload,
        isCollapsed: state.settingInfo.isCollapsed,
        sliderWidth: state.settingInfo.sliderWidth,
        isDefaultImage: state.settingInfo.isDefaultImage
      }
    });
  }

  // 设置是否收缩侧边栏
  @Action(SetSliderCollapse)
  setSliderCollapse({ getState, setState }: StateContext<SettingInfoStateModel>, { payload }: SetSliderCollapse) {
    const state = getState();
    if (payload === 'middle') {
      setState({
        settingInfo: {
          searchKey: state.settingInfo.searchKey,
          langCd: state.settingInfo.langCd,
          isFullScreen: state.settingInfo.isFullScreen,
          isCollapsed: true,
          sliderWidth: 80,
          isDefaultImage: state.settingInfo.isDefaultImage
        }
      });
      return;
    }

    if (payload === 'hidde') {
      setState({
        settingInfo: {
          searchKey: state.settingInfo.searchKey,
          langCd: state.settingInfo.langCd,
          isFullScreen: state.settingInfo.isFullScreen,
          isCollapsed: false,
          sliderWidth: 0,
          isDefaultImage: state.settingInfo.isDefaultImage
        }
      });
      return;
    }

    setState({
      settingInfo: {
        searchKey: state.settingInfo.searchKey,
        langCd: state.settingInfo.langCd,
        isFullScreen: state.settingInfo.isFullScreen,
        isCollapsed: false,
        sliderWidth: 200,
        isDefaultImage: state.settingInfo.isDefaultImage
      }
    });
  }

  // 设置搜索背景图片
  @Action(SetSearchImage)
  setSearchImage({ getState, setState }: StateContext<SettingInfoStateModel>, {}: SetSearchImage) {
    const state = getState();
    setState({
      settingInfo: {
        searchKey: state.settingInfo.searchKey,
        langCd: state.settingInfo.langCd,
        isFullScreen: state.settingInfo.isFullScreen,
        isCollapsed: state.settingInfo.isCollapsed,
        sliderWidth: state.settingInfo.sliderWidth,
        isDefaultImage: !state.settingInfo.isDefaultImage
      }
    });
  }

  // 恢复默认设置
  @Action(ResetSetting)
  resetSetting({ setState }: StateContext<SettingInfoStateModel>) {
    setState({
      settingInfo: {
        searchKey: 'S',
        langCd: 'zh-CN',
        isFullScreen: false,
        isCollapsed: false,
        sliderWidth: 200,
        isDefaultImage: true
      }
    });
  }
}
