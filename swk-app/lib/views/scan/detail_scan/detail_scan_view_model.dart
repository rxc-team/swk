import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/models/search_condition.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:get/get.dart';
import 'package:pit3_app/logic/http/api_service.dart';
import 'package:pit3_app/views/scan/check_update.dart';
import 'package:pit3_app/views/setting/scan_setting/scan_setting_view.dart';
import 'package:pit3_app/widgets/loading/loading_indicator.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';

class DetailScanViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();
  QRViewController _scanController;
  bool _flashState = false;
  String _scanText = '';
  String _itemId = '';
  String _scanDivice = '';

  String get scanDivice => this._scanDivice;
  set scanDivice(String value) {
    this._scanDivice = value;
    notifyListeners();
  }

  QRViewController get controller => this._scanController;
  set controller(QRViewController value) {
    this._scanController = value;
    notifyListeners();
  }

  bool get flashState => this._flashState;
  set flashState(bool value) {
    this._flashState = value;
    notifyListeners();
  }

  String get scanText => this._scanText;
  set scanText(String value) {
    this._scanText = value;
    notifyListeners();
  }

  String get itemId => this._itemId;
  set itemId(String value) {
    this._itemId = value;
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

  DetailScanViewModel();

  init(String itemId) {
    this.flashState = false;
    this.loading = false;
    this.scanText = '';
    this.itemId = itemId;
    this.scanDivice = Setting.singleton.scanDivice;
  }

  taggleFlash() {
    if (controller != null) {
      controller.toggleFlash();
      this.flashState = !this.flashState;
    }
  }

  close() {
    this.controller.dispose();
  }

  onQRViewCreated(
    BuildContext context,
    QRViewController controller,
  ) async {
    this.controller = controller;
    controller.scannedDataStream.listen((scanData) {
      if (scanData.code.isNotEmpty) {
        this.controller.pauseCamera();
        var hide = BotToast.showCustomLoading(toastBuilder: (cancelFunc) {
          return LoadingIndicator(
            msg: 'scan_query_loading'.tr,
          );
        });
        scanText = scanData.code;
        scan(context, scanText, hide);
      }
    });
  }

  onScan(BuildContext context, String value) {
    var hide = BotToast.showCustomLoading(toastBuilder: (cancelFunc) {
      return LoadingIndicator(
        msg: 'scan_query_loading'.tr,
      );
    });
    scanText = value;
    scan(context, scanText, hide);
  }

  scan(BuildContext context, String value, Function() hide) async {
    if (Setting.singleton.scanDatastore == null || Setting.singleton.scanDatastore.isEmpty) {
      hide();
      BotToast.showText(text: 'error_not_set_scan'.tr);
      var result = await _nav.navigateToPage(MaterialPageRoute(
        builder: (context) => ScanSettingView(),
      ));
      if (result) {
        this.controller.resumeCamera();
      }
      return;
    }

    if (this.scanFields.length == 0) {
      var ds = await ApiService.getDatastore(Setting.singleton.scanDatastore);
      if (ds != null) {
        this.scanConnector = ds.scanFieldsConnector;

        if (ds.scanFields == null || ds.scanFields.length == 0) {
          hide();
          BotToast.showText(text: 'scan_config_not_set'.tr);
          this.controller.resumeCamera();
          return;
        }
        this.scanFields.clear();
        ds.scanFields.forEach((e) {
          this.scanFields.add(e);
        });
      } else {
        hide();
        this.controller.resumeCamera();
        return;
      }
    }

    final List<SearchCondition> conditions = [];

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
        this.controller.resumeCamera();
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
      if (items.total == 1 && items.itemsList[0].itemId == this.itemId) {
        bool scanResult = await ApiService.inventoryItem(
          Setting.singleton.scanDatastore,
          itemId,
          'Scan',
        );
        if (scanResult) {
          hide();
          BotToast.showText(text: 'info_scan_success'.tr);
          CheckUpdate.showAlert(
            context,
            Setting.singleton.scanDatastore,
            [itemId],
          );
          _nav.pop(true);
        }
        return;
      } else {
        hide();
        BotToast.showText(text: 'scan_not_found_data'.tr);
        this.controller.resumeCamera();
      }
    } else {
      hide();
      BotToast.showText(text: 'scan_not_found_data'.tr);
      this.controller.resumeCamera();
    }
  }

  cancel() {
    _nav.pop();
  }

  pauseCamera() {
    controller.pauseCamera();
  }

  resumeCamera() {
    controller.resumeCamera();
  }
  // Add ViewModel specific code here
}
