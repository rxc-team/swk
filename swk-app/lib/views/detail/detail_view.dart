library detail_view;

import 'dart:async';

import 'package:bot_toast/bot_toast.dart';
import 'package:custom_pop_up_menu/custom_pop_up_menu.dart';
import 'package:common_utils/common_utils.dart';
import 'package:pit3_app/common/application.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/models/workflow.dart';
import 'package:get/get.dart';
import 'package:pit3_app/logic/event/refresh_event.dart';
import 'package:pit3_app/core/models/common_model.dart';
import 'package:pit3_app/util/common.dart';
import 'package:pit3_app/util/date_util.dart' as date;
import 'package:pit3_app/util/map_util.dart';
import 'package:pit3_app/util/number.dart';
import 'package:pit3_app/util/translation_util.dart' as ts;
import 'package:pit3_app/widgets/button/action_button.dart';
import 'package:pit3_app/widgets/drag/bottom_drag_widget.dart';
import 'package:pit3_app/widgets/empty/empty_widget.dart';
import 'package:pit3_app/widgets/loading/loading_indicator.dart';
import 'package:pit3_app/widgets/network/network_check.dart';
import 'package:stacked/stacked.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'detail_view_model.dart';

part 'detail_mobile.dart';

class DetailView extends StatelessWidget {
  final String datastoreId;
  final String itemId;
  final bool canCheck;
  final bool scan;
  final String checkField;

  DetailView(
    this.datastoreId,
    this.itemId, {
    Key key,
    this.canCheck = false,
    this.scan = false,
    this.checkField,
  });

  @override
  Widget build(BuildContext context) {
    DetailViewModel viewModel = DetailViewModel();
    return ViewModelBuilder<DetailViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) {
          viewModel.init(datastoreId, itemId, checkField, canCheck, scan);
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _DetailMobile(
              viewModel,
            ),
          );
        });
  }
}
