import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:pit3_app/util/skip_util.dart';

class ScanViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();
  String _scanDivice;

  String get scanDivice => this._scanDivice;
  set scanDivice(String value) {
    this._scanDivice = value;
    notifyListeners();
  }

  ScanViewModel();

  init() async {
    this.scanDivice = Setting.singleton.scanDivice;
    if (scanDivice == 'rfid') {
      SkipPluginUtil.skipPage('rfidScanner');
      _nav.pop();
    }
  }

  // Add ViewModel specific code here
}
