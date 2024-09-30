library scan_handle_view;

import 'package:get/get.dart';
import 'package:pit3_app/widgets/network/network_check.dart';
import 'package:stacked/stacked.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'scan_handle_view_model.dart';

part 'scan_handle_mobile.dart';

class ScanHandleView extends StatelessWidget {
  final List<String> scanFields;
  final String scanConnector;
  final List<String> data;
  ScanHandleView(this.data, {this.scanFields, this.scanConnector});
  @override
  Widget build(BuildContext context) {
    ScanHandleViewModel viewModel = ScanHandleViewModel();
    return ViewModelBuilder<ScanHandleViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) {
          viewModel.init(data, scanFields, scanConnector);
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _ScanHandleMobile(viewModel),
          );
        });
  }
}
