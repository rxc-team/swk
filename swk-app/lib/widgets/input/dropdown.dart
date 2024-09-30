import 'package:flutter/material.dart';
import 'package:meta/meta.dart';
import 'package:pit3_app/widgets/input/dropdown_dialog.dart';

class DropdownSearch<T> extends StatefulWidget {
  ///是否活性
  final bool enabled;

  ///自定义类型显示文本
  final DropdownItemAsString<T> itemAsString;

  ///自定义类型显示组件
  final DropdownItemBuilder<T> itemBuilder;

  ///可以作为检索条件的可选内容
  final ConditionFn conditionGen;

  ///初始化列表
  final Init<T> onInit;

  ///当检索条件发生变更的处理
  final Search<T> onSearch;

  ///当前值发生变更的处理
  final ValueChanged<T> onChanged;

  ///当前传入的选中的值
  final T selectedItem;

  ///比较两个对象是否相等的方式
  final DropdownCompareFn<T> compareFn;

  ///字段显示效果
  final InputDecoration decoration;

  ///字段焦点
  final FocusNode focusNode;

  ///保存时的处理
  final void Function(T) onSaved;

  ///验证逻辑
  final String Function(T) validator;

  DropdownSearch({
    Key key,
    @Required() this.itemAsString,
    @Required() this.itemBuilder,
    @Required() this.conditionGen,
    @Required() this.onInit,
    @Required() this.onSearch,
    @Required() this.compareFn,
    this.selectedItem,
    this.enabled = true,
    this.onChanged,
    this.decoration,
    this.focusNode,
    this.onSaved,
    this.validator,
  }) : super(key: key);

  @override
  State<DropdownSearch<T>> createState() => _DropdownSearchState<T>();
}

class _DropdownSearchState<T> extends State<DropdownSearch<T>> {
  // 选中的值
  final ValueNotifier<T> _selectedItem = ValueNotifier(null);
  // 当前的值的文本显示控制器
  TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    // 默认为传入的选中的值
    _controller = TextEditingController(text: _selectedItemAsString(widget.selectedItem));
    _selectedItem.value = widget.selectedItem;
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<T>(
      valueListenable: _selectedItem,
      builder: (context, data, wt) {
        return IgnorePointer(
          ignoring: !widget.enabled,
          child: FormField<T>(
            enabled: widget.enabled,
            onSaved: widget.onSaved,
            validator: widget.validator,
            initialValue: widget.selectedItem,
            builder: (FormFieldState<T> state) {
              if (widget.selectedItem != null) {
                _selectedItem.value = widget.selectedItem;
              }

              if (state.value != getSelectedItem) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  state.didChange(getSelectedItem);
                });
              }

              _controller.text = _selectedItemAsString(getSelectedItem);

              return TextField(
                controller: _controller,
                readOnly: true,
                focusNode: widget.focusNode,
                onTap: () {
                  _openSearch(context);
                },
                decoration: widget.decoration,
              );
            },
          ),
        );
      },
    );
  }

  ///输入框显示为字符串使用
  String _selectedItemAsString(T data) {
    if (data == null) {
      return "";
    } else if (widget.itemAsString != null) {
      return widget.itemAsString(data);
    } else {
      return data.toString();
    }
  }

  /// 文本改变事件
  _onChange(T item) {
    _selectedItem.value = item;

    if (widget.onChanged != null) {
      widget.onChanged(item);
    }
  }

  /// 点击文本框，弹出选择的画面，目前只能提供半框显示
  _openSearch(BuildContext context) {
    // 全屏显示
    showGeneralDialog(
      context: context,
      barrierDismissible: false,
      transitionDuration: Duration(milliseconds: 300),
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        return FadeTransition(
          opacity: animation,
          child: ScaleTransition(
            scale: animation,
            child: child,
          ),
        );
      },
      pageBuilder: (context, animation, secondaryAnimation) {
        return DropdownDialog<T>(
          onChanged: _onChange,
          itemBuilder: widget.itemBuilder,
          conditionGen: widget.conditionGen,
          onInit: widget.onInit,
          onSearch: widget.onSearch,
          compareFn: widget.compareFn,
          selectedValue: getSelectedItem,
        );
      },
    );

    // // 半屏显示
    // showModalBottomSheet(
    //   context: context,
    //   builder: (context) {
    //     return DropdownDialog<T>(
    //       onChanged: _onChange,
    //       itemAsString: widget.itemAsString,
    //       itemBuilder: widget.itemBuilder,
    //       onSearch: widget.onSearch,
    //       compareFn: widget.compareFn,
    //       selectedValue: getSelectedItem,
    //     );
    //   },
    // );
  }

  ///获取选中的值
  T get getSelectedItem => _selectedItem.value;
}
