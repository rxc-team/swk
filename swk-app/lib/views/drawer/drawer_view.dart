library drawer_view;

import 'package:get/get.dart';
import 'package:stacked/stacked.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'package:sp_util/sp_util.dart';
import 'drawer_view_model.dart';

part 'drawer_mobile.dart';

class DrawerView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    DrawerViewModel viewModel = DrawerViewModel();
    return ViewModelBuilder<DrawerViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) {
          viewModel.init();
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _DrawerMobile(viewModel),
          );
        });
  }
}
