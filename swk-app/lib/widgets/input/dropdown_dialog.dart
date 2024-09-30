import 'package:flutter/material.dart';
import 'package:pit3_app/core/models/common_model.dart';
import 'package:get/get.dart';
import 'package:pit3_app/widgets/empty/not_found_widget.dart';
import 'package:pit3_app/widgets/loading/loading_indicator.dart';
import 'package:reactive_dropdown_search/reactive_dropdown_search.dart';
import 'package:reactive_forms/reactive_forms.dart';

typedef String DropdownItemAsString<T>(T item);
typedef Widget DropdownItemBuilder<T>(BuildContext context, T item, bool isSelected);
typedef Future<List<T>> Search<T>(DropdownCondition cd);
typedef Future<List<T>> Init<T>();
typedef bool DropdownCompareFn<T>(T item, T selectedItem);
typedef List<DropdownCondition> ConditionFn();

class DropdownCondition {
  String key;
  String label;
  String dataType;
  String operator;
  String value;

  DropdownCondition(
    this.key,
    this.label,
    this.dataType,
    this.operator,
    this.value,
  );
}

class DropdownDialog<T> extends StatefulWidget {
  ///当前选中的值
  final T selectedValue;

  ///可以作为检索条件的可选内容
  final ConditionFn conditionGen;

  ///自定义类型显示组件
  final DropdownItemBuilder<T> itemBuilder;

  ///初始化列表
  final Init<T> onInit;

  ///当检索条件发生变更的处理
  final Search<T> onSearch;

  ///当前值发生变更的处理
  final ValueChanged<T> onChanged;

  ///比较两个对象是否相等的方式
  final DropdownCompareFn<T> compareFn;

  const DropdownDialog({
    Key key,
    this.selectedValue,
    this.conditionGen,
    this.itemBuilder,
    this.onInit,
    this.onSearch,
    this.onChanged,
    this.compareFn,
  }) : super(key: key);

  @override
  State<DropdownDialog<T>> createState() => _DropdownDialogState<T>();
}

class _DropdownDialogState<T> extends State<DropdownDialog<T>> {
  // 当前缓存的list值
  final ValueNotifier<List<T>> _cachedItems = ValueNotifier([]);
  // 当前选择的检索条件
  final ValueNotifier<DropdownCondition> _selectItem = ValueNotifier(null);
  // 是否加载
  final ValueNotifier<bool> _loading = ValueNotifier(false);
  // 检索条件
  List<DropdownCondition> _availableConditios = [];

  final FormGroup form = FormGroup({
    'key': FormControl<DropdownCondition>(),
    'operator': FormControl<Operator>(),
    'value': FormControl<String>(),
  });

  @override
  void initState() {
    super.initState();
    // 初始化获取数据
    _init();
  }

  /// 初始化获取数据
  _init() async {
    _loading.value = true;

    if (widget.conditionGen != null) {
      _availableConditios = widget.conditionGen();
    }
    if (widget.onInit != null) {
      List<T> data = await widget.onInit();

      _cachedItems.value.clear();
      _cachedItems.value.addAll(data);
    }

    _loading.value = false;
  }

  /// 判断是否选中，可以自己设置比较的处理方案
  bool _isSelectedItem(T item) {
    return _isEqual(widget.selectedValue, item);
  }

