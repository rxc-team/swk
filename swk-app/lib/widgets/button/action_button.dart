import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ActionButton extends StatelessWidget {
  final Function onTap;
  final IconData icon;
  final Color iconColor;
  final String label;
  final bool disabled;
  const ActionButton({
    Key key,
    @required this.onTap,
    @required this.icon,
    @required this.iconColor,
    @required this.label,
    this.disabled = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Get.theme.primaryColor,
      child: Card(
        color: disabled ? Get.theme.disabledColor : Get.theme.cardColor,
        child: Ink(
          height: 80,
          width: 80,
          child: InkWell(
            onTap: disabled ? null : onTap,
            child: Container(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  Icon(
                    icon,
                    color: iconColor,
                    size: 32,
                  ),
                  Text(
                    label,
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 14,
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
