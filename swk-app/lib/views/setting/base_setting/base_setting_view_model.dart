import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:reactive_forms/reactive_forms.dart';
import 'package:sp_util/sp_util.dart';

class BaseSettingViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();
  bool _readOnly = false;

  final FormGroup form = FormGroup({
    'serverEnv': FormControl<String>(
      validators: [Validators.required],
    ),
    'serverHost': FormControl<String>(
      validators: [Validators.required],
    ),
    'fileServerHost': FormControl<String>(
      validators: [Validators.required],
    ),
  });

  bool get readOnly => this._readOnly;
  set readOnly(bool value) {
    this._readOnly = value;
    notifyListeners();
  }

  init() async {
    // this.serverEnv = Setting.singleton.serverEnv;
    // this.serverHost = Setting.singleton.serverHost;
    // this.fileServerHost = Setting.singleton.fileServerHost;

    this.form.control('serverEnv').value = Setting.singleton.serverEnv;
    this.form.control('serverHost').value = Setting.singleton.serverHost;
    this.form.control('fileServerHost').value = Setting.singleton.fileServerHost;

    if (this.form.control('serverEnv').value == "custom") {
      this.readOnly = false;
    } else {
      this.readOnly = true;
    }
  }

  void done() async {
    Setting.singleton.setServerEnv(this.form.control('serverEnv').value);
    Setting.singleton.setServerHost(this.form.control('serverHost').value);
    Setting.singleton.setFileServerHost(this.form.control('fileServerHost').value);
    var serverEnv = this.form.control('serverEnv').value;
    if (serverEnv == "custom") {
      SpUtil.putString("oserverHost", this.form.control('serverHost').value);
      SpUtil.putString("ofileServerHost", this.form.control('fileServerHost').value);
    }

    _nav.pop();
  }

  void change(String value) {
    this.form.control('serverEnv').value = value;
    if (value == "custom") {
      this.readOnly = false;
    } else {
      this.readOnly = true;
    }

    if (value == "dev") {
      this.form.control('serverHost').value = "https://api.pitdev.tk";
      this.form.control('fileServerHost').value = "https://file.pitdev.tk";
      return;
    }
    if (value == "prod") {
      this.form.control('serverHost').value = "https://api.propluspit.com";
      this.form.control('fileServerHost').value = "https://file.propluspit.com";
      return;
    }

    var serverHost = SpUtil.getString("oserverHost", defValue: "http://192.168.1.41:8080");
    var fileServerHost = SpUtil.getString("ofileServerHost", defValue: "http://192.168.1.112:9090");

    this.form.control('serverHost').value = serverHost;
    this.form.control('fileServerHost').value = fileServerHost;
    return;
  }
  // Add ViewModel specific code here
}
