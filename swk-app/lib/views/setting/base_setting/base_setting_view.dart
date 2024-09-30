library base_setting_view;

import 'package:get/get.dart';
import 'package:reactive_forms/reactive_forms.dart';
import 'package:stacked/stacked.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'base_setting_view_model.dart';

part 'base_setting_mobile.dart';

class BaseSettingView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    BaseSettingViewModel viewModel = BaseSettingViewModel();
    return ViewModelBuilder<BaseSettingViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) {
          viewModel.init();
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _BaseSettingMobile(viewModel),
          );
        });
  }
}
