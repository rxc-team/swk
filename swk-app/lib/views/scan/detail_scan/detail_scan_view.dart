library detail_scan_view;

import 'dart:io';

import 'package:get/get.dart';
import 'package:stacked/stacked.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'detail_scan_view_model.dart';

part 'detail_scan_mobile.dart';

class DetailScanView extends StatelessWidget {
  final String itemId;
  DetailScanView({@required this.itemId, Key key});
  @override
  Widget build(BuildContext context) {
    DetailScanViewModel viewModel = DetailScanViewModel();
    return ViewModelBuilder<DetailScanViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) {
          viewModel.init(itemId);
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _DetailScanMobile(viewModel),
          );
        });
  }
}
