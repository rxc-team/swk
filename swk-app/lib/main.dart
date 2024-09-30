import 'dart:convert';
import 'dart:io';

import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:get/route_manager.dart';
import 'package:pit3_app/core/i18n/messages.dart';
import 'package:get/get.dart';
import 'package:pit3_app/views/scan/scan_handle/scan_handle_view.dart';
import 'package:pit3_app/views/tab/tab_view.dart';
import 'package:sp_util/sp_util.dart';

import 'core/locator.dart';
import 'core/providers.dart';
import 'core/services/navigator_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:timezone/data/latest_all.dart' as tz;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  tz.initializeTimeZones();
  await SpUtil.getInstance();
  await LocatorInjector.setupLocator();
  runApp(MyApp());

  if (Platform.isAndroid) {
    // 以下两行 设置android状态栏为透明的沉浸。写在组件渲染之后，是为了在渲染后进行set赋值，覆盖状态栏，写在渲染之前MaterialApp组件会覆盖掉这个值。
    SystemUiOverlayStyle systemUiOverlayStyle = SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
    );
    SystemChrome.setSystemUIOverlayStyle(systemUiOverlayStyle);
  }
}

class MyApp extends StatefulWidget {
  MyApp({Key key}) : super(key: key);

  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final _nav = locator.get<NavigatorService>();
  final _messagePlugin = BasicMessageChannel(
    "cn.rxcsoft.pit3/message",
    StringCodec(),
  );

  @override
  void initState() {
    super.initState();
    _messagePlugin.setMessageHandler(
      (String message) => Future<String>(() async {
        var result = jsonDecode(message);
        List<String> scanData = [];
        for (var item in result) {
          scanData.add('$item');
        }
        _nav.navigateToPage(MaterialPageRoute(
          builder: (context) => ScanHandleView(scanData),
        ));
        return "ok";
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: ProviderInjector.providers,
      child: GetMaterialApp(
        debugShowCheckedModeBanner: false,
        // 多语言设置
        localizationsDelegates: [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: Messages.supportedLocales,
        translations: Messages(), // 翻译内容
        locale: Get.deviceLocale, // 默认设置跟随系统语言
        fallbackLocale: Messages.defaultLocale, // 没有找到对应语言的场合，默认使用日语
        // 主题设置
        themeMode: ThemeMode.system,
        darkTheme: ThemeData.dark(),
        theme: ThemeData.light(),
        // 消息提示设置
        builder: BotToastInit(),
        navigatorObservers: [BotToastNavigatorObserver()],
        // 导航设置
        navigatorKey: locator<NavigatorService>().navigatorKey,
        home: TabView(),
      ),
    );
  }
}
