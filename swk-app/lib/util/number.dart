import "package:intl/intl.dart";

class NumberUtil {
  static String numberFormat(String num, {int precision = 0}) {
    String format = '#########';
    if (precision > 0) {
      format = '#,##0.' + format.substring(0, precision);
    } else {
      format = '#,##0';
    }

    var result = double.tryParse(num);
    if (result == null) {
      return "";
    }

    NumberFormat numberFormat = new NumberFormat(format);
    return numberFormat.format(result);
  }
}
