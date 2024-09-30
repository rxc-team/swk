import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart' as dio;
import 'package:get/get.dart';
import 'package:pit3_app/logic/http/api.dart';

class NetWorkCheck extends StatefulWidget {
  NetWorkCheck({Key key}) : super(key: key);

  @override
  _NetWorkCheckState createState() => _NetWorkCheckState();
}

class _NetWorkCheckState extends State<NetWorkCheck> {
  String message = '';
  final Connectivity _connectivity = Connectivity();
  StreamSubscription<ConnectivityResult> _connectivitySubscription;

  @override
  void initState() {
    super.initState();
    this.checkNet();
    this._connectivitySubscription = _connectivity.onConnectivityChanged.listen((res) {
      this.checkNet();
    });
  }

  @override
  void dispose() {
    super.dispose();
    this._connectivitySubscription.cancel();
  }

  @override
  Widget build(BuildContext context) {
    if (message.isEmpty) {
      return Container();
    }

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Get.theme.errorColor.withAlpha(160),
      ),
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Text(message.tr, style: TextStyle(color: Colors.white)),
    );
  }

  // 检查网络情况
  checkNet() async {
    try {
      final ConnectivityResult result = await _connectivity.checkConnectivity();
      switch (result) {
        case ConnectivityResult.mobile:
        case ConnectivityResult.wifi:
          final ping = await _pingIp();
          if (!ping) {
            setState(() {
              message = 'error_server';
            });
            break;
          }

          setState(() {
            message = '';
          });
          break;
        case ConnectivityResult.none:
          setState(() {
            message = 'error_no_net';
          });

          break;
        default:
          setState(() {
            message = '';
          });
          break;
      }
    } catch (e) {}
  }

  // ping网络
  _pingIp() async {
    var _dio = new dio.Dio();
    try {
      dio.Response<dynamic> ping = await _dio.get(Api.getUrl('/ping')).timeout(Duration(seconds: 3));
      if (ping.statusCode == 200) {
        return true;
      }
    } catch (e) {
      return false;
    }

    return false;
  }
}
