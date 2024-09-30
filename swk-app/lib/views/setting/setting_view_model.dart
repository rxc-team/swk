import 'package:flutter/material.dart';
import 'package:pit3_app/common/application.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/services/local_service.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:pit3_app/logic/event/refresh_event.dart';
import 'package:pit3_app/logic/event/show_image_event.dart';
import 'package:pit3_app/logic/repository/locale_repository.dart';
import 'package:pit3_app/views/about/about_view.dart';
import 'package:pit3_app/views/setting/base_setting/base_setting_view.dart';
import 'package:pit3_app/views/setting/field_setting/field_setting_view.dart';
import 'package:pit3_app/views/setting/scan_setting/scan_setting_view.dart';
import 'package:reactive_forms/reactive_forms.dart';
import 'package:url_launcher/url_launcher.dart';

import 'app_setting/app_setting_view.dart';

class SettingViewModel extends BaseViewModel {
  GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final _local = locator.get<LocalService>();
  final _nav = locator.get<NavigatorService>();
  bool _showImage;
  bool _offline;
  bool _showDetail;
  String _scanDivice;
  int _line;
  Locale _locale = Locale('ja', 'JP');

  final FormGroup form = FormGroup({
    'line': FormControl<int>(
      validators: [Validators.required, Validators.min(10), Validators.max(100)],
    ),
  });

  bool get showImage => this._showImage;
  set showImage(bool value) {
    this._showImage = value;
    notifyListeners();
  }

  bool get offline => this._offline;
  set offline(bool value) {
    this._offline = value;
    notifyListeners();
  }

  bool get showDetail => this._showDetail;
  set showDetail(bool value) {
    this._showDetail = value;
    notifyListeners();
  }

  String get scanDivice => this._scanDivice;
  set scanDivice(String value) {
    this._scanDivice = value;
    notifyListeners();
  }

  int get line => this._line;
  set line(int value) {
    this._line = value;
    notifyListeners();
  }

  Locale get locale => this._locale;
  set locale(Locale value) {
    this._locale = value;
    notifyListeners();
  }

  GlobalKey<FormState> get formKey => this._formKey;

  SettingViewModel();

  init() async {
    this.showDetail = Setting.singleton.showDetail ?? false;
    this.showImage = Setting.singleton.showImage ?? false;
    this.offline = false;
    this.scanDivice = Setting.singleton.scanDivice;
    this.line = Setting.singleton.listLine ?? 10;
    this.form.control('line').value = this.line;
    this.locale = LocaleRepository.getLocal();
  }

  change(Locale locale) async {
    _local.change(locale);
    this.locale = LocaleRepository.getLocal();
  }

  changeDetail(bool value) {
    this.showDetail = value;
    Setting.singleton.setShowDetail(value);
  }

  changeScanDivice(String value) {
    this.scanDivice = value;
    Setting.singleton.setScanDivice(value);
  }

  changeImage(bool value) {
    this.showImage = value;
    Setting.singleton.setShowImage(value);
    eventBus.fire(ShowImageEvent());
  }

  changeOffline(bool value) {
    this.offline = value;
  }

  setLine(int value) {
    this.line = value;
    Setting.singleton.setListLine(value);
    eventBus.fire(RefreshEvent());
  }

  /// 打开隐私声明网站
  openPrivacy() async {
    // const url = 'https://www.proship.co.jp/policy/';
    Uri uri = Uri(scheme: "https", host: "www.proship.co.jp", path: "policy/");
    await launchUrl(uri);
  }

  forSubmitted() {
    if (this.form.valid) {
      this.setLine(this.form.control('line').value);
      _nav.pop();
    }
  }

  //返回
  goBack() {
    _nav.pop();
  }

//设置选中语言
  setSelectLanguage(String value) {
    switch (value) {
      case 'zh':
        this.change(Locale('zh', 'CN'));
        break;
      case 'en':
        this.change(Locale('en', 'US'));
        break;
      case 'ja':
        this.change(Locale('ja', 'JP'));
        break;
      case 'th':
        this.change(Locale('th', 'TH'));
        break;
      default:
    }
  }

//跳转到应用设置
  goAppSettingView(BuildContext context) {
    _nav.navigateToPage(MaterialPageRoute(builder: (context) {
      return AppSettingView();
    }));
  }

//跳转到基本设置
  goBaseSettingView(BuildContext context) {
    _nav.navigateToPage(MaterialPageRoute(builder: (context) {
      return BaseSettingView();
    }));
  }

//跳转到台账显示字段设置
  goFieldSettingView(BuildContext context) {
    _nav.navigateToPage(MaterialPageRoute(builder: (context) {
      return FieldSettingView();
    }));
  }

//跳转到扫描设置
  goScanSettingView(BuildContext context) {
    _nav.navigateToPage(MaterialPageRoute(builder: (context) {
      return ScanSettingView();
    }));
  }

//跳转到关于我们画面
  goAboutView(BuildContext context) {
    Navigator.of(context).push(MaterialPageRoute(builder: (context) {
      return AboutView();
    }));
  }

  // Add ViewModel specific code here
}
