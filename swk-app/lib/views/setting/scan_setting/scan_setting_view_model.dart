import 'package:flutter/material.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/models/datastore.dart';
import 'package:pit3_app/core/models/field.dart';
import 'package:pit3_app/core/models/option.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:pit3_app/db/update_service.dart';
import 'package:pit3_app/logic/http/api_service.dart';
import 'package:pit3_app/core/models/update_condition.dart';
import 'package:pit3_app/util/translation_util.dart';
import 'package:pit3_app/views/tab/tab_view.dart';

class ScanSettingViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();
  Datastore _selectDatastore;
  List<Datastore> _datastores = [];
  List<Field> _fieldOptions = [];
  Map<String, List<Field>> _lookupFields = Map();
  Map<String, List<Option>> _optionMap = Map();
  List<UpdateCondition> _updateConditions = [];

  List<UpdateCondition> get updateConditions => this._updateConditions;
  set updateConditions(List<UpdateCondition> value) {
    this._updateConditions = value;
    notifyListeners();
  }

  List<Field> get fieldOptions => this._fieldOptions;
  set fieldOptions(List<Field> value) {
    this._fieldOptions = value;
    notifyListeners();
  }

  Map<String, List<Field>> get lookupFields => this._lookupFields;
  set lookupFields(Map<String, List<Field>> value) {
    this._lookupFields = value;
    notifyListeners();
  }

  Map<String, List<Option>> get optionMap => this._optionMap;
  set optionMap(Map<String, List<Option>> value) {
    this._optionMap = value;
    notifyListeners();
  }

  // 当前选中的台账
  Datastore get datastore => this._selectDatastore;
  set datastore(Datastore value) {
    this._selectDatastore = value;
    notifyListeners();
  }

  // 所有台账
  List<Datastore> get datastores => this._datastores;
  set datastores(List<Datastore> value) {
    this._datastores = value;
    notifyListeners();
  }

  ScanSettingViewModel();

  init() async {
    this.loading = true;
    var scanDatastore = Setting.singleton.scanDatastore ?? '';

    final result = await ApiService.getDatastores();
    if (result == null) {
      this.datastores = [];
    } else {
      this.datastores = result.where((dsItem) => dsItem.canCheck == true).toList();
      if (scanDatastore.isNotEmpty) {
        // 设置选中的台账
        this.datastore = datastores.singleWhere((a) => a.datastoreId == scanDatastore, orElse: () => null);
        // 如果选中台账有值的场合
        if (this.datastore != null) {
          List<Future<dynamic>> beforeFutures = [
            ApiService.getFields(this.datastore.datastoreId),
            UpdateService.internal().getConditionList(this.datastore.datastoreId),
          ];
          final beforeData = await Future.wait(beforeFutures);
          final List<Field> fields = beforeData[0];
          final conditionList = beforeData[1];
          // 设置更新条件
          final List<UpdateCondition> _conditions = [];
          for (var item in conditionList) {
            UpdateCondition uct = UpdateCondition.fromJson(item);
            _conditions.add(uct);
          }

          this.updateConditions = _conditions;

          if (fields != null) {
            Field checkField = fields.singleWhere(
              (item) => item.isCheckImage == true,
              orElse: () {
                return null;
              },
            );
            if (checkField != null) {
              Setting.singleton.setScanField(checkField.fieldId);
            } else {
              Setting.singleton.setScanField('');
            }

            // 设置选项
            this.fieldOptions = fields
                .where((f) =>
                    f.fieldType == 'options' || f.fieldType == 'lookup' || f.fieldType == 'date' || (f.fieldType == 'text' && !f.asTitle))
                .toList();
            // 获取选项和 lookup 的值
            var ops = fields.where((f) => f.fieldType == 'options').toList();

            if (this.datastore != null && this.datastore.relations != null) {
              var lks = this.datastore.relations.map((r) => r.datastoreId);

              List<Future<dynamic>> futures = [
                ...ops.map((o) => ApiService.getOptions(o.optionId)).toList(),
                ...lks.map((l) => ApiService.getFields(l))
              ];

              final data = await Future.wait(futures);
              int current = 0;
              for (var i = 0; i < ops.length; i++) {
                var f = ops[i];
                optionMap[f.optionId] = data[current];
                current++;
              }
              for (var i = 0; i < lks.length; i++) {
                var d = lks.elementAt(i);
                lookupFields[d] = data[current];
                current++;
              }
            } else {
              List<Future<dynamic>> futures = [
                ...ops.map((o) => ApiService.getOptions(o.optionId)).toList(),
              ];

              final data = await Future.wait(futures);
              int current = 0;
              for (var i = 0; i < ops.length; i++) {
                var f = ops[i];
                optionMap[f.optionId] = data[current];
                current++;
              }
            }
          }
        }
      }
    }

    this.loading = false;
  }

  selectDatastore(String ds) async {
    this.datastore = datastores.singleWhere((a) => a.datastoreId == ds, orElse: () => null);
    // 清空更新条件
    this.updateConditions = [];
    // 清空map
    this.optionMap = Map();
    // 获取字段
    final List<Field> fields = await ApiService.getFields(ds);
    if (fields != null) {
      Field checkField = fields.singleWhere(
        (item) => item.isCheckImage == true,
        orElse: () {
          return null;
        },
      );
      if (checkField != null) {
        Setting.singleton.setScanField(checkField.fieldId);
      } else {
        Setting.singleton.setScanField('');
      }
      // 设置选项
      this.fieldOptions = fields
          .where(
              (f) => f.fieldType == 'options' || f.fieldType == 'lookup' || f.fieldType == 'date' || (f.fieldType == 'text' && !f.asTitle))
          .toList();
      // 获取选项和 lookup 的值
      var ops = fields.where((f) => f.fieldType == 'options').toList();

      if (this.datastore != null && this.datastore.relations != null) {
        var lks = this.datastore.relations.map((r) => r.datastoreId);

        List<Future<dynamic>> futures = [
          ...ops.map((o) => ApiService.getOptions(o.optionId)).toList(),
          ...lks.map((l) => ApiService.getFields(l))
        ];

        final data = await Future.wait(futures);
        int current = 0;
        for (var i = 0; i < ops.length; i++) {
          var f = ops[i];
          optionMap[f.optionId] = data[current];
          current++;
        }
        for (var i = 0; i < lks.length; i++) {
          var d = lks.elementAt(i);
          lookupFields[d] = data[current];
          current++;
        }
      } else {
        List<Future<dynamic>> futures = [
          ...ops.map((o) => ApiService.getOptions(o.optionId)).toList(),
        ];

        final data = await Future.wait(futures);
        int current = 0;
        for (var i = 0; i < ops.length; i++) {
          var f = ops[i];
          optionMap[f.optionId] = data[current];
          current++;
        }
      }
    }
  }

  add(UpdateCondition selectCondition) async {
    UpdateService.internal().saveItem(selectCondition);

    var conditionList = await UpdateService.internal().getConditionList(
      this.datastore.datastoreId,
    );
    final List<UpdateCondition> _conditions = [];
    for (var item in conditionList) {
      UpdateCondition sct = UpdateCondition.fromJson(item);
      _conditions.add(sct);
    }

    this.updateConditions = _conditions;
  }

  remove(int id) async {
    await UpdateService.internal().deleteItem(id);
    var conditionList = await UpdateService.internal().getConditionList(
      this.datastore.datastoreId,
    );
    final List<UpdateCondition> _conditions = [];
    for (var item in conditionList) {
      UpdateCondition sct = UpdateCondition.fromJson(item);
      _conditions.add(sct);
    }

    this.updateConditions = _conditions;
  }

  done() {
    Setting.singleton.setScanDatastore(datastore.datastoreId);

    _nav.navigateToPageWithReplacement(MaterialPageRoute(
      builder: (context) => TabView(),
    ));
  }

  String getOptionName(String fieldId, String optionValue) {
    var select = this.fieldOptions.firstWhere((f) => f.fieldId == fieldId);
    if (select != null) {
      if (optionValue == '') {
        return "";
      }

      var selectOption = this.optionMap[select.optionId].firstWhere((o) => o.optionValue == optionValue);
      if (selectOption != null) {
        return selectOption.optionLabel;
      } else {
        return "";
      }
    } else {
      return "";
    }
  }

  String getValue(UpdateCondition item) {
    switch (item.fieldType) {
      case 'options':
        var name = this.getOptionName(item.fieldId, item.updateValue);
        if (name.isNotEmpty) {
          return Translations.trans(name);
        }
        return '';
      case 'date':
        return item.updateValue;
      case 'text':
        return item.updateValue;
      case 'lookup':
        var name = item.updateValue;
        return name;
      default:
        return item.updateValue;
    }
  }

  // Add ViewModel specific code here
}
