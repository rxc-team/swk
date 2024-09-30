import 'package:pit3_app/core/models/login.dart';
import 'package:pit3_app/core/models/user.dart';
import 'package:sp_util/sp_util.dart';

class UserRepository {
  void deleteToken() {
    SpUtil.remove("token");
    return;
  }

  Future<void> persistToken(Login user) async {
    await SpUtil.putString("token", user.accessToken);
    await _saveInfo(user.user);
    return;
  }

  Future<void> _saveInfo(User _user) async {
    await SpUtil.putString("userId", _user.userId);
    await SpUtil.putString("name", _user.userName);
    await SpUtil.putString("email", _user.email);
    await SpUtil.putString("currentApp", _user.currentApp);
    await SpUtil.putString("timezone", _user.timezone);
    await SpUtil.putString("avatar", _user.avatar);
    await SpUtil.putString("company", _user.customerName);
  }

  bool hasToken() {
    String token = SpUtil.getString("token", defValue: "");
    if (token.isNotEmpty) {
      return true;
    }
    return false;
  }
}
