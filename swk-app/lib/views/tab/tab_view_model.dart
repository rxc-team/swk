import 'package:flutter/material.dart';
import 'package:pit3_app/common/application.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:get/get.dart';
import 'package:pit3_app/logic/event/refresh_event.dart';
import 'package:pit3_app/logic/repository/app_repository.dart';
import 'package:pit3_app/logic/repository/locale_repository.dart';
import 'package:pit3_app/logic/repository/user_repository.dart';
import 'package:pit3_app/util/translation_util.dart' as ts;
import 'package:pit3_app/views/home/home_view.dart';
import 'package:pit3_app/views/login/login_view.dart';
import 'package:pit3_app/views/setting/setting_view.dart';

class TabViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();

  TabViewModel();

  // 图标
  Icon _home = Icon(Icons.home_outlined);
  Icon _setting = Icon(Icons.settings_outlined);
  //当前选中项的索引
  int _selectedIndex = 0;

  List<Widget> _pages = <Widget>[
    HomeView(),
    SettingView(),
  ];

  Icon get home => this._home;
  set home(Icon value) {
    this._home = value;
    notifyListeners();
  }

  Icon get setting => this._setting;
  set setting(Icon value) {
    this._setting = value;
    notifyListeners();
  }

  int get selectedIndex => this._selectedIndex;
  set selectedIndex(int value) {
    this._selectedIndex = value;
    notifyListeners();
  }

  List<Widget> get pages => this._pages;
  set pages(List<Widget> value) {
    this._pages = value;
    notifyListeners();
  }

  // 初始化app
  init(BuildContext context) async {
    this.loading = true;
    this.message = '';

    // 初始化基本项目
    await this._getSettingInfo();
    bool auth = this._checkAuth();
    if (!auth) {
      _nav.pushAndRemoveUntil(
        MaterialPageRoute(
          builder: (context) => LoginView(),
        ),
      );
      return;
    }

    // // 加载语言
    var hasLcal = LocaleRepository.hasLocal();
    if (hasLcal) {
      Locale locale = LocaleRepository.getLocal();
      Get.updateLocale(locale);
      await ts.Translations.load(locale.toLanguageTag());
    } else {
      await ts.Translations.load('ja-JP');
    }
    this.loading = false;
  }

  // 设置初始化
  _getSettingInfo() async {
    Setting.singleton.getFileServerHost();
    Setting.singleton.getScanDatastore();
    Setting.singleton.getScanField();
    Setting.singleton.getCurrentDatastore();
    Setting.singleton.getListLine();
    Setting.singleton.getServerEnv();
    Setting.singleton.getServerHost();
    Setting.singleton.getScanDivice();
    Setting.singleton.getShowDetail();
    Setting.singleton.getShowImage();
  }

  // 检查是否登录
  bool _checkAuth() {
    UserRepository ur = UserRepository();
    bool result = ur.hasToken();
    return result;
  }

  // 变更app
  changeApp(String app) {
    AppRepository.setApp(app);
  }

  // 退出登录
  logout() {
    UserRepository ur = UserRepository();
    ur.deleteToken();
    // Setting.singleton.clearSetting();
    _nav.pushAndRemoveUntil(
      MaterialPageRoute(
        builder: (context) => LoginView(),
      ),
    );
  }

  refresh() async {
    eventBus.fire(RefreshEvent());
    var locale = LocaleRepository.getLocal();
    Get.updateLocale(locale);
    await ts.Translations.load(locale.toLanguageTag());
  }

  goBack(bool backFlg) {
    _nav.pop(backFlg);
  }

  //选择按下处理 设置当前索引为index值
  void onItemTapped(int index) {
    this.selectedIndex = index;
    if (index == 0) {
      this.home = Icon(Icons.home);
      this.setting = Icon(Icons.settings_outlined);
    } else {
      this.home = Icon(Icons.home_outlined);
      this.setting = Icon(Icons.settings);
    }
  }
}
