import 'package:flutter/material.dart';
import 'package:get/get.dart';

class NotFoundWidget extends StatelessWidget {
  const NotFoundWidget({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final String _emptyImgPath = "images/ic_empty.png";
    final FontWeight _fontWidget = FontWeight.w600; //错误页面和空页面的字体粗度
    return Container(
      alignment: Alignment.center,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Image(
            color: Colors.black12,
            image: AssetImage(_emptyImgPath),
            width: 150,
            height: 150,
          ),
          Container(
            margin: EdgeInsets.fromLTRB(0, 10, 0, 0),
            child: Text('empty_msg'.tr,
                style: TextStyle(
                  color: Colors.grey,
                  fontWeight: _fontWidget,
                )),
          ),
        ],
      ),
    );
  }
}
