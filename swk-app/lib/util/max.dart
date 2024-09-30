// Copyright 2020 Joan Pablo Jimenez Milian. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import 'package:reactive_forms/reactive_forms.dart';

/// validator that requires the control's value to be less than or equal to a
/// provided value.
class MyMaxValidator<T> extends Validator<dynamic> {
  final T max;

  /// Constructs the instance of the validator.
  ///
  /// The argument [max] must not be null.
  MyMaxValidator(this.max);

  @override
  Map<String, dynamic> validate(AbstractControl<dynamic> control) {
    final error = {
      ValidationMessage.max: <String, dynamic>{
        'max': max,
        'actual': control.value,
      },
    };

    if (control.value == null || control.value == '') {
      return null;
    }

    assert(control.value is Comparable<dynamic>,
        'The MinValidator validator is expecting a control of type `Comparable` but received a control of type ${control.value.runtimeType}');

    var val = double.tryParse(control.value);
    return val.compareTo(max as double) <= 0 ? null : error;
  }
}
