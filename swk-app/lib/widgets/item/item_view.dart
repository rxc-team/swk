import 'package:common_utils/common_utils.dart';
import 'package:flutter/material.dart';
import 'package:pit3_app/core/models/common_model.dart';
import 'package:pit3_app/core/models/field.dart';
import 'package:pit3_app/core/models/items.dart';
import 'package:pit3_app/util/number.dart';
import 'package:pit3_app/util/translation_util.dart' as ts;
import 'package:pit3_app/util/common.dart';

class ItemView extends StatefulWidget {
  final bool isSelected;
  final String datastoreId;
  final List<Field> fields;
  final Map<String, Value> items;
  ItemView({Key key, this.isSelected = false, @required this.datastoreId, @required this.fields, @required this.items}) : super(key: key);

  @override
  State<ItemView> createState() => _ItemViewState();
}

class _ItemViewState extends State<ItemView> {
  List<DynamicItem> _dynamicItems = [];

  @override
  void initState() {
    super.initState();
    _init();
  }

  _init() async {
    _dynamicItems = _buildItems(widget.items);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: widget.isSelected ? Colors.green.shade100 : Colors.white,
      child: _buildRow(),
    );
  }

  List<DynamicItem> _buildItems(Map<String, Value> itemDatas) {
    List<DynamicItem> tempItems = [];
    if (widget.fields.length > 0) {
      widget.fields.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
      var fields = [];
      if (widget.fields.length > 5) {
        fields = widget.fields.sublist(0, 5);
      } else {
        fields = widget.fields;
      }

      // 循环字段信息
      for (var f in fields) {
        if (itemDatas.containsKey(f.fieldId)) {
          var it = new DynamicItem(
            fieldID: f.fieldId,
            appID: f.appId,
            datastoreID: f.datastoreId,
            lookupDatastoreID: f.lookupDatastoreId,
            lookupFieldID: f.lookupFieldId,
            fieldName: f.fieldName,
            fieldType: f.fieldType,
            isImage: f.isImage,
            displayOrder: f.displayOrder,
            prefix: f.prefix,
            returnType: f.returnType,
            displayDigits: f.displayDigits,
            precision: f.precision,
            value: itemDatas[f.fieldId],
          );

          tempItems.add(it);
        } else {
          var value;
          switch (f.fieldType) {
            case 'text':
            case 'textarea':
            case 'number':
              value = '';
              break;
            case 'autonum':
              value = '';
              break;
            case 'date':
              value = '';
              break;
            case 'time':
              value = '';
              break;
            case 'user':
            case 'file':
              value = "[]";
              break;
            case 'switch':
              value = false;
              break;
            case 'options':
              value = '';
              break;
            case 'function':
              value = '';
              break;
            case 'lookup':
              value = '';
              break;
            default:
              value = '';
              break;
          }
          DynamicItem it = new DynamicItem(
            fieldID: f.fieldId,
            appID: f.appId,
            datastoreID: f.datastoreId,
            lookupDatastoreID: f.lookupDatastoreId,
            lookupFieldID: f.lookupFieldId,
            fieldName: f.fieldName,
            fieldType: f.fieldType,
            isImage: f.isImage,
            displayOrder: f.displayOrder,
            prefix: f.prefix,
            displayDigits: f.displayDigits,
            precision: f.precision,
            value: Value(value, f.fieldType),
          );

          tempItems.add(it);
        }
      }

      tempItems.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
      return tempItems;
    } else {
      return [];
    }
  }

  Widget _buildRow() {
    List<Widget> _items = [];

    _dynamicItems.forEach((item) {
      var value = Common.getValue(item.value, dataType: item.fieldType);

      switch (item.fieldType) {
        case 'options':
          _items.add(
            Row(
              children: [
                Container(
                  width: 120,
                  child: Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: ts.Translations.trans(item.fieldName),
                        ),
                        TextSpan(
                          text: ':',
                        )
                      ],
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    ts.Translations.trans(value),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          );
          break;
        case 'file':
          String valStr = '';
          if (value is List) {
            for (var item in value) {
              valStr += item.name;
            }
            _items.add(
              Row(
                children: [
                  Container(
                    width: 120,
                    child: Text.rich(
                      TextSpan(
                        children: [
                          TextSpan(
                            text: ts.Translations.trans(item.fieldName),
                          ),
                          TextSpan(
                            text: ':',
                          )
                        ],
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Expanded(
                    child: Text(
                      valStr,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            );
          }
          break;
        case 'user':
          List<dynamic> val = value;
          String valStr = '';
          if (val is List) {
            valStr = val.join(",");
            _items.add(
              Row(
                children: [
                  Container(
                    width: 120,
                    child: Text.rich(
                      TextSpan(
                        children: [
                          TextSpan(
                            text: ts.Translations.trans(item.fieldName),
                          ),
                          TextSpan(
                            text: ':',
                          )
                        ],
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Expanded(
                    child: Text(
                      valStr,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            );
          }
          break;
        case 'lookup':
          _items.add(
            Row(
              children: [
                Container(
                  width: 120,
                  child: Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: ts.Translations.trans(item.fieldName),
                        ),
                        TextSpan(
                          text: ':',
                        )
                      ],
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    value,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          );
          break;
        case 'switch':
          _items.add(
            Row(
              children: [
                Container(
                  width: 120,
                  child: Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: ts.Translations.trans(item.fieldName),
                        ),
                        TextSpan(
                          text: ':',
                        )
                      ],
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    value.toString(),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          );
          break;
        case 'date':
          _items.add(
            Row(
              children: [
                Container(
                  width: 120,
                  child: Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: ts.Translations.trans(item.fieldName),
                        ),
                        TextSpan(
                          text: ':',
                        )
                      ],
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    value == ""
                        ? ""
                        : DateUtil.formatDateStr(
                            value,
                            format: 'yyyy-MM-dd',
                          ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          );
          break;
        case 'time':
          _items.add(
            Row(
              children: [
                Container(
                  width: 120,
                  child: Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: ts.Translations.trans(item.fieldName),
                        ),
                        TextSpan(
                          text: ':',
                        )
                      ],
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    value,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          );
          break;
        case 'text':
        case 'textarea':
          _items.add(
            Row(
              children: [
                Container(
                  width: 120,
                  child: Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: ts.Translations.trans(item.fieldName),
                        ),
                        TextSpan(
                          text: ':',
                        )
                      ],
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    value,
                    overflow: TextOverflow.ellipsis,
                  ),
                )
              ],
            ),
          );
          break;
        case 'number':
          _items.add(
            Row(
              children: [
                Container(
                  width: 120,
                  child: Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: ts.Translations.trans(item.fieldName),
                        ),
                        TextSpan(
                          text: ':',
                        )
                      ],
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    NumberUtil.numberFormat(value, precision: item.precision),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          );
          break;
        case 'autonum':
          _items.add(
            Row(
              children: [
                Container(
                  width: 120,
                  child: Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: ts.Translations.trans(item.fieldName),
                        ),
                        TextSpan(
                          text: ':',
                        )
                      ],
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    value,
                    overflow: TextOverflow.ellipsis,
                  ),
                )
              ],
            ),
          );
          break;
        case 'function':
          _items.add(
            Row(
              children: [
                Container(
                  width: 120,
                  child: Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: ts.Translations.trans(item.fieldName),
                        ),
                        TextSpan(
                          text: ':',
                        )
                      ],
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    value,
                    overflow: TextOverflow.ellipsis,
                  ),
                )
              ],
            ),
          );
          break;
        default:
          break;
      }
    });

    return Container(
      padding: EdgeInsets.symmetric(vertical: 5.0, horizontal: 10),
      alignment: Alignment.topLeft,
      child: Column(
        children: _items,
      ),
    );
  }
}
