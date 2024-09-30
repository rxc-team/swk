library scan_setting_view;

import 'package:get/get.dart';
import 'package:pit3_app/core/models/update_condition.dart';
import 'package:pit3_app/util/translation_util.dart' as ts;
import 'package:pit3_app/widgets/dialog/field_select_dialog.dart';
import 'package:pit3_app/widgets/loading/loading_indicator.dart';
import 'package:stacked/stacked.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'scan_setting_view_model.dart';

part 'scan_setting_mobile.dart';

class ScanSettingView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    ScanSettingViewModel viewModel = ScanSettingViewModel();
    return ViewModelBuilder<ScanSettingViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) {
          viewModel.init();
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _ScanSettingMobile(viewModel),
          );
        });
  }
}
