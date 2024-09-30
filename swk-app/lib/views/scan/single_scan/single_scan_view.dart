library single_scan_view;

import 'package:get/get.dart';
import 'package:stacked/stacked.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'single_scan_view_model.dart';

part 'single_scan_mobile.dart';

class SingleScanView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    SingleScanViewModel viewModel = SingleScanViewModel();
    return ViewModelBuilder<SingleScanViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) {
          viewModel.init();
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _SingleScanMobile(viewModel),
          );
        });
  }
}
