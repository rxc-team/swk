import 'package:flutter/material.dart';
import 'package:get/get.dart';

class NoticeWidget extends StatelessWidget {
  final String msg;
  final Function cancelFunc;
  const NoticeWidget(this.msg, this.cancelFunc, {Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        // color: Colors.redAccent,
        borderRadius: BorderRadius.all(
          Radius.circular(
            8.0,
          ),
        ),
      ),
      padding: EdgeInsets.all(8.0),
      height: 100,
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Column(
        children: <Widget>[
          Container(
            height: 30,
            decoration: BoxDecoration(
              color: Get.theme.errorColor,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(8.0),
                topRight: Radius.circular(8.0),
              ),
            ),
            child: Row(
              children: <Widget>[
                Icon(
                  Icons.error,
                  color: Colors.white,
                ),
                Expanded(
                  child: Text(
                    'error_title'.tr,
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    child: Icon(
                      Icons.close,
                      color: Colors.white,
                    ),
                    onTap: cancelFunc,
                  ),
                )
              ],
            ),
          ),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(8.0),
                    bottomRight: Radius.circular(8.0),
                  ),
                  border: Border(
                    top: BorderSide(
                      color: Colors.grey.shade300,
                      width: 1,
                    ),
                    left: BorderSide(
                      color: Colors.grey.shade300,
                      width: 1,
                    ),
                    right: BorderSide(
                      color: Colors.grey.shade300,
                      width: 1,
                    ),
                    bottom: BorderSide(
                      color: Colors.grey.shade300,
                      width: 1,
                    ),
                  )),
              padding: EdgeInsets.only(left: 24),
              alignment: Alignment.centerLeft,
              child: Text(
                msg,
                style: TextStyle(color: Colors.black),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
