import 'package:common_utils/common_utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:pit3_app/core/models/common_model.dart';
import 'package:pit3_app/core/models/field.dart';
import 'package:pit3_app/core/models/items.dart';
import 'package:pit3_app/core/models/option.dart';
import 'package:pit3_app/core/models/search_condition.dart';
import 'package:pit3_app/core/models/user.dart';
import 'package:pit3_app/logic/http/api_service.dart';
import 'package:pit3_app/util/common.dart';
import 'package:pit3_app/util/translation_util.dart' as ts;
import 'package:pit3_app/widgets/dialog/reactive_dropdown_dialog.dart';
import 'package:pit3_app/widgets/empty/not_found_widget.dart';
import 'package:pit3_app/widgets/input/dropdown_dialog.dart';
import 'package:pit3_app/widgets/item/item_view.dart';
import 'package:reactive_advanced_switch/reactive_advanced_switch.dart';
import 'package:reactive_date_time_picker/reactive_date_time_picker.dart';
import 'package:reactive_dropdown_search/reactive_dropdown_search.dart';
import 'package:reactive_forms/reactive_forms.dart';

class SearchSelectDialog extends StatefulWidget {
  final List<Field> fieldOptions;
  final Map<String, List<Field>> lookupFields;
  final Map<String, List<Option>> optionMap;
  final Map<String, List<User>> userMap;
  final VoidCallback onPressed;
  SearchSelectDialog({Key key, this.fieldOptions, this.lookupFields, this.optionMap, this.userMap, this.onPressed}) : super(key: key);

  @override
  _SearchSelectDialogState createState() => _SearchSelectDialogState();
}

