import 'package:common_utils/common_utils.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pit3_app/core/models/field.dart';
import 'package:pit3_app/core/models/items.dart';
import 'package:pit3_app/core/models/option.dart';
import 'package:pit3_app/core/models/search_condition.dart';
import 'package:pit3_app/core/models/update_condition.dart';
import 'package:pit3_app/logic/http/api_service.dart';
import 'package:pit3_app/util/common.dart';
import 'package:pit3_app/util/translation_util.dart' as ts;
import 'package:pit3_app/widgets/dialog/reactive_dropdown_dialog.dart';
import 'package:pit3_app/widgets/empty/not_found_widget.dart';
import 'package:pit3_app/widgets/input/dropdown_dialog.dart';
import 'package:pit3_app/widgets/item/item_view.dart';
import 'package:reactive_date_time_picker/reactive_date_time_picker.dart';
import 'package:reactive_dropdown_search/reactive_dropdown_search.dart';
import 'package:reactive_forms/reactive_forms.dart';

class FieldSelectDialog extends StatefulWidget {
  final List<Field> fieldOptions;
  final Map<String, List<Field>> lookupFields;
  final Map<String, List<Option>> optionMap;
  final VoidCallback onPressed;
  FieldSelectDialog({Key key, this.fieldOptions, this.lookupFields, this.optionMap, this.onPressed}) : super(key: key);

  @override
  _FieldSelectDialogState createState() => _FieldSelectDialogState();
}

