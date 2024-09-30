library search_view;

import 'package:flutter/cupertino.dart';
import 'package:get/get.dart';
import 'package:pit3_app/core/models/search_condition.dart';
import 'package:pit3_app/util/translation_util.dart' as ts;
import 'package:pit3_app/widgets/dialog/item_preview_dialog.dart';
import 'package:pit3_app/widgets/dialog/search_select_dialog.dart';
import 'package:pit3_app/widgets/empty/empty_widget.dart';
import 'package:pit3_app/widgets/loading/loading_indicator.dart';
import 'package:stacked/stacked.dart';
import 'package:responsive_builder/responsive_builder.dart';
import 'package:flutter/material.dart';
import 'search_view_model.dart';

part 'search_mobile.dart';

class SearchView extends StatelessWidget {
  SearchView();

  @override
  Widget build(BuildContext context) {
    SearchViewModel viewModel = SearchViewModel();
    return ViewModelBuilder<SearchViewModel>.reactive(
        viewModelBuilder: () => viewModel,
        onModelReady: (viewModel) async {
          await viewModel.init(context);
        },
        builder: (context, viewModel, child) {
          return ScreenTypeLayout(
            mobile: _SearchMobile(viewModel),
          );
        });
  }
}
