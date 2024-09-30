import 'package:flutter/material.dart';
import 'package:pit3_app/common/application.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/models/datastore.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:pit3_app/db/condition_service.dart';
import 'package:pit3_app/logic/event/refresh_event.dart';
import 'package:pit3_app/logic/http/api_service.dart';
import 'package:pit3_app/logic/repository/locale_repository.dart';
import 'package:pit3_app/util/translation_util.dart';
import 'package:pit3_app/views/form/add/add_view.dart';
import 'package:pit3_app/views/scan/scan_view.dart';
import 'package:pit3_app/views/search/search_view.dart';

class HomeViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();
  List<Datastore> _datastores = [];
  Datastore _current;
  int _total = 0;
  bool _canCheck = false;
  Map<String, bool> _actions = new Map();
  HomeViewModel();

  List<Datastore> get datastores => this._datastores;
  set datastores(List<Datastore> value) {
    this._datastores = value;
    notifyListeners();
  }

  Map<String, bool> get actions => this._actions;
  set actions(Map<String, bool> value) {
    this._actions = value;
    notifyListeners();
  }

  Datastore get current => this._current;
  set current(Datastore value) {
    this._current = value;
    notifyListeners();
  }

  int get total => this._total;
  set total(int value) {
    this._total = value;
    notifyListeners();
  }

  bool get canCheck => this._canCheck;
  set canCheck(bool value) {
    this._canCheck = value;
    notifyListeners();
  }

  init() async {
    try {
      this.isEmpty = false;
      this.loading = true;
      this.total = 0;
      final result = await ApiService.getDatastores();
      if (result == null) {
        this.isEmpty = true;
        this.loading = false;
        return;
      } else {
        result.sort((a, b) => a.createdAt.compareTo(b.createdAt));
        this.datastores = result;
      }
      this._setCurrent();
      this._setCheck();
      // 按钮权限判定
      // insert
      if (this.current.apiKey == 'keiyakudaicho') {
        this.actions['insert'] = false;
      } else {
        var insert = await ApiService.checkAction('insert', this.current.datastoreId);
        if (insert.data == true) {
          this.actions['insert'] = true;
        } else {
          this.actions['insert'] = false;
        }
      }
      this.loading = false;
    } catch (e) {
      this.isEmpty = true;
      this.loading = false;
    }
  }

  _setCurrent() {
    if (datastores == null || datastores.length == 0) {
      this.isEmpty = true;
      this.loading = false;
      return;
    }

    if (Setting.singleton.currentDatastore == null || Setting.singleton.currentDatastore.isEmpty) {
      var ds = datastores.firstWhere(
        (it) => it.canCheck == true,
        orElse: () => null,
      );
      if (ds != null) {
        this.current = ds;
      } else {
        this.current = datastores.first;
      }
    } else {
      var ds = datastores.firstWhere(
        (it) => it.datastoreId == Setting.singleton.currentDatastore,
        orElse: () => null,
      );
      if (ds != null) {
        this.current = ds;
      } else {
        this.current = datastores.first;
      }
    }

    Setting.singleton.setCurrentDatastore(
      this.current?.datastoreId,
      this.current?.canCheck ?? false,
    );
  }

  _setCheck() {
    if (this.current != null) {
      this.canCheck = Setting.singleton.canCheck && current.datastoreId == Setting.singleton.scanDatastore;
    } else {
      this.canCheck = false;
    }
  }

  change(val) async {
    await ConditionService.internal().clear();
    this.current = this.datastores.where((it) => it.datastoreId == val).first;
    Setting.singleton.setCurrentDatastore(val, this.current.canCheck ?? false);
    eventBus.fire(RefreshEvent());
  }

  setTotal(int total) {
    this.total = total;
  }

  refresh() async {
    eventBus.fire(RefreshEvent());
    var locale = LocaleRepository.getLocal();
    await Translations.load(locale.toLanguageTag());
  }

  //跳转到新规画面
  gotoAdd() {
    _nav.navigateToPage(MaterialPageRoute(
      builder: (context) => AddView(),
    ));
  }

  //跳转到检索画面
  gotoSearch() {
    _nav.navigateToPage(MaterialPageRoute(
      builder: (context) => SearchView(),
    ));
  }

  //跳转到扫描画面
  gotoScan() {
    _nav.navigateToPage(MaterialPageRoute(
      builder: (context) => ScanView(),
    ));
  }
}
