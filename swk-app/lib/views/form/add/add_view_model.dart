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
import 'package:pit3_app/core/models/search_condition.dart';
import 'package:pit3_app/core/models/user.dart';
import 'package:pit3_app/core/models/option.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:pit3_app/logic/event/refresh_event.dart';
import 'package:pit3_app/logic/http/api_service.dart';
import 'package:pit3_app/core/models/common_model.dart';
import 'package:pit3_app/util/common.dart';
import 'package:pit3_app/util/my_validators.dart';
import 'package:pit3_app/util/translation_util.dart' as ts;
import 'package:pit3_app/widgets/dialog/image_preview_dialog.dart';
import 'package:reactive_forms/reactive_forms.dart';

class AddViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();
  List<Field> _fields = [];
  List<List<Field>> _uniqueFields = [];
  List<Relations> _relations = [];
  Map<String, List<Field>> _lookupFields = Map();
  Map<String, List<User>> _userMap = Map();
  Map<String, List<Option>> _optionMap = Map();
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

  AddViewModel();

  init() async {
    this.loading = true;

    try {
      this.form = FormGroup(Map());
      String datastoreID = Setting.singleton.currentDatastore;

      final result = await ApiService.getFields(datastoreID);
      if (result == null) {
        this.isEmpty = true;
        this.loading = false;
        return;
      }

      var _fs = result;
      _fs = _fs.where((f) => !f.asTitle).toList();
      _fs.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));

      fields = _fs ?? [];

      final ds = await ApiService.getDatastore(datastoreID);
      if (ds != null) {
        if (ds.uniqueFields != null) {
          ds.uniqueFields.forEach((ufs) {
            this.uniqueFields.add(showFieldInfo(ufs));
          });
        }

        this.relations = ds.relations ?? [];
      }

      Map<String, AbstractControl<dynamic>> controls = Map();

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

      for (var field in _fs) {
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
        }

        if (field.fieldType == 'number') {
          validators.add(MyValidators.min(field.minValue));
          validators.add(MyValidators.max(field.maxValue));
        }

        if (field.fieldType == 'options') {
          controls[field.fieldId] = FormControl<Option>(validators: validators, asyncValidators: asyncValidators);
          continue;
        }

        if (field.fieldType == 'user') {
          controls[field.fieldId] = FormControl<List<User>>(validators: validators, asyncValidators: asyncValidators);
          continue;
        }

        if (field.fieldType == 'lookup') {
          controls[field.fieldId] = FormControl<Item>(validators: validators, asyncValidators: asyncValidators);
          continue;
        }

        if (field.fieldType == 'switch') {
          controls[field.fieldId] = FormControl<bool>(validators: validators, asyncValidators: asyncValidators);
          continue;
        }

        if (field.fieldType == 'date' || field.fieldType == 'time') {
          controls[field.fieldId] = FormControl<DateTime>(validators: validators, asyncValidators: asyncValidators);
          continue;
        }

        if (field.fieldType == 'file') {
          controls[field.fieldId] = FormControl<List<FileItem>>(validators: validators, asyncValidators: asyncValidators);
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

  remove(String fieldId, dynamic v) {
    this.form.control(fieldId).value.remove(v);
    this.form = this.form;
  }

  List<Field> showFieldInfo(String fs) {
    List<String> fList = fs.split(',');
    if (fList.length > 0) {
      List<Field> result = fList.map((f) => this.fields.singleWhere((fd) => fd.fieldId == f, orElse: null)).toList();
      return result;
    }

    return [];
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
    String datastoreID = Setting.singleton.currentDatastore;

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

    bool result = await ApiService.addItem(datastoreID, items);
    if (result) {
      BotToast.showText(text: 'info_add_success'.tr);
      eventBus.fire(RefreshEvent());
      _nav.pop();
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
          fieldId: u.fieldId, fieldType: u.fieldType, searchValue: newVal.value, searchOperator: "=", isDynamic: true, conditionType: ''));

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
}
