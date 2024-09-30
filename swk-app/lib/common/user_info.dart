import 'package:pit3_app/core/models/user.dart';
import 'package:sp_util/sp_util.dart';

class UserInfo {
  static final UserInfo singleton = UserInfo._internal();

  factory UserInfo() {
    return singleton;
  }

  UserInfo._internal();

  String token = '';
  String userId = '';
  String name = '';
  String email = '';
  String signature = '';
  String group = '';
  String timezone = '';
  String currentApp = '';
  String avatar = '';
  String company = '';
  List<String> roles = [];
  List<String> apps = [];
  String domain = '';

  void saveUserInfo(String token, User _user) {
    this.token = token;
    this.userId = _user.userId;
    this.name = _user.userName;
    this.email = _user.email;
    this.signature = _user.signature;
    this.group = _user.group;
    this.currentApp = _user.currentApp;
    this.roles = _user.roles;
    this.apps = _user.apps;
    this.domain = _user.domain;
    this.timezone = _user.timezone;
    this.avatar = _user.avatar;
    this.company = _user.customerName;
    _saveInfo();
  }

  void getUserInfo() {
    this.token = SpUtil.getString("token", defValue: "");
    this.userId = SpUtil.getString("userId", defValue: "");
    this.name = SpUtil.getString("name", defValue: "");
    this.email = SpUtil.getString("email", defValue: "");
    this.signature = SpUtil.getString("signature", defValue: "");
    this.group = SpUtil.getString("group", defValue: "");
    this.currentApp = SpUtil.getString("currentApp", defValue: "");
    this.domain = SpUtil.getString("domain", defValue: "");
    this.timezone = SpUtil.getString("timezone", defValue: "");
    this.avatar = SpUtil.getString("avatar", defValue: "");
    this.company = SpUtil.getString("company", defValue: "");
    this.roles = SpUtil.getStringList("roles", defValue: []);
    this.apps = SpUtil.getStringList("apps", defValue: []);
  }

  void setCurrentApp(String appID) {
    SpUtil.putString("currentApp", appID);
    this.currentApp = appID;
  }

  void _saveInfo() {
    SpUtil.putString("userId", userId);
    SpUtil.putString("name", name);
    SpUtil.putString("email", email);
    SpUtil.putString("signature", signature);
    SpUtil.putString("group", group);
    SpUtil.putString("currentApp", currentApp);
    SpUtil.putStringList("roles", roles);
    SpUtil.putStringList("apps", apps);
    SpUtil.putString("domain", domain);
    SpUtil.putString("timezone", timezone);
    SpUtil.putString("avatar", avatar);
    SpUtil.putString("company", company);
  }

  void clearUserInfo() {
    token = '';
    userId = '';
    name = '';
    email = '';
    signature = '';
    group = '';
    currentApp = '';
    roles = [];
    apps = [];
    domain = '';
    timezone = '';
    avatar = '';
    company = '';
    clearInfo();
  }

  void clearInfo() {
    SpUtil.putString("token", "");
    SpUtil.putString("userId", "");
    SpUtil.putString("name", "");
    SpUtil.putString("email", "");
    SpUtil.putString("signature", "");
    SpUtil.putString("group", "");
    SpUtil.putString("currentApp", "");
    SpUtil.putStringList("roles", []);
    SpUtil.putStringList("apps", []);
    SpUtil.putString("domain", "");
    SpUtil.putString("timezone", "");
    SpUtil.putString("avatar", "");
    SpUtil.putString("company", "");
  }
}
