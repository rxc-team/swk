library scan_view;

import 'package:get/get.dart';
import 'package:pit3_app/views/scan/mutil_scan/mutil_scan_view.dart';
import 'package:pit3_app/views/scan/single_scan/single_scan_view.dart';
import 'package:pit3_app/widgets/network/network_check.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'package:stacked/stacked.dart';
import 'scan_view_model.dart';

part 'scan_mobile.dart';

class ScanView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    ScanViewModel viewModel = ScanViewModel();
    return ViewModelBuilder<ScanViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) async {
          await viewModel.init();
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _ScanMobile(viewModel),
          );
        });
  }
}