class _SearchSelectDialogState extends State<SearchSelectDialog> {
  final FormGroup form = FormGroup({
    'field': FormControl<Field>(
      validators: [Validators.required],
    ),
    'operator': FormControl<Operator>(
      validators: [Validators.required],
    ),
    'ovalue': FormControl<Option>(),
    'ivalue': FormControl<Item>(),
    'dvalue': FormControl<DateTime>(),
    'tvalue': FormControl<String>(),
    'bvalue': FormControl<bool>(),
    'uvalue': FormControl<User>(),
    'muvalue': FormControl<List<User>>(),
  });
  Field selectItem;
  Operator selectOperator;

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
        title: Text('button_add'.tr),
      ),
      body: Container(
        child: ReactiveForm(
          formGroup: this.form,
          child: ListView(
            children: [
              ListTile(
                dense: true,
                title: Text(
                  'search_condition_field'.tr,
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
                    'search_condition_field'.tr,
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
                    this.form.control('operator').value = null;
                    this.form.control('ovalue').value = null;
                    this.form.control('ivalue').value = null;
                    this.form.control('tvalue').value = null;
                    this.form.control('bvalue').value = null;
                    this.form.control('uvalue').value = null;
                    this.form.control('muvalue').value = null;
                  });
                },
              ),
              Divider(
                height: 1,
              ),
              ListTile(
                dense: true,
                title: Text(
                  'search_condition_type'.tr,
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
              Divider(
                height: 1,
              ),
              buildOperator(),
              Divider(
                height: 1,
              ),
              ListTile(
                dense: true,
                title: Text(
                  'search_condition_value'.tr,
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
              Divider(
                height: 1,
              ),
              buildInput(),
              Divider(
                height: 1,
              ),
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
                          Operator operator = valueMap['operator'];
                          if (field.fieldType == "text" ||
                              field.fieldType == "textarea" ||
                              field.fieldType == "number" ||
                              field.fieldType == "autonum") {
                            String tv = valueMap['tvalue'];
                            if (tv != null) {
                              SearchCondition result = SearchCondition(
                                fieldId: field.fieldId,
                                fieldName: field.fieldName,
                                fieldType: field.fieldType,
                                searchOperator: operator.value,
                                conditionType: '',
                                isDynamic: field.isDynamic,
                                searchValue: tv,
                              );
                              Navigator.pop(context, result);
                            } else {
                              SearchCondition result = SearchCondition(
                                fieldId: field.fieldId,
                                fieldName: field.fieldName,
                                fieldType: field.fieldType,
                                searchOperator: operator.value,
                                conditionType: '',
                                isDynamic: field.isDynamic,
                                searchValue: '',
                              );
                              Navigator.pop(context, result);
                            }
                            return;
                          }
                          if (field.fieldType == "date" || field.fieldType == "datetime") {
                            DateTime dv = valueMap['dvalue'];
                            if (dv != null) {
                              SearchCondition result = SearchCondition(
                                fieldId: field.fieldId,
                                fieldName: field.fieldName,
                                fieldType: field.fieldType,
                                searchOperator: operator.value,
                                conditionType: '',
                                isDynamic: field.isDynamic,
                                searchValue: DateUtil.formatDate(dv, format: "yyyy-MM-dd"),
                              );
                              Navigator.pop(context, result);
                            } else {
                              SearchCondition result = SearchCondition(
                                fieldId: field.fieldId,
                                fieldName: field.fieldName,
                                fieldType: field.fieldType,
                                searchOperator: operator.value,
                                conditionType: '',
                                isDynamic: field.isDynamic,
                                searchValue: '',
                              );
                              Navigator.pop(context, result);
                            }
                            return;
                          }
                          if (field.fieldType == "time") {
                            DateTime dv = valueMap['dvalue'];
                            if (dv != null) {
                              SearchCondition result = SearchCondition(
                                fieldId: field.fieldId,
                                fieldName: field.fieldName,
                                fieldType: field.fieldType,
                                searchOperator: operator.value,
                                conditionType: '',
                                isDynamic: field.isDynamic,
                                searchValue: DateUtil.formatDate(dv, format: "HH:mm:ss"),
                              );
                              Navigator.pop(context, result);
                            } else {
                              SearchCondition result = SearchCondition(
                                fieldId: field.fieldId,
                                fieldName: field.fieldName,
                                fieldType: field.fieldType,
                                searchOperator: operator.value,
                                conditionType: '',
                                isDynamic: field.isDynamic,
                                searchValue: '',
                              );
                              Navigator.pop(context, result);
                            }
                            return;
                          }
                          if (field.fieldType == "switch") {
                            bool bv = valueMap['bvalue'];
                            if (bv != null) {
                              SearchCondition result = SearchCondition(
                                fieldId: field.fieldId,
                                fieldName: field.fieldName,
                                fieldType: field.fieldType,
                                searchOperator: operator.value,
                                conditionType: '',
                                isDynamic: field.isDynamic,
                                searchValue: bv.toString(),
                              );
                              Navigator.pop(context, result);
                            } else {
                              SearchCondition result = SearchCondition(
                                fieldId: field.fieldId,
                                fieldName: field.fieldName,
                                fieldType: field.fieldType,
                                searchOperator: operator.value,
                                conditionType: '',
                                isDynamic: field.isDynamic,
                                searchValue: '',
                              );
                              Navigator.pop(context, result);
                            }
                            return;
                          }
                          if (field.fieldType == "user") {
                            if (operator.value == 'in') {
                              List<User> mv = valueMap['muvalue'];
                              if (mv != null) {
                                var value = mv.map((e) => e.userId).join(',');
                                SearchCondition result = SearchCondition(
                                  fieldId: field.fieldId,
                                  fieldName: field.fieldName,
                                  fieldType: field.fieldType,
                                  searchOperator: operator.value,
                                  conditionType: '',
                                  isDynamic: field.isDynamic,
                                  searchValue: value,
                                );
                                Navigator.pop(context, result);
                              } else {
                                SearchCondition result = SearchCondition(
                                  fieldId: field.fieldId,
                                  fieldName: field.fieldName,
                                  fieldType: field.fieldType,
                                  searchOperator: operator.value,
                                  conditionType: '',
                                  isDynamic: field.isDynamic,
                                  searchValue: '',
                                );
                                Navigator.pop(context, result);
                              }
                            } else {
                              User uv = valueMap['uvalue'];
                              if (uv != null) {
                                SearchCondition result = SearchCondition(
                                  fieldId: field.fieldId,
                                  fieldName: field.fieldName,
                                  fieldType: field.fieldType,
                                  searchOperator: operator.value,
                                  conditionType: '',
                                  isDynamic: field.isDynamic,
                                  searchValue: uv.userId,
                                );
                                Navigator.pop(context, result);
                              } else {
                                SearchCondition result = SearchCondition(
                                  fieldId: field.fieldId,
                                  fieldName: field.fieldName,
                                  fieldType: field.fieldType,
                                  searchOperator: operator.value,
                                  conditionType: '',
                                  isDynamic: field.isDynamic,
                                  searchValue: '',
                                );
                                Navigator.pop(context, result);
                              }
                            }

                            return;
                          }
                          if (field.fieldType == "options") {
                            Option ov = valueMap['ovalue'];
                            if (ov != null) {
                              SearchCondition result = SearchCondition(
                                fieldId: field.fieldId,
                                fieldName: field.fieldName,
                                fieldType: field.fieldType,
                                searchOperator: operator.value,
                                conditionType: '',
                                isDynamic: field.isDynamic,
                                searchValue: ov.optionValue,
                              );
                              Navigator.pop(context, result);
                            } else {
                              SearchCondition result = SearchCondition(
                                fieldId: field.fieldId,
                                fieldName: field.fieldName,
                                fieldType: field.fieldType,
                                searchOperator: operator.value,
                                conditionType: '',
                                isDynamic: field.isDynamic,
                                searchValue: '',
                              );
                              Navigator.pop(context, result);
                            }
                            return;
                          }
                          if (field.fieldType == "lookup") {
                            Item iv = valueMap['ivalue'];
                            if (iv != null) {
                              SearchCondition result = SearchCondition(
                                fieldId: field.fieldId,
                                fieldName: field.fieldName,
                                fieldType: field.fieldType,
                                searchOperator: operator.value,
                                conditionType: '',
                                isDynamic: field.isDynamic,
                                searchValue: Common.getValue(
                                  iv.items[field.lookupFieldId],
                                ),
                              );
                              Navigator.pop(context, result);
                            } else {
                              SearchCondition result = SearchCondition(
                                fieldId: field.fieldId,
                                fieldName: field.fieldName,
                                fieldType: field.fieldType,
                                searchOperator: operator.value,
                                conditionType: '',
                                isDynamic: field.isDynamic,
                                searchValue: '',
                              );
                              Navigator.pop(context, result);
                            }
                          }
                        }
                      : null,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget buildOperator() {
    if (this.selectItem == null) {
      return Container(
        child: ListTile(
          title: Text('placeholder_select'.tr),
        ),
      );
    }

    List<Operator> operators = getOperators(selectItem.fieldType);

    return ReactiveDropdownSearch<Operator, Operator>(
      formControlName: 'operator',
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
          'search_condition_type'.tr,
          style: TextStyle(fontSize: 20),
        ),
        padding: EdgeInsets.symmetric(vertical: 10, horizontal: 16),
      ),
      showSearchBox: true,
      emptyBuilder: (context, value) {
        return NotFoundWidget();
      },
      mode: Mode.BOTTOM_SHEET,
      items: operators,
      itemAsString: (a) {
        return a.label.tr;
      },
      onPopupDismissed: () {
        setState(() {
          selectOperator = this.form.control('operator').value;
        });
      },
    );
  }

  Widget buildInput() {
    if (this.selectItem == null) {
      return Container(
        child: ListTile(
          title: Text('placeholder_select'.tr),
        ),
      );
    }

    if (this.selectItem.fieldType == "text") {
      return ReactiveTextField<String>(
        formControlName: 'tvalue',
        decoration: InputDecoration(
          hintText: 'placeholder_select'.tr,
          border: InputBorder.none,
          contentPadding: EdgeInsets.only(left: 12),
        ),
      );
    }
    if (this.selectItem.fieldType == "textarea") {
      return ReactiveTextField<String>(
        formControlName: 'tvalue',
        maxLines: 3,
        decoration: InputDecoration(
          hintText: 'placeholder_select'.tr,
          border: InputBorder.none,
          contentPadding: EdgeInsets.only(left: 12),
        ),
      );
    }
    if (this.selectItem.fieldType == "number") {
      return ReactiveTextField<String>(
        formControlName: 'tvalue',
        keyboardType: TextInputType.number,
        inputFormatters: [
          FilteringTextInputFormatter.allow(RegExp("[0-9.]")), //数字包括小数
        ],
        decoration: InputDecoration(
          hintText: 'placeholder_select'.tr,
          border: InputBorder.none,
          contentPadding: EdgeInsets.only(left: 12),
        ),
      );
    }
    if (this.selectItem.fieldType == "autonum") {
      return ReactiveTextField<String>(
        formControlName: 'tvalue',
        keyboardType: TextInputType.number,
        inputFormatters: [
          FilteringTextInputFormatter.allow(RegExp("[0-9.]")), //数字包括小数
        ],
        decoration: InputDecoration(
          hintText: 'placeholder_select'.tr,
          border: InputBorder.none,
          contentPadding: EdgeInsets.only(left: 12),
        ),
      );
    }
    if (this.selectItem.fieldType == "switch") {
      return ReactiveAdvancedSwitch<bool>(
        formControlName: 'bvalue',
        activeColor: Get.theme.primaryColor,
        decoration: InputDecoration(
          hintText: 'placeholder_select'.tr,
          border: InputBorder.none,
          contentPadding: EdgeInsets.only(left: 12),
        ),
      );
    }
    if (this.selectItem.fieldType == "date") {
      return ReactiveDateTimePicker(
        formControlName: 'dvalue',
        decoration: InputDecoration(
          labelText: 'placeholder_select'.tr,
          border: InputBorder.none,
          contentPadding: EdgeInsets.only(left: 12),
        ),
      );
    }
    if (this.selectItem.fieldType == "datetime") {
      return ReactiveDateTimePicker(
        formControlName: 'dvalue',
        decoration: InputDecoration(
          labelText: 'placeholder_select'.tr,
          border: InputBorder.none,
          contentPadding: EdgeInsets.only(left: 12),
        ),
      );
    }
    if (this.selectItem.fieldType == "time") {
      return ReactiveDateTimePicker(
        formControlName: 'dvalue',
        type: ReactiveDatePickerFieldType.time,
        decoration: InputDecoration(
          labelText: 'placeholder_select'.tr,
          border: InputBorder.none,
          contentPadding: EdgeInsets.only(left: 12),
        ),
      );
    }

    if (this.selectItem.fieldType == "user") {
      if (selectOperator == null) {
        return Container();
      }
      if (selectOperator.value == 'in') {
        return ReactiveDropdownSearchMultiSelection<User, User>(
          formControlName: 'muvalue',
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
              'search_condition_value'.tr,
              style: TextStyle(fontSize: 20),
            ),
            padding: EdgeInsets.symmetric(vertical: 10, horizontal: 16),
          ),
          showSearchBox: true,
          emptyBuilder: (context, value) {
            return NotFoundWidget();
          },
          mode: Mode.BOTTOM_SHEET,
          items: this.widget.userMap[selectItem.userGroupId],
          itemAsString: (a) {
            return a.userName;
          },
        );
      }
      return ReactiveDropdownSearch<User, User>(
        formControlName: 'uvalue',
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
            'search_condition_value'.tr,
            style: TextStyle(fontSize: 20),
          ),
          padding: EdgeInsets.symmetric(vertical: 10, horizontal: 16),
        ),
        showSearchBox: true,
        emptyBuilder: (context, value) {
          return NotFoundWidget();
        },
        mode: Mode.BOTTOM_SHEET,
        items: this.widget.userMap[selectItem.userGroupId],
        itemAsString: (a) {
          return a.userName;
        },
      );
    }

    if (this.selectItem.fieldType == "options") {
      return ReactiveDropdownSearch<Option, Option>(
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
            'search_condition_value'.tr,
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
      );
    }

    if (this.selectItem.fieldType == "lookup") {
      return ReactiveDropDownDialog<Item, Item>(
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
      );
    }
    return Container(
      child: ListTile(
        title: Text('placeholder_select'.tr),
      ),
    );
  }

  List<Operator> getOperators(String fieldType) {
    switch (fieldType) {
      case "text":
      case "textarea":
      case "lookup":
        return [
          Operator(label: 'search_operator_equal'.tr, value: "="),
          Operator(label: 'search_operator_like'.tr, value: "like"),
          Operator(label: 'search_operator_not_equal'.tr, value: "<>"),
        ];
        break;
      case "number":
      case "autonum":
      case "date":
      case "time":
      case "datetime":
        return [
          Operator(label: 'search_operator_equal'.tr, value: "="),
          Operator(label: 'search_operator_not_equal'.tr, value: "<>"),
          Operator(label: 'search_operator_greater'.tr, value: ">"),
          Operator(label: 'search_operator_less'.tr, value: "<"),
          Operator(
            label: 'search_operator_greater_equal'.tr,
            value: ">=",
          ),
          Operator(label: 'search_operator_less_equal'.tr, value: "<="),
        ];
      case "options":
      case "user":
        return [
          Operator(label: 'search_operator_equal'.tr, value: "="),
          Operator(label: 'search_operator_exist'.tr, value: "in"),
          Operator(label: 'search_operator_not_equal'.tr, value: "<>"),
        ];
      case "switch":
        return [
          Operator(label: 'search_operator_equal'.tr, value: "="),
          Operator(label: 'search_operator_not_equal'.tr, value: "<>"),
        ];
      default:
        return [
          Operator(label: 'search_operator_equal'.tr, value: "="),
          Operator(label: 'search_operator_like'.tr, value: "like"),
          Operator(label: 'search_operator_not_equal'.tr, value: "<>"),
        ];
        break;
    }
  }
}
