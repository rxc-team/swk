library about_view;

import 'package:get/get.dart';
import 'package:stacked/stacked.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'about_view_model.dart';

part 'about_mobile.dart';

class AboutView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    AboutViewModel viewModel = AboutViewModel();
    return ViewModelBuilder<AboutViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) {
          // Do something once your viewModel is initialized
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _AboutMobile(viewModel),
          );
        });
  }
}
