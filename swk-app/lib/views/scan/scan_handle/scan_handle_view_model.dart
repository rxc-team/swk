import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:pit3_app/db/condition_service.dart';
import 'package:get/get.dart';
import 'package:pit3_app/logic/http/api_service.dart';
import 'package:pit3_app/core/models/common_model.dart';
import 'package:pit3_app/core/models/search_condition.dart';
import 'package:pit3_app/views/scan/check_update.dart';
import 'package:pit3_app/views/scan/scan_list/scan_list_view.dart';
import 'package:pit3_app/views/setting/scan_setting/scan_setting_view.dart';
import 'package:pit3_app/widgets/loading/loading_indicator.dart';

class ScanHandleViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();
  List<CheckStatus> _scanData = [];
  List<Widget> _changes = [];
  Map<String, Map<String, dynamic>> _updateData = Map();

  List<CheckStatus> get scanData => this._scanData;
  set scanData(List<CheckStatus> value) {
    this._scanData = value;
    notifyListeners();
  }

  List<Widget> get changes => this._changes;
  set changes(List<Widget> value) {
    this._changes = value;
    notifyListeners();
  }

  Map<String, Map<String, dynamic>> get updateData => this._updateData;
  set updateData(Map<String, Map<String, dynamic>> value) {
    this._updateData = value;
    notifyListeners();
  }

  List<String> _scanFields = [];
  String _scanConnector = '_';
  List<String> get scanFields => this._scanFields;
  set scanFields(List<String> value) {
    this._scanFields = value;
    notifyListeners();
  }

  String get scanConnector => this._scanConnector;
  set scanConnector(String value) {
    this._scanConnector = value;
    notifyListeners();
  }

  ScanHandleViewModel();

  init(List<String> data, List<String> fields, String connector) {
    this.loading = true;
    for (var item in data) {
      this.scanData.add(CheckStatus(value: item, status: '1', errorMsg: ''));
    }
    this.loading = false;
  }

  scan(BuildContext context, int index) async {
    var hide = BotToast.showCustomLoading(toastBuilder: (cancelFunc) {
      return LoadingIndicator(
        msg: 'scan_query_loading'.tr,
      );
    });
    if (Setting.singleton.scanDatastore == null || Setting.singleton.scanDatastore.isEmpty) {
      BotToast.showText(text: 'error_not_set_scan'.tr);
      _nav.navigateToPage(MaterialPageRoute(
        builder: (context) => ScanSettingView(),
      ));
    } else {
      if (this.scanFields.length == 0) {
        var ds = await ApiService.getDatastore(Setting.singleton.scanDatastore);
        if (ds != null) {
          this.scanConnector = ds.scanFieldsConnector;

          if (ds.scanFields == null || ds.scanFields.length == 0) {
            hide();
            BotToast.showText(text: 'scan_config_not_set'.tr);
            return;
          }
          this.scanFields.clear();
          ds.scanFields.forEach((e) {
            this.scanFields.add(e);
          });
        } else {
          hide();
          return;
        }
      }

      this.scanData[index].status = '2';

      var conditionList = await ConditionService.internal().getConditionList();
      final List<SearchCondition> conditions = [];
      for (var item in conditionList) {
        SearchCondition sct = SearchCondition.fromJson(item);
        conditions.add(sct);
      }

      var value = this.scanData[index].value;

      List<String> searchValues = value.split(scanConnector);

      if (scanFields.isNotEmpty && searchValues.isNotEmpty) {
        if (scanFields.length == searchValues.length) {
          final fResult = await ApiService.getFields(Setting.singleton.scanDatastore);
          for (var i = 0; i < scanFields.length; i++) {
            String sfd = scanFields[i];
            var fd = fResult.singleWhere((f) => f.fieldId == sfd, orElse: () => null);
            if (fd != null) {
              conditions.add(SearchCondition(
                fieldId: fd.fieldId,
                fieldType: fd.fieldType,
                searchOperator: "=",
                searchValue: searchValues[i],
                conditionType: '',
                isDynamic: true,
              ));
            }
          }
        } else {
          hide();
          BotToast.showText(text: 'error_scan_data_not_match'.tr);
          return;
        }
      }

      final items = await ApiService.getItems(
        Setting.singleton.scanDatastore,
        conditions: conditions,
        conditionType: 'and',
      );

      if (items != null) {
        if (items.total == 1) {
          bool scanResult = await ApiService.inventoryItem(
            Setting.singleton.scanDatastore,
            items.itemsList.first.itemId,
            'Scan',
          );
          if (scanResult) {
            this.scanData[index].status = '3';
          }
          CheckUpdate.showAlert(
            context,
            Setting.singleton.scanDatastore,
            [items.itemsList.first.itemId],
          );
        } else if (items.total > 1) {
          this.scanData[index].status = '3';
          int checkCount = await _nav.navigateToPage(MaterialPageRoute(builder: (context) => ScanListView(conditions)));
          if (checkCount > 0) {
            this.scanData[index].errorMsg = 'info_mutil_scan_result'.trParams({
              'total': items.total.toString(),
              'count': checkCount.toString(),
            });
          }
        } else {
          this.scanData[index].status = '4';
          this.scanData[index].errorMsg = 'scan_not_found_data'.tr;
        }
      } else {
        this.scanData[index].status = '4';
        this.scanData[index].errorMsg = 'scan_not_found_data'.tr;
      }
    }
    hide();
    this.scanData = this.scanData;
  }

  mutilScan(BuildContext context) async {
    var hide = BotToast.showCustomLoading(toastBuilder: (cancelFunc) {
      return LoadingIndicator(
        msg: 'scan_query_loading'.tr,
      );
    });

    if (this.scanFields.length == 0) {
      var ds = await ApiService.getDatastore(Setting.singleton.scanDatastore);
      if (ds != null) {
        this.scanConnector = ds.scanFieldsConnector;

        if (ds.scanFields == null || ds.scanFields.length == 0) {
          hide();
          BotToast.showText(text: 'scan_config_not_set'.tr);
          return;
        }
        this.scanFields.clear();
        ds.scanFields.forEach((e) {
          this.scanFields.add(e);
        });
      } else {
        hide();
        return;
      }
    }

    List<String> _findItems = [];
    for (var item in scanData) {
      if (item.status == '1') {
        var conditionList = await ConditionService.internal().getConditionList();
        final List<SearchCondition> conditions = [];
        for (var item in conditionList) {
          SearchCondition sct = SearchCondition.fromJson(item);
          conditions.add(sct);
        }

        List<String> searchValues = item.value.split(scanConnector);

        if (scanFields.isNotEmpty && searchValues.isNotEmpty) {
          if (scanFields.length == searchValues.length) {
            final fResult = await ApiService.getFields(Setting.singleton.scanDatastore);
            for (var i = 0; i < scanFields.length; i++) {
              String sfd = scanFields[i];
              var fd = fResult.singleWhere((f) => f.fieldId == sfd, orElse: () => null);
              if (fd != null) {
                conditions.add(SearchCondition(
                  fieldId: fd.fieldId,
                  fieldType: fd.fieldType,
                  searchOperator: "=",
                  searchValue: searchValues[i],
                  conditionType: '',
                  isDynamic: true,
                ));
              }
            }
          } else {
            hide();
            BotToast.showText(text: 'error_scan_data_not_match'.tr);
            return;
          }
        }

        final items = await ApiService.getItems(
          Setting.singleton.scanDatastore,
          conditions: conditions,
          conditionType: 'and',
        );

        if (items != null) {
          if (items.total == 1) {
            _findItems.add(items.itemsList.first.itemId);
            item.status = '2';
          } else if (items.total > 1) {
            items.itemsList.forEach((e) {
              _findItems.add(e.itemId);
            });
            item.status = '3';
            item.errorMsg = 'info_mutil_scan_result'.trParams({
              'total': items.total.toString(),
              'count': items.total.toString(),
            });
          } else {
            item.status = '4';
            item.errorMsg = 'scan_not_found_data'.tr;
          }
        } else {
          item.status = '4';
          item.errorMsg = 'scan_not_found_data'.tr;
        }
      }
    }

    if (_findItems.length > 0) {
      bool result = await ApiService.mutilInventoryItem(
        Setting.singleton.scanDatastore,
        "Scan",
        _findItems,
      );

      if (result) {
        scanData.forEach((d) {
          if (d.status == '2') {
            d.status = '3';
          }
        });
      } else {
        scanData.forEach((d) {
          if (d.status == '2') {
            d.status = '4';
          }
        });
      }

      scanData = scanData;

      CheckUpdate.showAlert(
        context,
        Setting.singleton.scanDatastore,
        _findItems,
      );
      hide();
      return;
    } else {
      scanData = scanData;
      hide();
    }
  }

  String getStatusName(String s, BuildContext context) {
    if (s == '1') {
      return 'button_check'.tr;
    }
    if (s == '2') {
      return 'check_result_handler'.tr;
    }
    if (s == '3') {
      return 'check_result_success'.tr;
    }
    return 'check_result_failure'.tr;
  }

  pop() {
    List<String> unCheckedData = [];
    for (var item in scanData) {
      if (item.status == '1') {
        unCheckedData.add(item.value);
      }
    }

    _nav.pop(unCheckedData);
  }

  // Add ViewModel specific code here
}
