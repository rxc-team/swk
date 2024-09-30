import 'package:pit3_app/util/max.dart';
import 'package:pit3_app/util/min.dart';
import 'package:reactive_forms/reactive_forms.dart';

/// Provides a set of built-in validators that can be used by form controls.
class MyValidators {
  /// Gets a validator that requires the control's value to be greater than
  /// or equal to [min] value.
  ///
  /// The argument [min] must not be null.
  static ValidatorFunction min<T>(T min) => MyMinValidator<T>(min).validate;

  /// Gets a validator that requires the control's value to be less than
  /// or equal to [max] value.
  ///
  /// The argument [max] must not be null.
  static ValidatorFunction max<T>(T max) => MyMaxValidator<T>(max).validate;
}
