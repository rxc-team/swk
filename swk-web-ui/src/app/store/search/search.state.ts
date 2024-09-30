/*
 * @Description: 设置状态管理
 * @Author: RXC 廖欣星
 * @Date: 2019-05-10 16:49:28
 * @LastEditors: RXC 廖欣星
 * @LastEditTime: 2019-06-21 13:17:31
 */
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { ClearSearchCondition, SetSearchCondition } from './search.actions';
import { SearchCondition } from './search.interface';

// state
export class SearchConditionStateModel {
  conditions: Array<SearchCondition> | null;
  condition_type: string;
}

@State<SearchConditionStateModel>({
  name: 'web_search',
  defaults: {
    conditions: [],
    condition_type: 'and'
  }
})
@Injectable()
export class SearchConditionState {
  @Selector()
  static getSearchCondition(state: SearchConditionState) {
    return state;
  }

  // 设置检索key
  @Action(SetSearchCondition)
  setSearchCondition({ setState }: StateContext<SearchConditionStateModel>, { payload }: SetSearchCondition) {
    setState({
      conditions: payload.conditions,
      condition_type: payload.condition_type
    });
  }

  // 恢复默认设置
  @Action(ClearSearchCondition)
  clearSearchCondition({ setState }: StateContext<SearchConditionStateModel>) {
    setState({
      conditions: [],
      condition_type: 'and'
    });
  }
}
