import 'package:flutter/material.dart';
import 'package:pit3_app/widgets/input/dropdown.dart';
import 'package:pit3_app/widgets/input/dropdown_dialog.dart';
import 'package:reactive_forms/reactive_forms.dart';

class ReactiveDropDownDialog<T, V> extends ReactiveFormField<T, V> {
  ReactiveDropDownDialog({
    Key key,
    String formControlName,
    FormControl<T> formControl,
    ValidationMessagesFunction validationMessages,
    ControlValueAccessor<T, V> valueAccessor,
    ShowErrorsFunction showErrors,

    ////////////////////////////////////////////////////////////////////////////
    /// List
    List<V> items,
    DropdownItemAsString<V> itemAsString,
    DropdownItemBuilder<V> itemBuilder,
    DropdownCompareFn<V> compareFn,

    ///当前值发生变更的处理
    ValueChanged<V> onChanged,

    /// search
    InputDecoration decoration,
    FocusNode focusNode,
    Search<V> onSearch,

    ///可以作为检索条件的可选内容
    ConditionFn conditionGen,
    Init<V> onInit,
  }) : super(
          key: key,
          formControl: formControl,
          formControlName: formControlName,
          valueAccessor: valueAccessor,
          validationMessages: validationMessages,
          showErrors: showErrors,
          builder: (field) {
            final InputDecoration effectiveDecoration =
                (decoration ?? const InputDecoration()).applyDefaults(Theme.of(field.context).inputDecorationTheme);

            final state = field as _ReactiveDropDownDialogState<T, V>;

            state._setFocusNode(focusNode);

            return DropdownSearch<V>(
              onChanged: (value) {
                field.didChange(value);
                if (onChanged != null) {
                  onChanged(value);
                }
              },
              selectedItem: field.value,
              itemAsString: itemAsString,
              itemBuilder: itemBuilder,
              conditionGen: conditionGen,
              onInit: onInit,
              onSearch: onSearch,
              compareFn: compareFn,
              decoration: effectiveDecoration,
            );
          },
        );

  @override
  ReactiveFormFieldState<T, V> createState() => _ReactiveDropDownDialogState<T, V>();
}

class _ReactiveDropDownDialogState<T, V> extends ReactiveFormFieldState<T, V> {
  FocusNode _focusNode;
  FocusController _focusController;

  FocusNode get focusNode => _focusNode ?? _focusController.focusNode;

  @override
  void initState() {
    super.initState();
  }

  @override
  void subscribeControl() {
    _registerFocusController(FocusController());
    super.subscribeControl();
  }

  @override
  void unsubscribeControl() {
    _unregisterFocusController();
    super.unsubscribeControl();
  }

  void _registerFocusController(FocusController focusController) {
    _focusController = focusController;
    control.registerFocusController(focusController);
  }

  void _unregisterFocusController() {
    control.unregisterFocusController(_focusController);
    _focusController.dispose();
  }

  void _setFocusNode(FocusNode focusNode) {
    if (_focusNode != focusNode) {
      _focusNode = focusNode;
      _unregisterFocusController();
      _registerFocusController(FocusController(focusNode: _focusNode));
    }
  }
}