  /// 比较两个对象是否相等
  bool _isEqual(T i1, T i2) {
    if (widget.compareFn != null)
      return widget.compareFn(i1, i2);
    else
      return i1 == i2;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('search_title'.tr),
        actions: [
          IconButton(
            icon: Icon(Icons.search),
            onPressed: () async {
              _loading.value = true;
              DropdownCondition cd = this.form.controls['key'].value;
              Operator op = this.form.controls['operator'].value;
              String ve = this.form.controls['value'].value;
              if (cd != null) {
                cd.operator = op.value;
                cd.value = ve;

                List<T> data = await widget.onSearch(cd);

                _cachedItems.value.clear();
                _cachedItems.value.addAll(data);
              }
              _loading.value = false;
            },
          ),
        ],
      ),
      body: _body(),
    );
  }

  /// body生成
  Widget _body() {
    return Container(
      child: Column(
        children: [
          Container(
            height: 170,
            child: ReactiveForm(
              formGroup: this.form,
              child: Column(
                children: [
                  ListTile(
                    leading: Container(
                      width: 100,
                      height: 40,
                      alignment: Alignment.centerRight,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                      ),
                      child: Text(
                        'search_condition_field'.tr,
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                    title: ReactiveDropdownSearch<DropdownCondition, DropdownCondition>(
                        formControlName: "key",
                        decoration: InputDecoration(
                          hintText: 'placeholder_select'.tr,
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.fromLTRB(12, 0, 0, 0),
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
                            "search_condition_field".tr,
                            style: TextStyle(fontSize: 20),
                          ),
                          padding: EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                        ),
                        emptyBuilder: (context, value) {
                          return NotFoundWidget();
                        },
                        onPopupDismissed: () {
                          _selectItem.value = form.controls['key'].value;
                        },
                        showClearButton: true,
                        mode: Mode.BOTTOM_SHEET,
                        items: _availableConditios,
                        itemAsString: (a) {
                          return a.label;
                        }),
                  ),
                  Divider(
                    height: 1,
                  ),
                  ListTile(
                    leading: Container(
                      width: 100,
                      height: 40,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(color: Colors.grey.shade100),
                      child: Text(
                        'search_condition_type'.tr,
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                    title: ValueListenableBuilder<DropdownCondition>(
                      valueListenable: _selectItem,
                      builder: (context, value, child) {
                        if (value == null) {
                          return TextField(
                            decoration: InputDecoration(
                              hintText: 'placeholder_select'.tr,
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.fromLTRB(12, 0, 0, 0),
                            ),
                            readOnly: true,
                          );
                        }

                        List<Operator> operators = _getOperators(value.dataType);

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
                          emptyBuilder: (context, value) {
                            return NotFoundWidget();
                          },
                          mode: Mode.BOTTOM_SHEET,
                          items: operators,
                          itemAsString: (a) {
                            return a.label.tr;
                          },
                        );
                      },
                    ),
                  ),
                  Divider(
                    height: 1,
                  ),
                  ListTile(
                    leading: Container(
                      width: 100,
                      height: 40,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(color: Colors.grey.shade100),
                      child: Text(
                        'search_condition_value'.tr,
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                    title: ReactiveTextField<String>(
                      formControlName: 'value',
                      keyboardType: TextInputType.text,
                      decoration: InputDecoration(
                        hintText: 'placeholder_input'.tr,
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.only(left: 12),
                      ),
                      maxLines: 1,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: ValueListenableBuilder<bool>(
              valueListenable: _loading,
              builder: (context, value, child) {
                if (value) {
                  return LoadingIndicator(msg: 'loading'.tr);
                }

                return ValueListenableBuilder<List<T>>(
                  valueListenable: _cachedItems,
                  builder: (context, value, child) {
                    if (value.length == 0) {
                      return Container(
                        alignment: Alignment.center,
                        child: Text(
                          'empty_msg'.tr,
                          style: TextStyle(color: Get.theme.hintColor),
                        ),
                      );
                    }

                    return ListView.separated(
                      itemBuilder: (context, index) {
                        T selectItem = value[index];
                        return Container(
                          child: InkWell(
                            onTap: () {
                              widget.onChanged(selectItem);
                              Navigator.pop(context);
                            },
                            child: widget.itemBuilder(context, selectItem, _isSelectedItem(selectItem)),
                          ),
                        );
                      },
                      separatorBuilder: (context, index) {
                        return Divider(
                          height: 1,
                        );
                      },
                      itemCount: value.length,
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  List<Operator> _getOperators(String fieldType) {
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
          Operator(label: 'search_operator_greater_equal'.tr, value: ">="),
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
