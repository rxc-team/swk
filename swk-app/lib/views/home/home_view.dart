library home_view;

import 'dart:async';

import 'package:pit3_app/common/application.dart';
import 'package:pit3_app/core/models/datastore.dart';
import 'package:get/get.dart';
import 'package:pit3_app/logic/event/refresh_event.dart';
import 'package:pit3_app/logic/event/total_event.dart';
import 'package:pit3_app/util/map_util.dart';
import 'package:pit3_app/util/translation_util.dart' as ts;
import 'package:pit3_app/views/home/item_list/item_list_view.dart';
import 'package:pit3_app/widgets/button/action_button.dart';
import 'package:pit3_app/widgets/empty/ds_empty_widget.dart';
import 'package:pit3_app/widgets/loading/loading_indicator.dart';
import 'package:stacked/stacked.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'home_view_model.dart';

part 'home_mobile.dart';

class HomeView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    HomeViewModel viewModel = HomeViewModel();
    return ViewModelBuilder<HomeViewModel>.reactive(
        onModelReady: (viewModel) async {
          await viewModel.init();
        },
        viewModelBuilder: () => viewModel,
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _HomeMobile(viewModel),
          );
        });
  }
}
