import 'package:bot_toast/bot_toast.dart';
import 'package:common_utils/common_utils.dart';
import 'package:flutter/material.dart';
import 'package:pit3_app/common/application.dart';
import 'package:pit3_app/core/models/items.dart' as its;
import 'package:pit3_app/db/update_service.dart';
import 'package:get/get.dart';
import 'package:pit3_app/logic/event/refresh_event.dart';
import 'package:pit3_app/logic/http/api_service.dart';
import 'package:pit3_app/core/models/update_condition.dart';
import 'package:pit3_app/util/common.dart';
import 'package:pit3_app/util/translation_util.dart' as ts;

class Change {
  bool hasConflict;
  bool hasChange;
  List<Widget> changeWidget;
  Map<String, dynamic> update;
  Change({this.hasConflict, this.hasChange, this.changeWidget, this.update});
}

class CheckUpdate {
  static showAlert(
    BuildContext context,
    String datastoreId,
    List<String> items,
  ) async {
    List<String> scanFields = [];
    String scanConnector;
    // 获取台账的数据
    var ds = await ApiService.getDatastore(datastoreId);
    if (ds != null) {
      scanConnector = ds.scanFieldsConnector;
      ds.scanFields.forEach((e) {
        scanFields.add(e);
      });
    }

    //判断这条数据与扫描设置里面的设置的字段值有差别时弹出提示框是否更改成扫描设置里字段的值
    Change change = await hasChange(context, datastoreId, items, scanFields, scanConnector);
    if (change.hasChange) {
      showDialog(
        barrierDismissible: false,
        context: context,
        builder: (context) => AlertDialog(
          title: Text(
            'info_checked_update_confirm'.tr,
          ),
          titleTextStyle: Get.theme.textTheme.subtitle1,
          content: Container(
            height: 180,
            child: Column(
              children: [
                change.hasConflict
                    ? Container(
                        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 16),
                        decoration: BoxDecoration(
                          border: Border.all(
                            width: 1,
                            color: Get.theme.dividerColor,
                          ),
                        ),
                        child: Text(
                          'error_update_fields_conflict'.tr,
                          style: TextStyle(color: Colors.red),
                        ),
                      )
                    : Container(),
                Expanded(
                  child: Container(
                    child: SingleChildScrollView(
                      child: Container(
                        child: Column(
                          children: [...change.changeWidget],
                        ),
                      ),
                    ),
                  ),
                )
              ],
            ),
          ),
          contentTextStyle: TextStyle(color: Colors.black),
          actions: <Widget>[
            ElevatedButton(
              onPressed: change.hasConflict
                  ? null
                  : () {
                      changeItem(context, datastoreId, items, change.update);
                    },
              child: Text('button_update'.tr),
            ),
            OutlinedButton(
              onPressed: () => {
                Navigator.pop(context),
              },
              child: Text('button_cancle'.tr),
            ),
          ],
        ),
      );
      return;
    }
  }

  //判断这条数据与扫描设置里面的设置的字段值有没有不同，同时把不相同的字段值保存到_items和编辑确认框内容，
  static Future<Change> hasChange(
    BuildContext context,
    String datastoreId,
    List<String> items,
    List<String> scanFields,
    String scanConnector,
  ) async {
    Map<String, dynamic> _items = Map();
    List<Widget> _changes = [];

    bool change = false;
    bool hasConflict = false;

    List<String> _updateFileds = [];

    var conditionList = await UpdateService.internal().getConditionList(datastoreId);
    final List<UpdateCondition> _conditions = [];
    for (var item in conditionList) {
      UpdateCondition sct = UpdateCondition.fromJson(item);
      _updateFileds.add(sct.fieldId);
      _conditions.add(sct);
    }

    if (_conditions.length > 0) {
      hasConflict = await ApiService.validationUpdateFields(datastoreId, _updateFileds);

      //获取这条数据详细信息
      List<Widget> row = [];
      for (var itemId in items) {
        var value = '';
        final result = await ApiService.getItem(datastoreId, itemId, isOrigin: true);
        if (result != null) {
          for (var c in _conditions) {
            if (c.fieldType == 'lookup') {
              if (result.items.containsKey(c.fieldId)) {
                String item = Common.getValue(result.items[c.fieldId]);
                if (item != c.updateValue) {
                  //不相同表示这条数据这个字段值有变化
                  change = true;

                  _items[c.fieldId] = its.Value(c.updateValue, "lookup");

                  row.add(Container(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      ts.Translations.trans(c.fieldName) + "：' " + c.updateValue + " ';",
                      textAlign: TextAlign.left,
                      style: TextStyle(color: Colors.green),
                    ),
                  ));
                }
              } else {
                if ("" != c.updateValue) {
                  //不相同表示这条数据这个字段值有变化
                  change = true;

                  _items[c.fieldId] = its.Value(c.updateValue, "lookup");

                  row.add(Container(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      ts.Translations.trans(c.fieldName) + "：' " + c.updateValue + " ';",
                      textAlign: TextAlign.left,
                      style: TextStyle(color: Colors.green),
                    ),
                  ));
                }
              }

              continue;
            }
            if (c.fieldType == 'options') {
              if (result.items.containsKey(c.fieldId)) {
                if (Common.getValue(result.items[c.fieldId]) != c.updateValue) {
                  // 设定已经发生变更
                  change = true;
                  // 设置更新数据
                  _items[c.fieldId] = its.Value(c.updateValue, "options");

                  final options = await ApiService.getOptions(c.optionId);
                  String newValue = " ";
                  if (options != null) {
                    var opt = options.singleWhere((o) => o.optionValue == c.updateValue, orElse: () => null);

                    if (opt != null) {
                      newValue = ts.Translations.trans(opt.optionLabel);
                    }
                  }

                  row.add(Container(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      ts.Translations.trans(c.fieldName) + "：' " + newValue + " ';",
                      textAlign: TextAlign.left,
                      style: TextStyle(color: Colors.green),
                    ),
                  ));
                }
              } else {
                if ('' != c.updateValue) {
                  // 设定已经发生变更
                  change = true;
                  // 设置更新数据
                  _items[c.fieldId] = its.Value(c.updateValue, "options");

                  final options = await ApiService.getOptions(c.optionId);
                  String newValue = " ";
                  if (options != null) {
                    var opt = options.singleWhere(
                      (o) => o.optionValue == c.updateValue,
                      orElse: () => null,
                    );

                    if (opt != null) {
                      newValue = ts.Translations.trans(opt.optionLabel);
                    }
                  }

                  row.add(Container(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      ts.Translations.trans(c.fieldName) + "：' " + newValue + " ';",
                      textAlign: TextAlign.left,
                      style: TextStyle(color: Colors.green),
                    ),
                  ));
                }
              }
              continue;
            }
            if (c.fieldType == 'text') {
              if (result.items.containsKey(c.fieldId)) {
                if (Common.getValue(result.items[c.fieldId]) != c.updateValue) {
                  // 设定已经发生变更
                  change = true;
                  // 设置更新数据
                  _items[c.fieldId] = its.Value(c.updateValue, "text");

                  row.add(Container(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      ts.Translations.trans(c.fieldName) + "：' " + c.updateValue + " ';",
                      textAlign: TextAlign.left,
                      style: TextStyle(color: Colors.green),
                    ),
                  ));
                }
              } else {
                if ('' != c.updateValue) {
                  // 设定已经发生变更
                  change = true;
                  // 设置更新数据
                  _items[c.fieldId] = its.Value(c.updateValue, "text");

                  row.add(Container(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      ts.Translations.trans(c.fieldName) + "：' " + c.updateValue + " ';",
                      textAlign: TextAlign.left,
                      style: TextStyle(color: Colors.green),
                    ),
                  ));
                }
              }
              continue;
            }
            if (c.fieldType == 'date') {
              if (c.updateValue == 'now') {
                c.updateValue = DateUtil.formatDate(DateTime.now(), format: "yyyy-MM-dd");
              }

              if (result.items.containsKey(c.fieldId)) {
                if (Common.getValue(result.items[c.fieldId]) != c.updateValue) {
                  // 设定已经发生变更
                  change = true;
                  // 设置更新数据
                  _items[c.fieldId] = its.Value(c.updateValue, "date");

                  row.add(Container(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      ts.Translations.trans(c.fieldName) + "：' " + c.updateValue + " ';",
                      textAlign: TextAlign.left,
                      style: TextStyle(color: Colors.green),
                    ),
                  ));
                }
              } else {
                if ('' != c.updateValue) {
                  // 设定已经发生变更
                  change = true;
                  // 设置更新数据
                  _items[c.fieldId] = its.Value(c.updateValue, "date");

                  row.add(Container(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      ts.Translations.trans(c.fieldName) + "：' " + c.updateValue + " ';",
                      textAlign: TextAlign.left,
                      style: TextStyle(color: Colors.green),
                    ),
                  ));
                }
              }
              continue;
            }
          }
        }

        List<String> vals = [];
        if (scanFields.isNotEmpty) {
          scanFields.forEach((f) {
            vals.add(Common.getValue(result.items[f]));
          });
        }

        if (vals.length > 0) {
          value = vals.join(scanConnector);
        }

        _changes.add(Container(
          child: Column(
            children: <Widget>[Text(value), ...row],
          ),
        ));
        row.clear();
      }
    }
    return Change(
      hasConflict: hasConflict,
      hasChange: change,
      changeWidget: _changes,
      update: _items,
    );
  }

  //更新确认框点了确定更新时去更新数据
  static changeItem(
    BuildContext context,
    String datastoreId,
    List<String> items,
    Map<String, dynamic> update,
  ) async {
    List<Future<dynamic>> changes = [];
    for (var itemId in items) {
      changes.add(ApiService.updateItem(
        datastoreId,
        itemId,
        update,
      ));
    }

    List<dynamic> result = await Future.wait(changes);
    if (result.length > 0) {
      BotToast.showText(text: 'info_update_success'.tr);
      eventBus.fire(RefreshEvent());
    }
    Navigator.pop(context);
  }
}
