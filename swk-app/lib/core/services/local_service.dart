import 'package:pit3_app/common/application.dart';
import 'package:pit3_app/logic/event/refresh_event.dart';
import 'package:pit3_app/logic/repository/locale_repository.dart';
import 'package:pit3_app/util/translation_util.dart';

import '../../core/base/base_service.dart';
import 'package:flutter/material.dart';

class LocalService extends BaseService {
  change(Locale locale) async {
    log.i('change: locale: ${locale.toLanguageTag()}');
    LocaleRepository.setLocal(locale);
    await Translations.load(locale.toLanguageTag());
    eventBus.fire(RefreshEvent());
  }
}
