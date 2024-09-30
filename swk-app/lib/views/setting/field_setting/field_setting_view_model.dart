import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/cupertino.dart';
import 'package:pit3_app/common/application.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/models/datastore.dart';
import 'package:pit3_app/core/models/field.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:pit3_app/db/display_service.dart';
import 'package:get/get.dart';
import 'package:pit3_app/logic/event/refresh_event.dart';
import 'package:pit3_app/logic/http/api_service.dart';
import 'package:pit3_app/core/models/display_field.dart';

class FieldSettingViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();
  Datastore _datastore;
  List<Datastore> _datastores = [];
  List<Field> _fields = [];
  List<DisplayField> _displayFields = [];

  List<Field> get fields => this._fields;
  set fields(List<Field> value) {
    this._fields = value;
    notifyListeners();
  }

  List<DisplayField> get displayFields => this._displayFields;
  set displayFields(List<DisplayField> value) {
    this._displayFields = value;
    notifyListeners();
  }

  // 当前选中的台账
  Datastore get datastore => this._datastore;
  set datastore(Datastore value) {
    this._datastore = value;
    notifyListeners();
  }

  // 所有台账
  List<Datastore> get datastores => this._datastores;
  set datastores(List<Datastore> value) {
    this._datastores = value;
    notifyListeners();
  }

  FieldSettingViewModel();

  init() async {
    this.loading = true;
    var datastore = Setting.singleton.currentDatastore ?? '';

    final result = await ApiService.getDatastores();
    if (result == null) {
      this.datastores = [];
    } else {
      result.sort((a, b) => a.createdAt.compareTo(b.createdAt));
      this.datastores = result;
      if (datastore.isNotEmpty) {
        this.datastore = datastores.singleWhere(
          (a) => a.datastoreId == datastore,
          orElse: () => null,
        );
      }
    }

    if (datastore.isNotEmpty) {
      final fResult = await ApiService.getFields(datastore);
      if (fResult == null) {
        this.fields = [];
      } else {
        fResult.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
        this.fields = fResult;
        // 获取已经添加的显示字段
        var fieldList = await DisplayService.internal().getConditionList(datastore);
        for (var item in fieldList) {
          DisplayField fs = DisplayField.fromJson(item);

          var field = this.fields.singleWhere((f) => f.fieldId == fs.fieldId, orElse: () => null);
          if (field != null) {
            this.displayFields.add(DisplayField(
                  datastoreId: field.datastoreId,
                  fieldId: field.fieldId,
                  fieldName: field.fieldName,
                  fieldType: field.fieldType,
                  displayOrder: this.displayFields.length + 1,
                ));
          }
        }
      }
    }

    this.loading = false;
  }

  selectDatastore(String ds) async {
    this.datastore = datastores.singleWhere(
      (a) => a.datastoreId == ds,
      orElse: () => null,
    );
    this.displayFields = [];

    final fResult = await ApiService.getFields(ds);
    if (fResult == null) {
      this.fields = [];
    } else {
      fResult.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
      this.fields = fResult;
      // 获取已经添加的显示字段
      var fieldList = await DisplayService.internal().getConditionList(ds);
      for (var item in fieldList) {
        DisplayField fs = DisplayField.fromJson(item);

        var field = fResult.singleWhere((f) => f.fieldId == fs.fieldId, orElse: () => null);
        if (field != null) {
          this.displayFields.add(DisplayField(
                datastoreId: field.datastoreId,
                fieldId: field.fieldId,
                fieldName: field.fieldName,
                fieldType: field.fieldType,
                displayOrder: this.displayFields.length + 1,
              ));
        }
      }

      this.displayFields = this.displayFields;
    }
  }

  addField(String fs) async {
    if (this.displayFields.length > 2) {
      BotToast.showText(text: 'setting_show_field_tips'.tr, align: Alignment.center);
      return;
    }

    var ofield = this.displayFields.singleWhere((a) => a.fieldId == fs, orElse: () => null);
    if (ofield == null) {
      var field = this.fields.singleWhere((a) => a.fieldId == fs, orElse: () => null);

      if (field != null) {
        this.displayFields.add(DisplayField(
              datastoreId: field.datastoreId,
              fieldId: field.fieldId,
              fieldName: field.fieldName,
              fieldType: field.fieldType,
              displayOrder: this.displayFields.length + 1,
            ));
      }
    }

    this.displayFields = this.displayFields;
  }

  removeField(DisplayField f) {
    this.displayFields.remove(f);

    for (var i = 0; i < this.displayFields.length; i++) {
      this.displayFields[i].displayOrder = i + 1;
    }

    this.displayFields = this.displayFields;
  }

  done(BuildContext context) async {
    await DisplayService.internal().remove(this.datastore.datastoreId);
    this.displayFields.forEach((item) async {
      await DisplayService.internal().saveItem(item);
      BotToast.showText(text: 'info_save_success'.tr, align: Alignment.center);
    });
    eventBus.fire(RefreshEvent());
  }

  cancel() {
    _nav.pop();
  }

  // Add ViewModel specific code here
}