class _FieldSelectDialogState extends State<FieldSelectDialog> {
  final FormGroup form = FormGroup({
    'field': FormControl<Field>(
      validators: [Validators.required],
    ),
    'ovalue': FormControl<Option>(),
    'ivalue': FormControl<Item>(),
    'tvalue': FormControl<String>(),
    'dvalue': FormControl<DateTime>(),
  });
  Field selectItem;
  bool isNow = true;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        centerTitle: true,
        title: Text('setting_scan_update_field'.tr),
      ),
      body: SingleChildScrollView(
        child: Container(
          padding: EdgeInsets.symmetric(vertical: 16),
          child: ReactiveForm(
            formGroup: this.form,
            child: Column(
              children: [
                ListTile(
                  dense: true,
                  title: Text(
                    'setting_scan_update_field'.tr,
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
                Divider(
                  height: 1,
                ),
                ReactiveDropdownSearch<Field, Field>(
                  formControlName: 'field',
                  decoration: InputDecoration(
                    hintText: 'placeholder_select'.tr,
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.only(left: 12),
                  ),
                  mode: Mode.BOTTOM_SHEET,
                  popupTitle: Container(
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          width: 0.5, //宽度
                          color: Get.theme.dividerColor, //边框颜色
                        ),
                      ),
                    ),
                    child: Text(
                      'setting_scan_update_field'.tr,
                      style: TextStyle(fontSize: 20),
                    ),
                    padding: EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                  ),
                  showSearchBox: true,
                  emptyBuilder: (context, value) {
                    return NotFoundWidget();
                  },
                  items: this.widget.fieldOptions,
                  itemAsString: (a) {
                    return ts.Translations.trans(a.fieldName);
                  },
                  popupItemBuilder: (context, item, disable) {
                    return ListTile(
                      title: Text(
                        ts.Translations.trans(item.fieldName),
                      ),
                      subtitle: Text(item.fieldType),
                    );
                  },
                  onPopupDismissed: () {
                    setState(() {
                      selectItem = this.form.control('field').value;
                      this.form.control('ovalue').value = null;
                      this.form.control('ivalue').value = null;
                      this.form.control('tvalue').value = null;
                      this.form.control('dvalue').value = null;
                    });
                  },
                ),
                Divider(
                  height: 1,
                ),
                ListTile(
                  dense: true,
                  title: Text(
                    'setting_scan_update_value'.tr,
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
                Divider(
                  height: 1,
                ),
                ...buildSwitch(),
                ...buildInput(),
                Container(
                  margin: EdgeInsets.only(top: 32),
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    child: Text('button_ok'.tr),
                    onPressed: form.valid
                        ? () {
                            var valueMap = this.form.value;
                            Field field = valueMap['field'];
                            if (field.fieldType == "options") {
                              Option ov = valueMap['ovalue'];
                              if (ov != null) {
                                UpdateCondition result = UpdateCondition(
                                  datastoreId: field.datastoreId,
                                  fieldId: field.fieldId,
                                  fieldName: field.fieldName,
                                  fieldType: field.fieldType,
                                  lookupDatastoreId: field.lookupDatastoreId,
                                  lookupFieldId: field.lookupFieldId,
                                  optionId: field.optionId,
                                  updateValue: ov.optionValue,
                                );
                                Navigator.pop(context, result);
                              }
                              return;
                            }

                            if (field.fieldType == 'lookup') {
                              Item iv = valueMap['ivalue'];
                              if (iv != null) {
                                UpdateCondition result = UpdateCondition(
                                  datastoreId: field.datastoreId,
                                  fieldId: field.fieldId,
                                  fieldName: field.fieldName,
                                  fieldType: field.fieldType,
                                  lookupDatastoreId: field.lookupDatastoreId,
                                  lookupFieldId: field.lookupFieldId,
                                  optionId: field.optionId,
                                  updateValue: Common.getValue(iv.items[field.lookupFieldId]),
                                );
                                Navigator.pop(context, result);
                              }
                            }

                            if (field.fieldType == 'date') {
                              if (isNow) {
                                UpdateCondition result = UpdateCondition(
                                  datastoreId: field.datastoreId,
                                  fieldId: field.fieldId,
                                  fieldName: field.fieldName,
                                  fieldType: field.fieldType,
                                  lookupDatastoreId: field.lookupDatastoreId,
                                  lookupFieldId: field.lookupFieldId,
                                  optionId: field.optionId,
                                  updateValue: 'now',
                                );
                                Navigator.pop(context, result);
                              }

                              DateTime dv = valueMap['dvalue'];
                              if (dv != null) {
                                UpdateCondition result = UpdateCondition(
                                  datastoreId: field.datastoreId,
                                  fieldId: field.fieldId,
                                  fieldName: field.fieldName,
                                  fieldType: field.fieldType,
                                  lookupDatastoreId: field.lookupDatastoreId,
                                  lookupFieldId: field.lookupFieldId,
                                  optionId: field.optionId,
                                  updateValue: DateUtil.formatDate(dv, format: "yyyy-MM-dd"),
                                );
                                Navigator.pop(context, result);
                              }
                            }

                            String tv = valueMap['tvalue'];
                            if (tv != null) {
                              UpdateCondition result = UpdateCondition(
                                datastoreId: field.datastoreId,
                                fieldId: field.fieldId,
                                fieldName: field.fieldName,
                                fieldType: field.fieldType,
                                lookupDatastoreId: field.lookupDatastoreId,
                                lookupFieldId: field.lookupFieldId,
                                optionId: field.optionId,
                                updateValue: tv,
                              );
                              Navigator.pop(context, result);
                            }
                          }
                        : null,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> buildInput() {
    List<Widget> widgets = [];
    if (this.selectItem == null) {
      widgets.add(Container(
        child: ListTile(
          title: Text('placeholder_select'.tr),
        ),
      ));
      widgets.add(
        Divider(
          height: 1,
        ),
      );
      return widgets;
    }

    if (this.selectItem.fieldType == "options") {
      widgets.add(ReactiveDropdownSearch<Option, Option>(
        formControlName: 'ovalue',
        decoration: InputDecoration(
          hintText: 'placeholder_select'.tr,
          border: InputBorder.none,
          contentPadding: EdgeInsets.only(left: 12),
        ),
        popupTitle: Container(
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                width: 0.5, //宽度
                color: Get.theme.dividerColor, //边框颜色
              ),
            ),
          ),
          child: Text(
            'setting_scan_update_value'.tr,
            style: TextStyle(fontSize: 20),
          ),
          padding: EdgeInsets.symmetric(vertical: 10, horizontal: 16),
        ),
        showSearchBox: true,
        emptyBuilder: (context, value) {
          return NotFoundWidget();
        },
        mode: Mode.BOTTOM_SHEET,
        items: this.widget.optionMap[selectItem.optionId],
        itemAsString: (a) {
          return ts.Translations.trans(a.optionLabel);
        },
      ));
      widgets.add(
        Divider(
          height: 1,
        ),
      );
      return widgets;
    }
    if (this.selectItem.fieldType == "lookup") {
      widgets.add(ReactiveDropDownDialog<Item, Item>(
        formControlName: 'ivalue',
        decoration: InputDecoration(
          hintText: 'placeholder_select'.tr,
          border: InputBorder.none,
          contentPadding: EdgeInsets.only(left: 12),
        ),
        conditionGen: () {
          List<Field> fields = widget.lookupFields[this.selectItem.lookupDatastoreId];
          fields.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
          if (fields.length > 5) {
            fields = fields.sublist(0, 5);
          }
          List<DropdownCondition> conditions = [];

          fields.forEach((f) {
            conditions.add(DropdownCondition(f.fieldId, ts.Translations.trans(f.fieldName), f.fieldType, '=', ''));
          });

          return conditions;
        },
        onSearch: (cd) async {
          List<SearchCondition> conditions = [];
          conditions.add(SearchCondition(
            fieldId: cd.key,
            fieldType: cd.dataType,
            searchOperator: cd.operator,
            searchValue: cd.value,
            isDynamic: true,
          ));

          final items = await ApiService.getItems(this.selectItem.lookupDatastoreId, conditions: conditions, index: 1, size: 100);
          if (items != null) {
            return items.itemsList ?? [];
          }
          return [];
        },
        onInit: () async {
          final items = await ApiService.getItems(this.selectItem.lookupDatastoreId, conditions: [], index: 1, size: 100);
          if (items != null) {
            return items.itemsList ?? [];
          }
          return [];
        },
        compareFn: (item, selectedItem) {
          if (item != null) {
            return item.itemId == selectedItem.itemId;
          }
          return false;
        },
        itemAsString: (it) {
          return it.items[selectItem.lookupFieldId].value;
        },
        itemBuilder: (context, it, isSelected) {
          return ItemView(
            isSelected: isSelected,
            datastoreId: selectItem.lookupDatastoreId,
            fields: widget.lookupFields[selectItem.lookupDatastoreId],
            items: it.items,
          );
        },
      ));
      widgets.add(
        Divider(
          height: 1,
        ),
      );
      return widgets;
    }

    if (this.selectItem.fieldType == "date") {
      if (!isNow) {
        widgets.add(ReactiveDateTimePicker(
          formControlName: 'dvalue',
          decoration: InputDecoration(
            border: InputBorder.none,
            contentPadding: EdgeInsets.only(left: 12, top: 12),
          ),
        ));
        widgets.add(
          Divider(
            height: 1,
          ),
        );
      }

      return widgets;
    }

    widgets.add(ReactiveTextField<String>(
      formControlName: 'tvalue',
      decoration: InputDecoration(
        hintText: 'placeholder_select'.tr,
        border: InputBorder.none,
        contentPadding: EdgeInsets.only(left: 12),
      ),
    ));
    widgets.add(
      Divider(
        height: 1,
      ),
    );

    return widgets;
  }

  List<Widget> buildSwitch() {
    List<Widget> widgets = [];
    if (this.selectItem == null) {
      return widgets;
    }

    if (this.selectItem.fieldType == "date") {
      widgets.add(
        ListTile(
          dense: true,
          title: Text(
            'swtich_date_tips'.tr,
            style: TextStyle(fontSize: 14),
          ),
          trailing: Container(
            width: 80,
            child: CupertinoSwitch(
              value: isNow,
              activeColor: Get.theme.primaryColor,
              onChanged: (v) {
                setState(() {
                  isNow = v;
                });
              },
            ),
          ),
        ),
      );
      widgets.add(
        Divider(
          height: 1,
        ),
      );
    }
    return widgets;
  }
}
