import 'package:flutter/material.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/models/login.dart';
import 'package:pit3_app/core/models/result.dart';
import 'package:pit3_app/core/services/local_service.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:pit3_app/db/condition_service.dart';
import 'package:pit3_app/db/update_service.dart';
import 'package:pit3_app/logic/http/api_service.dart';
import 'package:pit3_app/logic/repository/app_repository.dart';
import 'package:pit3_app/logic/repository/locale_repository.dart';
import 'package:pit3_app/logic/repository/user_repository.dart';
import 'package:pit3_app/util/translation_util.dart';
import 'package:pit3_app/views/setting/app_setting/app_setting_view.dart';
import 'package:pit3_app/views/tab/tab_view.dart';
import 'package:sp_util/sp_util.dart';

class LoginViewModel extends BaseViewModel {
  final _local = locator.get<LocalService>();
  final _nav = locator.get<NavigatorService>();
  bool _obscureTextLogin;

  bool get obscureTextLogin => this._obscureTextLogin;
  set obscureTextLogin(bool value) {
    this._obscureTextLogin = value;
    notifyListeners();
  }

  init() {
    this.obscureTextLogin = true;
    this.loading = false;
  }

  LoginViewModel();

  Future<void> login(Map<String, Object> value) async {
    this.loading = true;

    String username = value['email'];
    String password = value['password'];

    UserRepository ur = UserRepository();
    Result result = await ApiService.login(username, password);
    if (result == null) {
      this.loading = false;
      return false;
    }
    if (result.status == 0) {
      var lg = Login.fromJson(result.data);
      // 设置语言
      String langage = lg.user.language;
      Locale locale;
      switch (langage) {
        case 'zh-CN':
          locale = Locale('zh', 'CN');
          break;
        case 'en-US':
          locale = Locale('en', 'US');
          break;
        case 'ja-JP':
          locale = Locale('ja', 'JP');
          break;
        case 'th-TH':
          locale = Locale('th', 'TH');
          break;
        default:
          locale = LocaleRepository.getLocal();
          break;
      }

      // 设置当前app
      String currentApp = lg.user.currentApp;
      AppRepository.setApp(currentApp);
      String userId = SpUtil.getString("userId", defValue: "");
      // 盘点当前用户是否为上一次登录用户，如果不是则清空设置。
      if (lg.user.userId != userId) {
        Setting.singleton.clearSetting();
        await ConditionService.internal().clear();
        await UpdateService.internal().clear();
      }

      await ur.persistToken(lg);

      this.change(locale);

      if (lg.isValidApp != true) {
        var locale = LocaleRepository.getLocal();
        await Translations.load(locale.toLanguageTag());
        bool result = await _nav.navigateToPage(MaterialPageRoute(
          builder: (context) => AppSettingView(),
        ));

        if (result) {
          _nav.navigateToPageWithReplacement(MaterialPageRoute(
            builder: (context) => TabView(),
          ));
          this.loading = false;
          return;
        } else {
          ur.deleteToken();
          clearInfo();
          this.loading = false;
          return;
        }
      }
      _nav.navigateToPageWithReplacement(MaterialPageRoute(
        builder: (context) => TabView(),
      ));
      this.loading = false;
      return;
    }
    if (result.status == 2) {
      this.message = result.message;
      this.loading = false;
      return;
    }
    this.message = result.message;
    this.loading = false;
    return;
  }

  change(Locale locale) {
    _local.change(locale);
  }

  changeObscure() {
    this.message = '';
    this.obscureTextLogin = !this.obscureTextLogin;
  }

  goBack(BuildContext context, bool isExit) {
    Navigator.of(context).pop(isExit);
  }

  changeLanguage(String value) {
    switch (value) {
      case 'zh':
        _local.change(Locale('zh', 'CN'));
        break;
      case 'en':
        _local.change(Locale('en', 'US'));
        break;
      case 'ja':
        _local.change(Locale('ja', 'JP'));
        break;
      default:
    }
  }

  void clearInfo() {
    SpUtil.putString("token", "");
    SpUtil.putString("userId", "");
    SpUtil.putString("name", "");
    SpUtil.putString("email", "");
    SpUtil.putString("currentApp", "");
    SpUtil.putString("timezone", "");
    SpUtil.putString("avatar", "");
    SpUtil.putString("company", "");
  }
}
