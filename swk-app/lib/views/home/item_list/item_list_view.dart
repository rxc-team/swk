library item_list_view;

import 'dart:convert';

import 'package:common_utils/common_utils.dart';
import 'package:extended_image/extended_image.dart';
import 'package:flutter_easyrefresh/easy_refresh.dart';
import 'package:pit3_app/common/application.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/models/items.dart' as items;
import 'package:get/get.dart';
import 'package:pit3_app/logic/event/show_image_event.dart';
import 'package:pit3_app/core/models/common_model.dart';
import 'package:pit3_app/util/common.dart';
import 'package:pit3_app/util/date_util.dart' as date;
import 'package:pit3_app/util/number.dart';
import 'package:pit3_app/util/translation_util.dart' as ts;
import 'package:pit3_app/widgets/empty/ds_empty_widget.dart';
import 'package:pit3_app/widgets/loading/loading_indicator.dart';
import 'package:stacked/stacked.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'item_list_view_model.dart';

part 'item_list_mobile.dart';

class ItemListView extends StatelessWidget {
  final bool canCheck;
  ItemListView({this.canCheck = false});
  @override
  Widget build(BuildContext context) {
    ItemListViewModel viewModel = ItemListViewModel();
    return ViewModelBuilder<ItemListViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) {
          viewModel.init(canCheck);
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _ItemListMobile(viewModel),
          );
        });
  }
}
