/*
 * @Description: 设置信息接口
 * @Author: RXC 廖欣星
 * @Date: 2019-04-15 11:51:28
 * @LastEditors: RXC 廖欣星
 * @LastEditTime: 2019-06-21 13:16:49
 */
export interface SearchCondition {
  id: number;
  field_id: any;
  field_type: any;
  lookup_datastore_id?: any;
  lookup_field_id?: any;
  operator: any;
  is_dynamic: boolean;
  search_value: string | number | boolean;
  condition_type: any;
}
