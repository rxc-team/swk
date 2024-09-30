import 'dart:convert';

import 'package:bot_toast/bot_toast.dart';
import 'package:common_utils/common_utils.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:get/get.dart';
import 'package:path/path.dart';
import 'package:pit3_app/common/application.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/models/datastore.dart';
import 'package:pit3_app/core/models/field.dart';
import 'package:pit3_app/core/models/file.dart';
import 'package:pit3_app/core/models/items.dart';
import 'package:pit3_app/core/models/option.dart';
import 'package:pit3_app/core/models/search_condition.dart';
import 'package:pit3_app/core/models/user.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:pit3_app/logic/event/refresh_event.dart';
import 'package:pit3_app/logic/http/api_service.dart';
import 'package:pit3_app/core/models/common_model.dart';
import 'package:pit3_app/util/common.dart';
import 'package:pit3_app/util/my_validators.dart';
import 'package:pit3_app/util/translation_util.dart' as ts;
import 'package:pit3_app/widgets/dialog/image_preview_dialog.dart';
import 'package:reactive_forms/reactive_forms.dart';

class CopyViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();
  List<Field> _fields = [];
  List<List<Field>> _uniqueFields = [];
  List<Relations> _relations = [];
  Map<String, List<Field>> _lookupFields = Map();
  Map<String, List<User>> _userMap = Map();
  Map<String, List<Option>> _optionMap = Map();
  String _datastoreId = '';
  String _itemId = '';
  FormGroup _form;
  Field _focusItem;
  double _process = 0;

  List<Field> get fields => this._fields;
  set fields(List<Field> value) {
    this._fields = value;
    notifyListeners();
  }

  List<List<Field>> get uniqueFields => this._uniqueFields;
  set uniqueFields(List<List<Field>> value) {
    this._uniqueFields = value;
    notifyListeners();
  }

  List<Relations> get relations => this._relations;
  set relations(List<Relations> value) {
    this._relations = value;
    notifyListeners();
  }

  Map<String, List<Field>> get lookupFields => this._lookupFields;
  set lookupFields(Map<String, List<Field>> value) {
    this._lookupFields = value;
    notifyListeners();
  }

  double get process => this._process;
  set process(double value) {
    this._process = value;
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

  String get datastoreId => this._datastoreId;
  set datastoreId(String value) {
    this._datastoreId = value;
    notifyListeners();
  }

  String get itemId => this._itemId;
  set itemId(String value) {
    this._itemId = value;
    notifyListeners();
  }

  FormGroup get form => this._form;
  set form(FormGroup value) {
    this._form = value;
    notifyListeners();
  }

  Field get focusItem => this._focusItem;
  set focusItem(Field value) {
    this._focusItem = value;
    notifyListeners();
  }

  CopyViewModel();

  init(
    String datastoreId,
    String itemId,
  ) async {
    try {
      this.form = FormGroup(Map());

      this.datastoreId = datastoreId;
      this.itemId = itemId;
      this.loading = true;

      final result = await ApiService.getFields(datastoreId);
      if (result == null) {
        this.isEmpty = true;
        this.loading = false;
        return;
      }
      var _fs = result;
      _fs = _fs.where((f) => !f.asTitle).toList();
      _fs.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));

      fields = _fs ?? [];

      final ds = await ApiService.getDatastore(datastoreId);
      if (ds != null) {
        if (ds.uniqueFields != null) {
          ds.uniqueFields.forEach((ufs) {
            this.uniqueFields.add(showFieldInfo(ufs));
          });
        }

        this.relations = ds.relations ?? [];
      }

      final items = await ApiService.getItem(datastoreId, itemId, isOrigin: true);
      if (items == null || this.fields.length == 0) {
        this.isEmpty = true;
        this.loading = false;
        return;
      }

      var ops = fields.where((f) => f.fieldType == 'options').toList();
      var ups = fields.where((f) => f.fieldType == 'user').toList();
      var lks = relations.map((r) => r.datastoreId);

      List<Future<dynamic>> futures = [
        ...ops.map((o) => ApiService.getOptions(o.optionId)).toList(),
        ...ups.map((u) => ApiService.getUsers(group: u.userGroupId)).toList(),
        ...lks.map((l) => ApiService.getFields(l))
      ];

      final data = await Future.wait(futures);
      int current = 0;
      for (var i = 0; i < ops.length; i++) {
        var f = ops[i];
        optionMap[f.optionId] = data[current];
        current++;
      }
      for (var i = 0; i < ups.length; i++) {
        var f = ups[i];
        userMap[f.userGroupId] = data[current];
        current++;
      }
      for (var i = 0; i < lks.length; i++) {
        var d = lks.elementAt(i);
        lookupFields[d] = data[current];
        current++;
      }
      Map<String, AbstractControl<dynamic>> controls = Map();

      for (var field in this.fields) {
        List<Map<String, dynamic> Function(AbstractControl<dynamic>)> validators = [];
        List<Future<Map<String, dynamic>> Function(AbstractControl<dynamic>)> asyncValidators = [];

        if (field.isRequired) {
          validators.add(Validators.required);
        }

        if (field.fieldType == 'text' || field.fieldType == 'textarea') {
          validators.add(Validators.minLength(field.minLength));
          validators.add(Validators.maxLength(field.maxLength));

          // 文本追加特殊字符验证
          asyncValidators.add(_specialChar);

          String value = Common.getValue(items.items[field.fieldId], dataType: field.fieldType);
          controls[field.fieldId] = FormControl<String>(value: value);

          controls[field.fieldId].setValidators(validators);
          controls[field.fieldId].setAsyncValidators(asyncValidators);
          continue;
        }

        if (field.fieldType == 'number') {
          validators.add(MyValidators.min(field.minValue));
          validators.add(MyValidators.max(field.maxValue));
          String value = Common.getValue(items.items[field.fieldId], dataType: field.fieldType);
          controls[field.fieldId] = FormControl<String>(value: value);

          controls[field.fieldId].setValidators(validators);
          controls[field.fieldId].setAsyncValidators(asyncValidators);
          continue;
        }

        if (field.fieldType == 'options') {
          final options = optionMap[field.optionId];

          String ov = Common.getValue(items.items[field.fieldId], dataType: field.fieldType);

          if (options != null && ov.isNotEmpty) {
            Option value = options.singleWhere((e) => e.optionValue == ov, orElse: () => null);
            controls[field.fieldId] = FormControl<Option>(value: value, validators: validators, asyncValidators: asyncValidators);
          } else {
            controls[field.fieldId] = FormControl<Option>(validators: validators, asyncValidators: asyncValidators);
          }

          continue;
        }

        if (field.fieldType == 'user') {
          final users = userMap[field.userGroupId];

          List<String> us = Common.getValue(items.items[field.fieldId], dataType: field.fieldType);
          if (users != null && us != null) {
            List<User> uList = [];
            us.forEach((u) {
              var user = users.singleWhere((e) => e.userId == u, orElse: () => null);
              if (user != null) {
                uList.add(user);
              }
            });
            controls[field.fieldId] = FormControl<List<User>>(value: uList, validators: validators, asyncValidators: asyncValidators);
          } else {
            controls[field.fieldId] = FormControl<Option>(validators: validators, asyncValidators: asyncValidators);
          }
          continue;
        }

        if (field.fieldType == 'lookup') {
          String iv = Common.getValue(items.items[field.fieldId], dataType: field.fieldType);
          if (iv.isNotEmpty) {
            List<SearchCondition> conditions = [];
            conditions.add(SearchCondition(
              fieldId: field.lookupFieldId,
              fieldType: "text",
              searchOperator: "=",
              searchValue: iv,
              isDynamic: true,
            ));

            final items = await ApiService.getItems(field.lookupDatastoreId, conditions: conditions, index: 1, size: 1);
            if (items.total > 0) {
              Item value = items.itemsList[0];
              controls[field.fieldId] = FormControl<Item>(value: value, validators: validators, asyncValidators: asyncValidators);
            }
          } else {
            controls[field.fieldId] = FormControl<Item>(validators: validators, asyncValidators: asyncValidators);
          }

          continue;
        }

        if (field.fieldType == 'switch') {
          bool value = Common.getValue(items.items[field.fieldId], dataType: field.fieldType);
          controls[field.fieldId] = FormControl<bool>(value: value, validators: validators, asyncValidators: asyncValidators);
          continue;
        }

        if (field.fieldType == 'date') {
          String dv = Common.getValue(items.items[field.fieldId], dataType: field.fieldType);
          if (dv.isEmpty) {
            controls[field.fieldId] = FormControl<DateTime>(validators: validators, asyncValidators: asyncValidators);
            continue;
          }
          DateTime value = DateTime.parse(dv);
          controls[field.fieldId] = FormControl<DateTime>(value: value, validators: validators, asyncValidators: asyncValidators);
          continue;
        }
        if (field.fieldType == 'time') {
          String dv = Common.getValue(items.items[field.fieldId], dataType: field.fieldType);
          if (dv.isEmpty) {
            controls[field.fieldId] = FormControl<DateTime>(validators: validators, asyncValidators: asyncValidators);
            continue;
          }
          DateTime value = DateTime.parse('0001-01-01 ' + dv);
          controls[field.fieldId] = FormControl<DateTime>(value: value, validators: validators, asyncValidators: asyncValidators);
          continue;
        }

        if (field.fieldType == 'file') {
          List<FileItem> value = Common.getValue(items.items[field.fieldId], dataType: field.fieldType);
          controls[field.fieldId] = FormControl<List<FileItem>>(value: value, validators: validators, asyncValidators: asyncValidators);
          continue;
        }

        controls[field.fieldId] = FormControl<String>(validators: validators, asyncValidators: asyncValidators);
      }

      this.form.addAll(controls);
      this.loading = false;
    } catch (e) {
      this.isEmpty = true;
      this.loading = false;
    }
  }

  List<Field> showFieldInfo(String fs) {
    List<String> fList = fs.split(',');
    if (fList.length > 0) {
      List<Field> result = fList.map((f) => this.fields.singleWhere((fd) => fd.fieldId == f, orElse: null)).toList();
      return result;
    }

    return [];
  }

  remove(String fieldId, dynamic v) {
    this.form.control(fieldId).value.remove(v);
    this.form = this.form;
  }

  progressCallback(int received, int total) {
    process = received / total;
  }

  upload(String datastoreId, String fieldId, String filePath, String fielName, bool compress) async {
    FileData result = await ApiService.upload(
      datastoreId,
      filePath,
      fielName,
      compress,
      progressCallback,
    );
    if (result != null) {
      if (this.form.control(fieldId).value == null) {
        this.form.control(fieldId).value = [FileItem(result.url, fielName)];
      } else {
        this.form.control(fieldId).value.add(FileItem(result.url, fielName));
      }
    }

    this.form = this.form;
  }

  Future<void> submit(Map<String, Object> valueMap) async {
    // 先进行唯一性验证
    for (var i = 0; i < this.uniqueFields.length; i++) {
      var ufs = this.uniqueFields[i];
      await uniqueValidator(ufs);
    }

    if (form.invalid) {
      return;
    }

    Map<String, dynamic> items = Map();
    fields.forEach((Field item) async {
      switch (item.fieldType) {
        case 'file':
          List<FileItem> fs = valueMap[item.fieldId];
          if (fs != null) {
            List<Map<String, dynamic>> files = [];
            for (var f in fs) {
              files.add(Map.from({
                "url": f.url,
                "name": f.name,
              }));
            }
            items[item.fieldId] = Map.from({
              "data_type": item.fieldType,
              "value": json.encode(files),
            });
          } else {
            items[item.fieldId] = Map.from({
              "data_type": item.fieldType,
              "value": "[]",
            });
          }

          break;
        case 'text':
        case 'number':
        case 'autonum':
        case 'textarea':
          String tx = valueMap[item.fieldId];
          items[item.fieldId] = Map.from({
            "data_type": item.fieldType,
            "value": tx,
          });
          break;
        case 'lookup':
          Item iv = valueMap[item.fieldId];
          if (iv != null) {
            items[item.fieldId] = Map.from({
              "data_type": item.fieldType,
              "value": Common.getValue(
                iv.items[item.lookupFieldId],
              ),
            });
          } else {
            items[item.fieldId] = Map.from({
              "data_type": item.fieldType,
              "value": "",
            });
          }
          break;
        case 'options':
          Option ov = valueMap[item.fieldId];
          if (ov != null) {
            items[item.fieldId] = Map.from({
              "data_type": item.fieldType,
              "value": ov.optionValue,
            });
          } else {
            items[item.fieldId] = Map.from({
              "data_type": item.fieldType,
              "value": "",
            });
          }
          break;
        case 'user':
          List<User> uv = valueMap[item.fieldId];
          if (uv != null) {
            var value = uv.map((e) => e.userId).join(',');
            items[item.fieldId] = Map.from({
              "data_type": item.fieldType,
              "value": value,
            });
          } else {
            items[item.fieldId] = Map.from({
              "data_type": item.fieldType,
              "value": "",
            });
          }
          break;
        case 'switch':
          bool bv = valueMap[item.fieldId];
          items[item.fieldId] = Map.from({
            "data_type": item.fieldType,
            "value": bv.toString(),
          });
          break;
        case 'date':
          DateTime dv = valueMap[item.fieldId];
          items[item.fieldId] = Map.from({
            "data_type": item.fieldType,
            "value": DateUtil.formatDate(dv, format: "yyyy-MM-dd"),
          });
          break;
        case 'time':
          DateTime tv = valueMap[item.fieldId];
          items[item.fieldId] = Map.from({
            "data_type": item.fieldType,
            "value": DateUtil.formatDate(tv, format: "HH:mm:ss"),
          });
          break;
        default:
          String tx = valueMap[item.fieldId];
          items[item.fieldId] = Map.from({
            "data_type": item.fieldType,
            "value": tx ?? "",
          });
          break;
      }
    });

    bool result = await ApiService.addItem(datastoreId, items);
    if (result) {
      BotToast.showText(text: 'info_add_success'.tr);
      eventBus.fire(RefreshEvent());
      _nav.pop();
    }
  }

  uniqueValidator(List<Field> uniqueFields) async {
    String datastoreID = Setting.singleton.currentDatastore;
    List<AbstractControl> ctls = [];

    List<SearchCondition> conditions = [];
    List<String> keys = [];

    uniqueFields.forEach((u) {
      // 新值
      var newVal = this.form.controls[u.fieldId];

      if (u.fieldType != 'text' && u.fieldType != 'autonum') {
        BotToast.showText(text: 'check_deprecated_unique'.trParams({"field": ts.Translations.trans(u.fieldName)}));
        newVal.setErrors({'deprecated': true});
        return;
      }

      conditions.add(SearchCondition(
        fieldId: u.fieldId,
        fieldType: u.fieldType,
        searchValue: newVal.value,
        searchOperator: "=",
        isDynamic: true,
        conditionType: '',
      ));

      keys.add(ts.Translations.trans(u.fieldName));

      ctls.add(newVal);
    });

    var res = await ApiService.validationItemUnique(datastoreID, conditions);
    if (!res) {
      ctls.forEach((c) {
        c.setErrors({'unique': true});
      });

      form = form;

      BotToast.showText(text: 'error_unique'.trParams({"fields": keys.toString()}));
    }
  }

  Future getImage(String datastoreId, String fieldId, bool useCamera) async {
    this.process = 0;
    var imagePicker = ImagePicker();
    var image = await imagePicker.pickImage(source: useCamera ? ImageSource.camera : ImageSource.gallery);
    if (image != null) {
      var filePath = image.path;
      var fielName = basename(filePath);
      await upload(datastoreId, fieldId, filePath, fielName, true);
    }
    this.process = 0;
  }

  Future getFile(String datastoreId, String fieldId) async {
    this.process = 0;
    var file = await FilePicker.platform.pickFiles(type: FileType.any);
    if (file != null) {
      var filePath = file.paths[0];
      var fielName = basename(filePath);
      await upload(datastoreId, fieldId, filePath, fielName, false);
    }
    this.process = 0;
  }

  void showImage(List<dynamic> files, int index, BuildContext context) {
    List<String> images = [];
    for (var image in files) {
      images.add(Setting().buildFileURL(image.url));
    }
    Navigator.push(
      context,
      MaterialPageRoute<void>(
        builder: (BuildContext context) => ImagePreviewDialog(
          images: images,
          index: index,
        ),
        fullscreenDialog: true,
      ),
    );
  }

  /// Async validator example that simulates a request to a server
  /// and validates if the email of the user is unique.
  Future<Map<String, dynamic>> _specialChar(AbstractControl<dynamic> control) async {
    final error = {'special': true};

    if (control.value == null) {
      return null;
    }

    bool result = await ApiService.validationSpecial(control.value);

    bool has = result;

    if (!has) {
      return error;
    }

    return null;
  }

  // Add ViewModel specific code here
}
