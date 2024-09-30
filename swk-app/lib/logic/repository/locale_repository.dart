import 'package:flutter/material.dart';
import 'package:sp_util/sp_util.dart';

class LocaleRepository {
  static Locale getLocal() {
    String languageCode = SpUtil.getString("language_code");
    String countryCode = SpUtil.getString("country_code");
    return Locale(languageCode, countryCode);
  }

  static void setLocal(Locale locale) {
    SpUtil.putString("language_code", locale.languageCode);
    SpUtil.putString("country_code", locale.countryCode);
  }

  static bool hasLocal() {
    if (SpUtil.containsKey("language_code") && SpUtil.containsKey("country_code")) {
      return true;
    }
    return false;
  }
}
