import 'dart:io';

import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/services.dart';

//设定唯一标识
const MethodChannel _methodChannel =
    MethodChannel('cn.rxcsoft.pit3.plugins/skip_native_page');

class SkipPluginUtil {
  static void skipPage(String page) {
    if (Platform.isIOS) {
      BotToast.showText(text: 'IOSデバイスは一時的にRFIDスキャンをサポートしません。');
      return;
    }
    //设定方法名
    _methodChannel.invokeMethod(page);
  }
}
