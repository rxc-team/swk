library mutil_scan_view;

import 'dart:io';

import 'package:get/get.dart';
import 'package:stacked/stacked.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'mutil_scan_view_model.dart';

part 'mutil_scan_mobile.dart';

class MutilScanView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    MutilScanViewModel viewModel = MutilScanViewModel();
    return ViewModelBuilder<MutilScanViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) {
          viewModel.init();
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _MutilScanMobile(viewModel),
          );
        });
  }
}
