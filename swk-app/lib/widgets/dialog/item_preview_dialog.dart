import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ItemPreviewDialog extends StatelessWidget {
  final String field;
  final String operator;
  final String value;
  const ItemPreviewDialog({Key key, this.field, this.operator, this.value}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: const Text(''),
      ),
      body: Container(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Column(
          children: [
            Card(
              color: Get.theme.primaryColor,
              child: Container(
                padding: EdgeInsets.all(16),
                width: double.infinity,
                child: Text(
                  field,
                  style: TextStyle(fontSize: 20, color: Colors.white),
                ),
              ),
            ),
            Container(
              padding: EdgeInsets.all(16),
              width: double.infinity,
              child: Text(
                operator,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 50),
              ),
            ),
            Expanded(
              child: Card(
                child: Container(
                  padding: EdgeInsets.all(16),
                  width: double.infinity,
                  child: Text(
                    value,
                    style: TextStyle(fontSize: 20),
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
