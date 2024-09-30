import 'dart:convert';

import 'package:pit3_app/core/models/common_model.dart';
import 'package:pit3_app/core/models/items.dart';
import 'package:pit3_app/core/models/option.dart';
import 'package:pit3_app/core/models/user.dart';

class Common {
  /// 获取用户的显示名称
  /// [userId] 用户ID
  /// [userList] 用户一览
  /// 返回用户名称
  static String transUser(String userId, List<User> userList) {
    String _name = '';

    if (userId == '') {
      return _name;
    }

    for (var u in userList) {
      if (u.userId == userId) {
        _name = u.userName;
        break;
      }
    }

    return _name;
  }

  /// 获取选项显示名称
  /// [optionValue] 选项的唯一值
  /// [optionList] 选项一览
  /// 返回选项的名称
  static String transOption(String optionValue, List<Option> optionList) {
    String _name = '';

    if (optionValue == '' || optionList == null) {
      return _name;
    }

    for (var u in optionList) {
      if (u.optionValue == optionValue) {
        _name = u.optionLabel;
        break;
      }
    }

    return _name;
  }

  static dynamic getValue(Value value, {String dataType = 'text'}) {
    var val;

    if (value == null || value.value == 'null') {
      switch (dataType) {
        case "text":
        case "textarea":
          val = '';
          break;
        case "date":
          val = '';
          break;
        case "time":
          val = '';
          break;
        case "switch":
          val = false;
          break;
        case "function":
          val = '';
          break;
        case "number":
          val = '';
          break;
        case "autonum":
          val = '';
          break;
        case "options":
          val = '';
          break;
        case "user":
          List<String> v = [];
          val = v;
          break;
        case "file":
          List<FileItem> v = [];
          val = v;

          break;
        case "lookup":
          val = '';
          break;
        default:
          break;
      }
      return val;
    }

    switch (value.dataType) {
      case "text":
      case "textarea":
        if (value.value != null) {
          val = value.value;
        } else {
          val = '';
        }

        break;
      case "date":
        if (value.value != null && value.value != '0001-01-01') {
          val = value.value;
        } else {
          val = '';
        }
        break;
      case "time":
        if (value.value != null) {
          val = value.value;
        } else {
          val = '';
        }
        break;
      case "switch":
        if (value.value == 'true' || value.value == true) {
          val = true;
        } else {
          val = false;
        }
        break;
      case "function":
        val = value.value;
        break;
      case "number":
        val = value.value;
        break;
      case "autonum":
        val = value.value;
        break;
      case "options":
        val = value.value;
        break;
      case "user":
        if (value.value != null && value.value.isNotEmpty) {
          List<dynamic> users = json.decode(value.value);
          List<String> v = [];
          for (var u in users) {
            v.add(u);
          }
          val = v;
        } else {
          val = [];
        }
        break;
      case "file":
        if (value.value != null && value.value.isNotEmpty) {
          List<dynamic> files = json.decode(value.value);
          List<FileItem> v = [];

          for (var f in files) {
            v.add(FileItem(f['url'], f['name']));
          }

          val = v;
        } else {
          val = [];
        }

        break;
      case "lookup":
        val = value.value;
        break;
      default:
        break;
    }

    return val;
  }
}
