import 'dart:async';
import 'package:pit3_app/core/models/lang.dart';
import 'package:pit3_app/logic/http/api_service.dart';

class Translations {
  static Lang _languages;

  static Future<void> load(String lang) async {
    // 清空原有数据
    if (_languages != null) {
      _languages = null;
    }
    Lang _lang = await ApiService.getLanguage(lang);
    if (_lang != null) {
      _languages = _lang;
    }
  }

  static String trans(String key) {
    if (key == null || key.isEmpty) {
      return '';
    }

    if (_languages == null || _languages.apps == null) {
      return '(no translate)';
    }

    List<String> keys = key.split('.');
    if (keys.length == 1) {
      return key;
    }
    if (keys.length == 3) {
      App app = _languages?.apps[keys[1]];
      if (app == null) {
        return '(no translate)';
      }
      return app.appName ?? '(no translate)';
    } else {
      App app = _languages?.apps[keys[1]];
      if (app == null) {
        return '(no translate)';
      }
      String result = '(no translate)';
      switch (keys[2]) {
        case 'datastores':
          if (app.datastores != null && app.datastores.containsKey(keys[3])) {
            result = app?.datastores[keys[3]];
          }
          break;
        case 'fields':
          if (app.fields != null && app.fields.containsKey(keys[3])) {
            result = app?.fields[keys[3]];
          }
          break;
        case 'options':
          if (app.options != null && app.options.containsKey(keys[3])) {
            result = app?.options[keys[3]];
          }
          break;
        default:
      }
      return result;
    }
  }

  static String tranCommon(String key) {
    if (key == null || key.isEmpty) {
      return '';
    }

    if (_languages == null || _languages.common == null) {
      return '(no translate)';
    }

    List<String> keys = key.split('.');
    if (keys.length == 1) {
      return key;
    }
    String result = '(no translate)';
    if (keys.length == 3) {
      var common = _languages.common;
      switch (keys[1]) {
        case 'workflows':
          if (common.workflows != null &&
              common.workflows.containsKey(keys[2])) {
            result = common.workflows[keys[2]];
          }
          break;
        default:
      }
    }

    return result;
  }
}
