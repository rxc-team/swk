library scan_list_view;

import 'dart:convert';

import 'package:common_utils/common_utils.dart';
import 'package:extended_image/extended_image.dart';
import 'package:flutter_easyrefresh/easy_refresh.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/models/common_model.dart';
import 'package:pit3_app/core/models/items.dart' as items;
import 'package:pit3_app/core/models/search_condition.dart';
import 'package:get/get.dart';
import 'package:pit3_app/util/common.dart';
import 'package:pit3_app/util/number.dart';
import 'package:pit3_app/util/translation_util.dart' as ts;
import 'package:pit3_app/widgets/empty/ds_empty_widget.dart';
import 'package:pit3_app/widgets/loading/loading_indicator.dart';
import 'package:pit3_app/widgets/network/network_check.dart';
import 'package:stacked/stacked.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'scan_list_view_model.dart';

part 'scan_list_mobile.dart';

class ScanListView extends StatelessWidget {
  final List<SearchCondition> conditions;
  final List<String> scanFields;
  final String scanConnector;

  ScanListView(this.conditions, {this.scanFields, this.scanConnector});

  @override
  Widget build(BuildContext context) {
    ScanListViewModel viewModel = ScanListViewModel();
    return ViewModelBuilder<ScanListViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) {
          viewModel.init(conditions, scanFields, scanConnector);
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _ScanListMobile(viewModel),
          );
        });
  }
}
