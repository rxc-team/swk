import 'dart:async';
import 'dart:io';
import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:http_parser/http_parser.dart';
import 'package:dio/dio.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:mime_type/mime_type.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:get/get.dart' as g;

import 'package:pit3_app/core/models/app.dart';
import 'package:pit3_app/core/models/datastore.dart';
import 'package:pit3_app/core/models/field.dart';
import 'package:pit3_app/core/models/file.dart';
import 'package:pit3_app/core/models/items.dart';
import 'package:pit3_app/core/models/lang.dart';
import 'package:pit3_app/core/models/option.dart';
import 'package:pit3_app/core/models/result.dart';
import 'package:pit3_app/core/models/user.dart';
import 'package:pit3_app/core/models/workflow.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:pit3_app/logic/http/dio_manager.dart';
import 'package:pit3_app/core/models/search_condition.dart';
import 'package:pit3_app/logic/repository/user_repository.dart';
import 'package:pit3_app/views/login/login_view.dart';
import 'package:sp_util/sp_util.dart';

import 'api.dart';

class ApiService {
  static final _nav = locator.get<NavigatorService>();

  static final int timeOut = 10000;
  // 获取台账
  static Future<List<Datastore>> getDatastores() async {
    Map<String, dynamic> queryParameters = new Map.from({"needRole": 'true'});
    List<Datastore> result;
    try {
      Response response = await DioManager.singleton.dio
          .get(
            Api.getUrl(Api.DATASTORE_LIST),
            queryParameters: queryParameters,
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: timeOut));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = getDatastoreList(resp.data);
        } else {
          result = [];
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 获取台账
  static Future<Datastore> getDatastore(String ds) async {
    Datastore result;
    try {
      Response response = await DioManager.singleton.dio
          .get(
            Api.getUrl(Api.DATASTORE.replaceFirst(
              RegExp(r':d_id'),
              ds,
            )),
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: timeOut));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = Datastore.fromJson(resp.data);
        } else {
          result = null;
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 获取APP
  static Future<List<AppData>> getApps() async {
    List<AppData> result;
    try {
      Response response = await DioManager.singleton.dio
          .get(
            Api.getUrl(Api.USER_APP_LIST),
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: timeOut));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = getAppList(resp.data);
        } else {
          result = [];
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  //切换APP
  static Future<bool> changeApp(String appID) async {
    Map<String, dynamic> jsonData = new Map.from({"current_app": appID});
    bool result;
    String userId = SpUtil.getString("userId", defValue: "");
    try {
      Response response = await DioManager.singleton.dio
          .put(
            Api.getUrl(
              Api.UPDATE_USER.replaceFirst(new RegExp(r':u_id'), userId),
            ),
            data: jsonData,
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: timeOut));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = true;
        } else {
          result = false;
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 获取台账的字段
  static Future<List<Field>> getFields(String datastoreId) async {
    Map<String, dynamic> queryParameters = new Map.from({"needRole": 'true'});

    List<Field> result;
    try {
      Response response = await DioManager.singleton.dio
          .get(
            Api.getUrl(Api.FIELD_LIST.replaceFirst(
              RegExp(r':d_id'),
              datastoreId,
            )),
            queryParameters: queryParameters,
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: timeOut));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = getFieldList(resp.data);
        } else {
          result = [];
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 获取台账的数据
  static Future<Items> getItems(
    String datastoreId, {
    List<SearchCondition> conditions,
    String conditionType,
    int index = 1,
    int size = 0,
  }) async {
    Map<String, dynamic> jsonData = new Map.from(
        {"condition_list": conditions ?? [], "condition_type": conditionType ?? 'and', "page_index": index, "page_size": size});
    Items result;
    try {
      Response response = await DioManager.singleton.dio
          .post(
            Api.getUrl(
              Api.ITEM_LIST.replaceFirst(new RegExp(r':d_id'), datastoreId),
            ),
            data: jsonData,
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: 10000));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = Items.fromJson(resp.data);
        } else {
          result = Items([], 0);
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 获取台账的item详细数据
  static Future<Item> getItem(String datastoreId, String itemId, {bool isOrigin = false}) async {
    Map<String, dynamic> queryParameters = new Map.from({"type": true, "is_origin": isOrigin});
    Item result;
    try {
      Response response = await DioManager.singleton.dio
          .get(
            Api.getUrl(Api.ITEM.replaceFirst(new RegExp(r':d_id'), datastoreId).replaceFirst(new RegExp(r':i_id'), itemId)),
            queryParameters: queryParameters,
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: timeOut));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = Item.fromJson(resp.data);
        } else {
          result = null;
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 获取所有用户的数据
  static Future<List<User>> getUsers({String group}) async {
    Map<String, dynamic> queryParameters = new Map.from({"invalidated_in": 'true'});
    if (group != null) {
      queryParameters['group'] = group;
    }
    List<User> result;
    try {
      Response response = await DioManager.singleton.dio
          .get(
            Api.getUrl(Api.USER_LIST),
            queryParameters: queryParameters,
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: timeOut));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = getUserList(resp.data);
        } else {
          result = [];
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  static Future<List<Option>> getOptions(String optionId) async {
    Map<String, dynamic> queryParameters = new Map.from({"invalidated_in": 'true'});
    List<Option> result;
    try {
      Response response = await DioManager.singleton.dio
          .get(
            Api.getUrl(
              Api.OPTION_LIST.replaceFirst(new RegExp(r':o_id'), optionId),
            ),
            queryParameters: queryParameters,
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: timeOut));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = getOptionList(resp.data);
        } else {
          result = [];
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  Future<List<Option>> getAllOptions() async {
    List<Option> result;
    try {
      Response response = await DioManager.singleton.dio.get(
        Api.getUrl(Api.ALL_OPTION_LIST),
        options: _setAuth(false),
      );
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = getOptionList(resp.data);
        } else {
          result = [];
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  /// 登录
  static Future<Result> login(String email, String password) async {
    Map<String, dynamic> jsonData = new Map.from({"email": email, "password": password});
    Result result;
    try {
      Response response = await DioManager.singleton.dio
          .post(
            Api.getUrl('login'),
            data: jsonData,
            options: _setAuth(true),
          )
          .timeout(Duration(milliseconds: timeOut));
      result = Result.fromJson(response.data);
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  /// 添加台账数据
  static Future<bool> addItem(String datastoreId, dynamic items) async {
    Map<String, dynamic> jsonData = new Map.from({"items": items});
    bool result;
    try {
      Response response = await DioManager.singleton.dio
          .post(
            Api.getUrl(
              Api.ITEM_ADD.replaceFirst(new RegExp(r':d_id'), datastoreId),
            ),
            data: jsonData,
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: timeOut));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = true;
        } else {
          result = false;
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 获取动态语言内容
  static Future<Lang> getLanguage(String langCD) async {
    Map<String, dynamic> queryParameters = new Map.from({"lang_cd": langCD});
    Lang result;
    try {
      Response response = await DioManager.singleton.dio
          .get(
            Api.getUrl(Api.Language),
            queryParameters: queryParameters,
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: timeOut));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = Lang.fromJson(resp.data);
        } else {
          result = null;
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 更新单条数据
  static Future<bool> updateItem(String datastoreID, String itemID, dynamic items, {String wfId = ''}) async {
    Map<String, dynamic> jsonData = new Map.from({"items": items});

    Map<String, dynamic> queryParameters = new Map.from({});
    if (wfId.isNotEmpty) {
      queryParameters['wf_id'] = wfId;
    }
    bool result;
    try {
      Response response = await DioManager.singleton.dio
          .put(
            Api.getUrl(
              Api.UPDATE_ITEM.replaceFirst(new RegExp(r':d_id'), datastoreID).replaceFirst(new RegExp(r':i_id'), itemID),
            ),
            queryParameters: queryParameters,
            data: jsonData,
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: timeOut));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = true;
        } else {
          result = false;
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 盘点单条数据
  static Future<bool> inventoryItem(String datastoreID, String itemID, String checkType, {String image, String checkField}) async {
    Map<String, dynamic> jsonData = new Map.from({
      "image": image ?? '',
      "check_type": checkType,
      'check_field': checkField ?? '',
    });
    bool result;
    try {
      Response response = await DioManager.singleton.dio
          .patch(
            Api.getUrl(
              Api.INVENTORY_ITEM.replaceFirst(new RegExp(r':d_id'), datastoreID).replaceFirst(new RegExp(r':i_id'), itemID),
            ),
            data: jsonData,
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: timeOut));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = true;
        } else {
          result = false;
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 盘点多条数据
  static Future<bool> mutilInventoryItem(String datastoreID, String checkType, List<String> items) async {
    bool result;
    Map<String, dynamic> jsonData = new Map.from({"item_id_list": items, "check_type": checkType});
    try {
      Response response = await DioManager.singleton.dio.patch(
        Api.getUrl(
          Api.MUTIL_INVENTORY_ITEM.replaceFirst(new RegExp(r':d_id'), datastoreID),
        ),
        data: jsonData,
        options: _setAuth(false),
      );
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = true;
        } else {
          result = false;
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 验证数据唯一性
  static Future<bool> validationItemUnique(
    String datastoreID,
    List<SearchCondition> conditions,
  ) async {
    bool result;

    Map<String, dynamic> jsonData = new Map.from({
      "condition_list": conditions,
      "condition_type": 'and',
      "page_index": 1,
      "page_size": 1,
    });
    try {
      Response response = await DioManager.singleton.dio
          .post(
            Api.getUrl(
              Api.UNIQUE_ITEM.replaceFirst(new RegExp(r':d_id'), datastoreID),
            ),
            data: jsonData,
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: 10000));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = resp.data;
        } else {
          result = false;
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 验证特殊字符
  static Future<bool> validationSpecial(String value) async {
    bool result;

    Map<String, dynamic> jsonData = new Map.from({"special": value});
    try {
      Response response = await DioManager.singleton.dio
          .post(
            Api.getUrl(
              Api.SPECIAL_CHAR,
            ),
            data: jsonData,
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: 10000));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = resp.data;
        } else {
          result = false;
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 验证数据唯一性
  static Future<bool> validationUpdateFields(
    String datastoreID,
    List<String> fields,
  ) async {
    bool result;

    Map<String, dynamic> jsonData = new Map.from({
      "update_fields": fields,
    });
    try {
      Response response = await DioManager.singleton.dio
          .post(
            Api.getUrl(
              Api.UPDATE_FIELDS_CHECK.replaceFirst(new RegExp(r':d_id'), datastoreID),
            ),
            data: jsonData,
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: 10000));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = resp.data;
        } else {
          result = false;
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 文件上传
  static Future<FileData> upload(String datastoreId, String url, String name, bool compress, Function progressCallback) async {
    FileData result;
    FormData formData;

    String mimeType = mime(url);
    if (mimeType == null) mimeType = 'text/plain; charset=UTF-8';
    String mimee = mimeType.split('/')[0];
    String type = mimeType.split('/')[1];

    if (compress) {
      var file = await compressAndGetFile(File(url), name);

      formData = new FormData.fromMap({
        "is_pic": "true",
        "d_id": datastoreId,
        "file": await MultipartFile.fromFile(file.path, filename: name, contentType: MediaType(mimee, type)),
      });
    } else {
      formData = new FormData.fromMap({
        "d_id": datastoreId,
        "file": await MultipartFile.fromFile(url, filename: name, contentType: MediaType(mimee, type)),
      });
    }
    try {
      Response response = await DioManager.singleton.dio.post(
        Api.getUrl(Api.ITEM_UPLOAD),
        data: formData,
        onSendProgress: (received, total) {
          if (total != -1) {
            progressCallback(received, total);
          }
        },
        options: _setAuth(false, isFile: true),
      ).timeout(Duration(seconds: 10));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = FileData.fromJson(resp.data);
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 获取台账的流程
  static Future<Workflow> getWorkflow(String wfId) async {
    Workflow result;
    try {
      Response response = await DioManager.singleton.dio
          .get(
            Api.getUrl(Api.WORKFLOW.replaceFirst(new RegExp(r':wf_id'), wfId)),
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: timeOut));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = Workflow.fromJson(resp.data['workflow']);
        } else {
          result = null;
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  // 获取台账的流程
  static Future<List<Workflow>> getUserWorkflows(String datastoreId, {String action}) async {
    Map<String, dynamic> queryParameters = new Map.from({
      "datastore": datastoreId,
    });

    if (action.isNotEmpty) {
      queryParameters = new Map.from({
        "datastore": datastoreId,
        "action": action,
      });
    }

    List<Workflow> result;
    try {
      Response response = await DioManager.singleton.dio
          .get(
            Api.getUrl(Api.WORKFLOW_LIST),
            queryParameters: queryParameters,
            options: _setAuth(false),
          )
          .timeout(Duration(milliseconds: timeOut));
      var resp = Result.fromJson(response.data);
      if (resp.status == 0) {
        if (resp.data != null) {
          result = getWorkflowList(resp.data);
        } else {
          result = [];
        }
      }
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  /// 验证动作的权限
  static Future<Result> checkAction(String action, String datastore) async {
    Map<String, dynamic> queryParameters = new Map.from({"datastore_id": datastore});
    Result result;
    try {
      Response response = await DioManager.singleton.dio
          .get(
            Api.getUrl(Api.USER_ACTION.replaceFirst(new RegExp(r':action'), action)),
            options: _setAuth(false),
            queryParameters: queryParameters,
          )
          .timeout(Duration(milliseconds: timeOut));
      result = Result.fromJson(response.data);
    } catch (e) {
      handleError(e);
    }

    return result;
  }

  static Options _setAuth(bool noAuth, {bool isFile = false}) {
    Map<String, String> map = new Map();
    if (!isFile) {
      map["Content-Type"] = "application/json";
    }
    if (!noAuth) {
      String token = SpUtil.getString("token", defValue: "");
      if (token.isNotEmpty) {
        map["Authorization"] = 'Bearer ' + token;
      }
    }

    return Options(headers: map);
  }

  static handleError(e) {
    if (e is TimeoutException) {
      BotToast.showText(text: 'error_net_request_timeout'.tr);
      return;
    }

    if (e is DioError) {
      switch (e.type) {
        case DioErrorType.other:
          BotToast.showText(text: 'error_no_net'.tr);
          break;
        case DioErrorType.connectTimeout:
        case DioErrorType.sendTimeout:
        case DioErrorType.receiveTimeout:
          BotToast.showText(text: 'error_net_request_timeout'.tr);
          break;
        case DioErrorType.response:
          // 唯一性错误
          if (e?.response?.data['message'].toString().startsWith('E11000')) {
            BotToast.showText(text: 'error_unique'.trParams({"fields": '内容'}));
            break;
          } else {
            // 普通后台错误
            switch (e.response.statusCode) {
              case 401:
                logout();
                break;
              case 403:
                BotToast.showText(text: 'error_403'.tr);
                break;
              case 500:
                String message = e?.response?.data['message'];

                if (message == null || message.isEmpty) {
                  BotToast.showText(text: 'error_500'.tr);
                  break;
                }

                if (message.startsWith('E11000')) {
                  BotToast.showText(text: 'error_unique'.trParams({"fields": '内容'}));
                  break;
                }

                BotToast.showText(text: message);
                break;
              default:
                BotToast.showText(text: 'error_net_unsupport'.tr);
                break;
            }
          }

          break;
        default:
          BotToast.showText(text: 'error_net_unsupport'.tr);
      }
      return;
    }

    BotToast.showText(text: 'error_net_unsupport'.tr);
  }

  // compress file and get file.
  static Future<File> compressAndGetFile(File file, String targetPath) async {
    var tplDocDir = await getApplicationDocumentsDirectory();
    String path = tplDocDir.path;

    var result = await FlutterImageCompress.compressAndGetFile(
      file.absolute.path,
      "$path/$targetPath",
      quality: 60,
      rotate: 0,
    );

    return result;
  }

  // 退出登录
  static logout() {
    UserRepository ur = UserRepository();
    ur.deleteToken();
    // Setting.singleton.clearSetting();
    _nav.pushAndRemoveUntil(
      MaterialPageRoute(
        builder: (context) => LoginView(),
      ),
    );
  }
}
