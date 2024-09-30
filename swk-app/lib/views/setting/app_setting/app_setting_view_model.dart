import 'package:flutter/material.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/models/app.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:pit3_app/db/update_service.dart';
import 'package:pit3_app/logic/http/api_service.dart';
import 'package:pit3_app/logic/repository/app_repository.dart';
import 'package:pit3_app/views/tab/tab_view.dart';
import 'package:sp_util/sp_util.dart';

class AppSettingViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();
  String _currentApp = '';
  String _currentAppName = '';
  List<AppData> _apps = [];

  // 当前app
  String get currentApp => this._currentApp;
  set currentApp(String value) {
    this._currentApp = value;
    notifyListeners();
  }

  // 当前app
  String get currentAppName => this._currentAppName;
  set currentAppName(String value) {
    this._currentAppName = value;
    notifyListeners();
  }

  // 所有app
  List<AppData> get apps => this._apps;
  set apps(List<AppData> value) {
    this._apps = value;
    notifyListeners();
  }

  AppSettingViewModel();

  init() async {
    this.loading = true;
    final bool hasApp = AppRepository.hasApp();
    if (hasApp) {
      var result = await ApiService.getApps();
      final String app = AppRepository.getApp();
      if (result != null) {
        currentApp = app;
        apps = result;
        currentAppName = apps.firstWhere((a) => a.appId == currentApp).appName;
      } else {
        currentApp = app;
        currentAppName = '';
        apps = [];
      }
    } else {
      currentApp = SpUtil.getString("currentApp", defValue: "");
      SpUtil.putString("currentApp", currentApp);
      var result = await ApiService.getApps();
      if (result != null) {
        apps = result;
        currentAppName = apps.firstWhere((a) => a.appId == currentApp).appName;
      } else {
        currentAppName = '';
        apps = [];
      }
    }
    this.loading = false;
  }

  selectApp(String appId) {
    currentApp = appId;
    currentAppName = apps.firstWhere((a) => a.appId == appId).appName;
  }

  changeApp() async {
    if (currentApp.isNotEmpty) {
      bool result = await ApiService.changeApp(currentApp);
      if (result) {
        AppRepository.setApp(currentApp);
        Setting.singleton.setScanDatastore('');
        await UpdateService.internal().clear();

        _nav.navigateToPageWithReplacement(MaterialPageRoute(
          builder: (context) => TabView(),
        ));
      }
    }
  }

  // Add ViewModel specific code here
}
