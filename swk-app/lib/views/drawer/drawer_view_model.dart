import 'package:flutter/material.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:pit3_app/logic/repository/user_repository.dart';
import 'package:pit3_app/views/login/login_view.dart';
import 'package:sp_util/sp_util.dart';

class DrawerViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();
  bool _auth = false;

  bool get auth => this._auth;
  set auth(bool value) {
    this._auth = value;
    notifyListeners();
  }

  DrawerViewModel();

  // Add ViewModel specific code here
  init() {
    UserRepository ur = UserRepository();
    bool result = ur.hasToken();
    auth = result;
  }

  logout() {
    UserRepository ur = UserRepository();
    ur.deleteToken();
    _nav.pushAndRemoveUntil(
      MaterialPageRoute(
        builder: (context) => LoginView(),
      ),
    );
  }

  void onLoginClick(BuildContext context) async {
    Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (context) {
      return LoginView();
    }));
  }

  ImageProvider avatar() {
    String avatar = SpUtil.getString("avatar", defValue: "");
    if (avatar == null || avatar.isEmpty) {
      return AssetImage('images/default_user_header.png');
    }

    var url = Setting.singleton.buildFileURL(avatar);

    return NetworkImage(url);
  }
}
