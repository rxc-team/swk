import 'package:flutter/material.dart';
import 'package:pit3_app/common/application.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/models/common_model.dart';
import 'package:pit3_app/core/models/field.dart';
import 'package:pit3_app/core/models/option.dart';
import 'package:pit3_app/core/models/search_condition.dart';
import 'package:pit3_app/core/models/user.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:pit3_app/db/condition_service.dart';
import 'package:get/get.dart';
import 'package:pit3_app/logic/event/refresh_event.dart';
import 'package:pit3_app/logic/http/api_service.dart';
import 'package:pit3_app/util/translation_util.dart' as ts;
import 'package:sp_util/sp_util.dart';

class SearchViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();
  List<Operator> _stringOperators = [];
  List<Operator> _lookupOperators = [];
  List<Operator> _selectOperators = [];
  List<Operator> _numberOperators = [];
  List<Field> _fields = [];
  Map<String, List<Field>> _lookupFields = Map();
  Map<String, List<User>> _userMap = Map();
  Map<String, List<Option>> _optionMap = Map();
  List<SearchCondition> _conditions = [];
  bool _searchType = false;

  Field _selectField;
  String _selectOperator = '=';
  String _selectValue = '';

  Field get selectField => this._selectField;
  set selectField(Field value) {
    this._selectField = value;
    notifyListeners();
  }

  String get selectOperator => this._selectOperator;
  set selectOperator(String value) {
    this._selectOperator = value;
    notifyListeners();
  }

  bool get searchType => this._searchType;
  set searchType(bool value) {
    this._searchType = value;
    notifyListeners();
  }

  String get selectValue => this._selectValue;
  set selectValue(String value) {
    this._selectValue = value;
    notifyListeners();
  }

  List<Operator> get stringOperators => this._stringOperators;
  set stringOperators(List<Operator> value) {
    this._stringOperators = value;
    notifyListeners();
  }

  List<Operator> get lookupOperators => this._lookupOperators;
  set lookupOperators(List<Operator> value) {
    this._lookupOperators = value;
    notifyListeners();
  }

  List<Operator> get selectOperators => this._selectOperators;
  set selectOperators(List<Operator> value) {
    this._selectOperators = value;
    notifyListeners();
  }

  List<Operator> get numberOperators => this._numberOperators;
  set numberOperators(List<Operator> value) {
    this._numberOperators = value;
    notifyListeners();
  }

  List<Field> get fields => this._fields;
  set fields(List<Field> value) {
    this._fields = value;
    notifyListeners();
  }

  Map<String, List<Field>> get lookupFields => this._lookupFields;
  set lookupFields(Map<String, List<Field>> value) {
    this._lookupFields = value;
    notifyListeners();
  }

  Map<String, List<User>> get userMap => this._userMap;
  set userMap(Map<String, List<User>> value) {
    this._userMap = value;
    notifyListeners();
  }

  Map<String, List<Option>> get optionMap => this._optionMap;
  set optionMap(Map<String, List<Option>> value) {
    this._optionMap = value;
    notifyListeners();
  }

  List<SearchCondition> get conditions => this._conditions;
  set conditions(List<SearchCondition> value) {
    this._conditions = value;
    notifyListeners();
  }

  SearchViewModel();

  init(BuildContext context) async {
    try {
      String conditionType = SpUtil.getString('conditionType', defValue: 'and');
      if (conditionType == 'and') {
        searchType = true;
      } else {
        searchType = false;
      }
      setOperators(context);
      this.loading = true;
      String datastoreID = Setting.singleton.currentDatastore;

      final ds = await ApiService.getDatastore(datastoreID);

      final result = await ApiService.getFields(datastoreID);

      var _fs = result.where((f) => f.fieldType != 'file').toList();

      _fs.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));

      if (_fs.length > 0) {
        selectField = _fs[0];
      }

      if (Setting.singleton.canCheck) {
        _fs.add(Field(
          "checked_at",
          'checked_at'.tr,
          "datetime",
          isDynamic: false,
        ));
        _fs.add(Field(
          "checked_by",
          'checked_by'.tr,
          "user",
          isDynamic: false,
        ));
        _fs.add(Field(
          "check_type",
          'check_type'.tr,
          "options",
          optionId: 'check_type',
          isDynamic: false,
        ));
      }

      Map<String, List<User>> _userMap = new Map();
      Map<String, List<Option>> _optionMap = new Map();

      List<Field> ops = [];
      List<Field> ups = [];

      for (var field in _fs) {
        if (field.fieldType == 'options') {
          if (field.fieldId == 'check_type') {
            List<Option> options = [];
            options.add(Option('Scan', 'check_type_scan'.tr));
            options.add(Option('Visual', 'check_type_visual'.tr));
            options.add(Option('Image', 'check_type_image'.tr));
            _optionMap[field.optionId] = options;
            continue;
          }

          ops.add(field);
        }

        if (field.fieldType == 'user') {
          ups.add(field);
        }
      }

      if (ds != null && ds.relations != null) {
        var lks = ds.relations.map((r) => r.datastoreId);

        List<Future<dynamic>> futures = [
          ...ops.map((o) => ApiService.getOptions(o.optionId)).toList(),
          ...ups.map((u) => ApiService.getUsers(group: u.userGroupId)).toList(),
          ...lks.map((l) => ApiService.getFields(l))
        ];

        final data = await Future.wait(futures);
        int current = 0;
        for (var i = 0; i < ops.length; i++) {
          var f = ops[i];
          _optionMap[f.optionId] = data[current];
          current++;
        }
        for (var i = 0; i < ups.length; i++) {
          var f = ups[i];
          _userMap[f.userGroupId] = data[current];
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
          ...ups.map((u) => ApiService.getUsers(group: u.userGroupId)).toList(),
        ];

        final data = await Future.wait(futures);
        int current = 0;
        for (var i = 0; i < ops.length; i++) {
          var f = ops[i];
          _optionMap[f.optionId] = data[current];
          current++;
        }
        for (var i = 0; i < ups.length; i++) {
          var f = ups[i];
          _userMap[f.userGroupId] = data[current];
          current++;
        }
      }

      var conditionList = await ConditionService.internal().getConditionList();
      final List<SearchCondition> _conditions = [];
      for (var item in conditionList) {
        SearchCondition sct = SearchCondition.fromJson(item);
        _conditions.add(sct);
      }

      this.fields = _fs ?? [];
      this.userMap = _userMap;
      this.optionMap = _optionMap;
      this.conditions = _conditions;
      this.loading = false;
    } catch (e) {
      this.isEmpty = true;
      this.loading = false;
    }
  }

  void setOperators(BuildContext context) {
    this.stringOperators = [
      Operator(label: 'search_operator_equal'.tr, value: "="),
      Operator(label: 'search_operator_like'.tr, value: "like"),
    ];

    this.lookupOperators = [
      Operator(label: 'search_operator_equal'.tr, value: "="),
    ];
    this.selectOperators = [
      Operator(label: 'search_operator_equal'.tr, value: "="),
      Operator(label: 'search_operator_exist'.tr, value: "in"),
      Operator(label: 'search_operator_not_equal'.tr, value: "<>"),
    ];
    this.numberOperators = [
      Operator(label: 'search_operator_equal'.tr, value: "="),
      Operator(label: 'search_operator_not_equal'.tr, value: "<>"),
      Operator(label: 'search_operator_greater'.tr, value: ">"),
      Operator(label: 'search_operator_less'.tr, value: "<"),
      Operator(
        label: 'search_operator_greater_equal'.tr,
        value: ">=",
      ),
      Operator(label: 'search_operator_less_equal'.tr, value: "<="),
    ];
  }

  List<String> getValues(String v) {
    if (v.isEmpty) {
      return [];
    }
    return v.split(',');
  }

  changeField(String fieldId) {
    selectField = fields.where((f) => f.fieldId == fieldId).first;
    selectOperator = null;
    if (selectField.fieldType == 'switch') {
      selectValue = 'false';
    } else {
      selectValue = '';
    }
  }

  changeSearchType(bool tp) {
    searchType = tp;
    SpUtil.putString('conditionType', tp ? 'and' : 'or');
  }

  changeValue(String value) {
    selectValue = value;
  }

  changeValues(List<String> values) {
    selectValue = values.join(',');
  }

  removeValue(String value) {
    var values = selectValue.split(',');
    values.remove(value);
    selectValue = values.join(',');
  }

  add(SearchCondition condition) async {
    ConditionService.internal().saveItem(condition);

    var conditionList = await ConditionService.internal().getConditionList();
    final List<SearchCondition> _conditions = [];
    for (var item in conditionList) {
      SearchCondition sct = SearchCondition.fromJson(item);
      _conditions.add(sct);
    }

    this.conditions = _conditions;

    this.selectField = null;
    this.selectOperator = '';
    this.selectValue = '';
  }

  remove(int id) async {
    await ConditionService.internal().deleteItem(id);
    var conditionList = await ConditionService.internal().getConditionList();
    final List<SearchCondition> _conditions = [];
    for (var item in conditionList) {
      SearchCondition sct = SearchCondition.fromJson(item);
      _conditions.add(sct);
    }

    this.conditions = _conditions;
  }

  clear() async {
    await ConditionService.internal().clear();
    var conditionList = await ConditionService.internal().getConditionList();
    final List<SearchCondition> _conditions = [];
    for (var item in conditionList) {
      SearchCondition sct = SearchCondition.fromJson(item);
      _conditions.add(sct);
    }

    this.conditions = _conditions;
  }

  refresh() {
    eventBus.fire(RefreshEvent());
    _nav.pop();
  }

  String getUserName(
    String fieldId,
    String userID,
    String searchOperator,
  ) {
    if (searchOperator == 'in') {
      var select = this.fields.firstWhere(
            (f) => f.fieldId == fieldId,
            orElse: () => null,
          );
      if (select != null) {
        if (userID == '') {
          return "";
        }

        List<String> users = userID.split(',');
        List<String> names = [];
        for (var item in users) {
          var selectUser = this.userMap[select.userGroupId].firstWhere(
                (u) => u.userId == item,
                orElse: () => null,
              );
          if (selectUser != null) {
            names.add(selectUser.userName);
          }
        }
        return names.join(',');
      } else {
        return "";
      }
    }
    var select = this.fields.firstWhere(
          (f) => f.fieldId == fieldId,
          orElse: () => null,
        );
    if (select != null) {
      if (userID == '') {
        return "";
      }

      var selectUser = this.userMap[select.userGroupId].firstWhere(
            (u) => u.userId == userID,
            orElse: () => null,
          );
      if (selectUser != null) {
        return selectUser.userName;
      } else {
        return "";
      }
    } else {
      return "";
    }
  }

  String getOptionName(
    String fieldId,
    String optionValue,
    String searchOperator,
  ) {
    if (searchOperator == 'in') {
      var select = this.fields.firstWhere(
            (f) => f.fieldId == fieldId,
            orElse: () => null,
          );
      if (select != null) {
        if (optionValue == '') {
          return "";
        }

        List<String> options = optionValue.split(',');
        List<String> names = [];
        for (var item in options) {
          var selectOption = this.optionMap[select.optionId].firstWhere(
                (o) => o.optionValue == item,
                orElse: () => null,
              );
          if (selectOption != null) {
            names.add(ts.Translations.trans(selectOption.optionLabel));
          }
        }
        return names.join(',');
      } else {
        return "";
      }
    }
    var select = this.fields.firstWhere(
          (f) => f.fieldId == fieldId,
          orElse: () => null,
        );
    if (select != null) {
      if (optionValue == '') {
        return "";
      }

      var selectOption = this.optionMap[select.optionId].firstWhere(
            (o) => o.optionValue == optionValue,
            orElse: () => null,
          );
      if (selectOption != null) {
        return selectOption.optionLabel;
      } else {
        return "";
      }
    } else {
      return "";
    }
  }

  String getValue(SearchCondition c) {
    switch (c.fieldType) {
      case 'user':
        return this.getUserName(c.fieldId, c.searchValue, c.searchOperator);
      case 'options':
        if (c.isDynamic) {
          var name = this.getOptionName(
            c.fieldId,
            c.searchValue,
            c.searchOperator,
          );
          if (name.isNotEmpty) {
            return ts.Translations.trans(name);
          } else {
            return '';
          }
        } else {
          var name = this.getOptionName(
            c.fieldId,
            c.searchValue,
            c.searchOperator,
          );
          if (name.isNotEmpty) {
            return name;
          }
        }
        return '';
      default:
        return c.searchValue;
    }
  }

  List<Operator> getOperators(String fieldType) {
    switch (fieldType) {
      case "text":
      case "textarea":
        return this.stringOperators;
        break;
      case "number":
      case "autonum":
      case "date":
      case "time":
      case "datetime":
        return this.numberOperators;
      case "options":
      case "user":
        return this.selectOperators;
      case "switch":
      case "lookup":
        return this.lookupOperators;
      default:
        return this.stringOperators;
        break;
    }
  }

  // Add ViewModel specific code here
}
