import 'package:sp_util/sp_util.dart';

class AppRepository {
  static String getApp() {
    String appID = SpUtil.getString("currentApp", defValue: "");
    return appID;
  }

  static void setApp(String appID) {
    SpUtil.putString("currentApp", appID);
    return;
  }

  static bool hasApp() {
    String appID = SpUtil.getString("currentApp", defValue: "");
    if (appID.isNotEmpty) {
      return true;
    }
    return false;
  }
}
