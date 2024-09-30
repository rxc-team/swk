library tab_view;

import 'dart:async';

import 'package:get/get.dart';
import 'package:pit3_app/views/drawer/drawer_view.dart';
import 'package:pit3_app/widgets/loading/splash_widget.dart';
import 'package:pit3_app/widgets/network/network_check.dart';
import 'package:stacked/stacked.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'tab_view_model.dart';

part 'tab_mobile.dart';

class TabView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    TabViewModel viewModel = TabViewModel();
    return ViewModelBuilder<TabViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) async {
          // Do something once your viewModel is initialized
          await viewModel.init(context);
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _TabMobile(viewModel),
          );
        });
  }
}
