import 'package:flutter/material.dart';
import 'package:get/get.dart';

class TipButton extends StatelessWidget {
  final Function onTap;
  final IconData icon;
  final Color iconColor;
  final String label;
  const TipButton({
    Key key,
    @required this.onTap,
    @required this.icon,
    @required this.iconColor,
    @required this.label,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Get.theme.cardColor,
      child: Card(
        child: Ink(
          height: 50,
          width: 60,
          child: InkWell(
            onTap: onTap,
            child: Container(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  Icon(
                    icon,
                    color: iconColor,
                    size: 26,
                  ),
                  Text(
                    label,
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 10,
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
