library app_setting_view;

import 'package:get/get.dart';
import 'package:pit3_app/util/translation_util.dart' as ts;
import 'package:pit3_app/widgets/loading/loading_indicator.dart';
import 'package:stacked/stacked.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'app_setting_view_model.dart';

part 'app_setting_mobile.dart';

class AppSettingView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    AppSettingViewModel viewModel = AppSettingViewModel();
    return ViewModelBuilder<AppSettingViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) {
          viewModel.init();
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _AppSettingMobile(viewModel),
          );
        });
  }
}
