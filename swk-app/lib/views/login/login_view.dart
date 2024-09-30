library login_view;

import 'package:get/get.dart';
import 'package:pit3_app/views/setting/base_setting/base_setting_view.dart';
import 'package:reactive_forms/reactive_forms.dart';
import 'package:stacked/stacked.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'login_view_model.dart';

part 'login_mobile.dart';

class LoginView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    LoginViewModel viewModel = LoginViewModel();
    return ViewModelBuilder<LoginViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) {
          // Do something once your viewModel is initialized
          viewModel.init();
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _LoginMobile(viewModel),
          );
        });
  }
}
