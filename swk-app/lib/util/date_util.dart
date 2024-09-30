import 'package:common_utils/common_utils.dart';
import 'package:sp_util/sp_util.dart';
import 'package:timezone/timezone.dart' as tz;

class DateUtils {
  static String formatDateTime(String dateStr, {String format = 'yyyy-MM-dd HH:mm:ss'}) {
    if (dateStr.startsWith('0001')) {
      return '';
    }

    String zone = SpUtil.getString("timezone", defValue: "");

    final locale = tz.getLocation(zone);

    var offset = locale.currentTimeZone.offset ~/ 36000;

    String timeZone = '+9000';
    if (offset >= 1000) {
      timeZone = '-$offset';
    } else if (offset >= 0 && offset < 1000) {
      timeZone = '-0$offset';
    } else if (offset <= -1000) {
      offset = 0 - offset;
      timeZone = '+$offset';
    } else {
      offset = 0 - offset;
      timeZone = '+0$offset';
    }

    String dateTime = DateUtil.formatDate(
      DateTime.parse("${dateStr.substring(0, 19)} $timeZone"),
      format: format,
    );

    return dateTime;
  }
}
