// Copyright 2020 Joan Pablo Jimenez Milian. All rights reserved.
// Use of this source code is governed by the MIT license that can be
// found in the LICENSE file.

import 'package:reactive_forms/reactive_forms.dart';

/// Validator that requires the control's value to be greater than or equal
/// to a provided value.
class MyMinValidator<T> extends Validator<dynamic> {
  final T min;

  /// Constructs the instance of the validator.
  ///
  /// The argument [min] must not be null.
  MyMinValidator(this.min);

  @override
  Map<String, dynamic> validate(AbstractControl<dynamic> control) {
    final error = {
      ValidationMessage.min: <String, dynamic>{
        'min': min,
        'actual': control.value,
      },
    };

    if (control.value == null || control.value == '') {
      return null;
    }

    assert(control.value is Comparable<dynamic>,
        'The MinValidator validator is expecting a control of type `Comparable` but received a control of type ${control.value.runtimeType}');

    var val = double.tryParse(control.value);
    return val.compareTo(min as double) >= 0 ? null : error;
  }
}
