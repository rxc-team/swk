import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:get/get.dart';

class LoadingIndicator extends StatefulWidget {
  final String msg;
  LoadingIndicator({Key key, @required this.msg}) : super(key: key);
  @override
  _LoadingIndicatorState createState() => _LoadingIndicatorState();
}

class _LoadingIndicatorState extends State<LoadingIndicator> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Material(
        child: Container(
          color: Get.theme.cardColor,
          child: Center(
            child: Container(
              height: 80,
              child: Column(
                children: <Widget>[
                  Expanded(
                    child: SpinKitFadingCircle(color: Get.theme.primaryColor),
                  ),
                  SizedBox(
                    height: 5.0,
                  ),
                  Center(
                    child: Text(
                      widget.msg,
                      style: TextStyle(color: Get.theme.primaryColor, fontSize: 14.0),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
