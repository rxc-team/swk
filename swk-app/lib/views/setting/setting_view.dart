library setting_view;

import 'package:flutter/cupertino.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:pit3_app/util/skip_util.dart';
import 'package:reactive_forms/reactive_forms.dart';
import 'package:stacked/stacked.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'setting_view_model.dart';

part 'setting_mobile.dart';

class SettingView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    SettingViewModel viewModel = SettingViewModel();
    return ViewModelBuilder<SettingViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) {
          viewModel.init();
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _SettingMobile(viewModel),
          );
        });
  }
}
