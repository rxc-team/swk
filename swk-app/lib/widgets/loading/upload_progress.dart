import 'package:flutter/material.dart';
import 'package:get/get.dart';

class UploadProgress extends StatelessWidget {
  final double process;
  const UploadProgress({Key key, this.process = 0}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (process == 0) {
      return Container();
    }
    return Container(
      width: 50,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // 圆形进度条直径指定为100
          Container(
            padding: EdgeInsets.only(top: 20),
            alignment: Alignment.center,
            child: SizedBox(
              height: 18,
              width: 18,
              child: CircularProgressIndicator(
                backgroundColor: Get.theme.cardColor,
                valueColor: AlwaysStoppedAnimation(Colors.greenAccent),
                strokeWidth: 2.0,
                value: process,
              ),
            ),
          ),
          Text(
            (process * 100).toStringAsFixed(0) + '%',
            style: TextStyle(fontSize: 12),
          )
        ],
      ),
    );
  }
}
