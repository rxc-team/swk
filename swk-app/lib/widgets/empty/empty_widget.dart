import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pit3_app/views/login/login_view.dart';

class EmptyWidget extends StatelessWidget {
  final String _emptyImgPath = "images/ic_empty.png";
  final FontWeight _fontWidget = FontWeight.w600; //错误页面和空页面的字体粗度
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(0, 0, 0, 100),
      width: double.infinity,
      height: double.infinity,
      child: Center(
        child: Container(
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
              Container(
                margin: EdgeInsets.fromLTRB(0, 10, 0, 0),
                child: ElevatedButton(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 5.0, horizontal: 20.0),
                    child: Icon(Icons.arrow_back_ios),
                  ),
                  onPressed: () async {
                    bool canPop = Navigator.canPop(context);
                    if (canPop) {
                      Navigator.pop(context);
                    } else {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(builder: (_) => LoginView()),
                      );
                    }
                  },
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
