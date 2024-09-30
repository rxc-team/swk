import 'package:pit3_app/common/setting.dart';

class Api {
  /// 用户相关
  // 用户登录
  static const String USER_LOGIN = "login";
  // 用户APP
  static const String USER_APP_LIST = "app/user/apps";
  // 用户APP切换
  static const String UPDATE_USER = "user/users/:u_id";
  // 当前APP中所有用户
  static const String USER_LIST = "user/users";
  // 判断当前动作制御情况
  static const String USER_ACTION = "user/check/actions/:action";

  /// 台账相关
  // 当前用户的台账一览
  static const String DATASTORE_LIST = "datastore/datastores";
  // 获取台账信息
  static const String DATASTORE = "datastore/datastores/:d_id";
  // 当前台账的字段
  static const String FIELD_LIST = "field/datastores/:d_id/fields";
  // 当前台账的数据
  static const String ITEM_LIST = "item/datastores/:d_id/items/search";
  // 当前item的数据
  static const String ITEM = "item/datastores/:d_id/items/:i_id";
  // 验证当前item的数据的唯一性
  static const String UNIQUE_ITEM = "validation/datastores/:d_id/items/unique";
  // 验证特殊字符
  static const String SPECIAL_CHAR = "validation/specialchar";
  // 盘点台账的数据
  static const String INVENTORY_ITEM = "item/datastores/:d_id/items/:i_id";
  // 更新台账的数据
  static const String UPDATE_ITEM = "item/datastores/:d_id/items/:i_id";
  // 盘点多条台账的数据
  static const String MUTIL_INVENTORY_ITEM = "item/datastores/:d_id/items";
  // 台账数据添加
  static const String ITEM_ADD = "item/datastores/:d_id/items";
  // 图片上传
  static const String ITEM_UPLOAD = "file/item/upload";
  // 临时数据上传
  static const String TEMPLATE_ITEM_ADD = "template/templates";

  /// 流程相关
  // 获取当前用户的流程
  static const String WORKFLOW = "workflow/workflows/:wf_id";
  static const String WORKFLOW_LIST = "workflow/user/workflows";
  static const String UPDATE_FIELDS_CHECK = "validation/datastores/:d_id/updateCheck";

  /// 系统相关
  // 获取动态语言数据
  static const String Language = "language/languages/search";
  // 获取选项数据
  static const String OPTION_LIST = "option/options/:o_id";
  // 获取所有选项数据
  static const String ALL_OPTION_LIST = "option/label/options";

  // 拼接URL
  static String getUrl(String uri) {
    String host = Setting.singleton.serverHost;
    return '$host/outer/api/v1/$uri';
  }
}
