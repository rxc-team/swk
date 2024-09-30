import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:pit3_app/common/application.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/models/field.dart';
import 'package:pit3_app/core/models/items.dart' as its;
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:pit3_app/db/condition_service.dart';
import 'package:pit3_app/db/display_service.dart';
import 'package:get/get.dart';
import 'package:pit3_app/logic/event/refresh_event.dart';
import 'package:pit3_app/logic/event/total_event.dart';
import 'package:pit3_app/logic/http/api_service.dart';
import 'package:pit3_app/core/models/common_model.dart';
import 'package:pit3_app/core/models/display_field.dart';
import 'package:pit3_app/core/models/search_condition.dart';
import 'package:pit3_app/views/detail/detail_view.dart';
import 'package:pit3_app/views/scan/check_update.dart';
import 'package:sp_util/sp_util.dart';

class ItemListViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();
  List<Field> _fields = [];
  List<CheckedItem> _checkItems = [];
  List<its.Item> _items = [];
  int _total = 0;
  String _checkField = '';
  bool _hasReachedMax = false;
  ScrollController _scrollController;
  bool _canCheck = false;
  bool _showCheck = false;
  int _index = 1;
  int _size = 10;

  List<Field> get fields => this._fields;
  set fields(List<Field> value) {
    this._fields = value;
    notifyListeners();
  }

  List<its.Item> get items => this._items;
  set items(List<its.Item> value) {
    this._items = value;
    notifyListeners();
  }

  List<CheckedItem> get checkItems => this._checkItems;
  set checkItems(List<CheckedItem> value) {
    this._checkItems = value;
    notifyListeners();
  }

  int get total => this._total;
  set total(int value) {
    this._total = value;
    eventBus.fire(TotalEvent(value));
    notifyListeners();
  }

  String get checkField => this._checkField;
  set checkField(String value) {
    this._checkField = value;
    notifyListeners();
  }

  bool get hasReachedMax => this._hasReachedMax;
  set hasReachedMax(bool value) {
    this._hasReachedMax = value;
    notifyListeners();
  }

  ScrollController get scrollController => this._scrollController;
  set scrollController(ScrollController value) {
    this._scrollController = value;
    notifyListeners();
  }

  bool get canCheck => this._canCheck;
  set canCheck(bool value) {
    this._canCheck = value;
    notifyListeners();
  }

  bool get showCheck => this._showCheck;
  set showCheck(bool value) {
    this._showCheck = value;
    notifyListeners();
  }

  int get index => this._index;
  set index(int value) {
    this._index = value;
    notifyListeners();
  }

  int get size => this._size;
  set size(int value) {
    this._size = value;
    notifyListeners();
  }

  ItemListViewModel();

  // Add ViewModel specific code here
  init(bool canCheck) async {
    this.loading = true;
    this.scrollController = ScrollController();
    this.canCheck = canCheck;
    this.showCheck = false;
    this.index = 1;
    this.size = Setting.singleton.listLine ?? 10;
    var ds = Setting.singleton.currentDatastore;

    List<Future<dynamic>> futures = [
      ApiService.getFields(ds),
      ConditionService.internal().getConditionList(),
      ApiService.getUsers(),
      DisplayService.internal().getConditionList(ds)
    ];

    final data = await Future.wait(futures);

    final fields = data[0];
    final conditionList = data[1];
    final users = data[2];
    final fieldList = data[3];

    final List<SearchCondition> conditions = [];
    for (var item in conditionList) {
      SearchCondition sct = SearchCondition.fromJson(item);
      conditions.add(sct);
    }

    String conditionType = SpUtil.getString('conditionType', defValue: 'and');
    final items = await ApiService.getItems(
      ds,
      conditions: conditions,
      conditionType: conditionType,
      index: 1,
      size: size,
    );

    if (fields == null || items.itemsList == null || users == null) {
      this.isEmpty = true;
    } else {
      List<Field> _fs = [];
      if (fieldList.length == 0) {
        for (var item in fields) {
          if (item.isCheckImage == true) {
            this.checkField = item.fieldId;
            continue;
          }
          _fs.add(item);
        }
      } else {
        final List<DisplayField> _displays = [];
        for (var item in fieldList) {
          DisplayField fs = DisplayField.fromJson(item);
          _displays.add(fs);
        }

        for (Field item in fields) {
          if (item.isCheckImage == true) {
            this.checkField = item.fieldId;
            continue;
          }
          var i = _displays.singleWhere(
            (f) => f.fieldId == item.fieldId,
            orElse: () => null,
          );
          if (i != null) {
            item.displayOrder = i.displayOrder;
            _fs.add(item);
          }
        }
      }

      _fs.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
      this.fields = _fs ?? [];
      this.items = items.itemsList ?? [];
      this.total = items.total ?? 0;
      this.hasReachedMax = items.total <= (1 * size) ? true : false;

      for (var item in this.items) {
        checkItems.add(CheckedItem(itemId: item.itemId, checked: false));
      }
    }
    this.loading = false;
  }

  Future<void> refresh() async {
    this.showCheck = false;
    this.index = 1;
    this.size = Setting.singleton.listLine ?? 10;
    var ds = Setting.singleton.currentDatastore;
    List<Future<dynamic>> futures = [
      ApiService.getFields(ds),
      ConditionService.internal().getConditionList(),
      ApiService.getUsers(),
      DisplayService.internal().getConditionList(ds)
    ];

    final data = await Future.wait(futures);

    final fields = data[0];
    final conditionList = data[1];
    final users = data[2];
    final fieldList = data[3];

    final List<SearchCondition> conditions = [];
    for (var item in conditionList) {
      SearchCondition sct = SearchCondition.fromJson(item);
      conditions.add(sct);
    }

    String conditionType = SpUtil.getString('conditionType', defValue: 'and');

    final items = await ApiService.getItems(
      ds,
      conditions: conditions,
      conditionType: conditionType,
      index: 1,
      size: size,
    );

    if (fields == null || items.itemsList == null || users == null) {
      this.isEmpty = true;
    } else {
      List<Field> _fs = [];
      if (fieldList.length == 0) {
        for (var item in fields) {
          if (item.isCheckImage == true) {
            this.checkField = item.fieldId;
            continue;
          }
          _fs.add(item);
        }
      } else {
        final List<DisplayField> _displays = [];
        for (var item in fieldList) {
          DisplayField fs = DisplayField.fromJson(item);
          _displays.add(fs);
        }

        for (Field item in fields) {
          if (item.isCheckImage == true) {
            this.checkField = item.fieldId;
            continue;
          }
          var i = _displays.singleWhere(
            (f) => f.fieldId == item.fieldId,
            orElse: () => null,
          );
          if (i != null) {
            item.displayOrder = i.displayOrder;
            _fs.add(item);
          }
        }
      }

      _fs.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
      this.fields = _fs ?? [];
      this.items = items.itemsList ?? [];
      this.total = items.total ?? 0;
      this.hasReachedMax = items.total <= (1 * size) ? true : false;

      for (var item in this.items) {
        checkItems.add(CheckedItem(itemId: item.itemId, checked: false));
      }
    }
  }

  // Add ViewModel specific code here
  loadMore() async {
    if (!this.hasReachedMax) {
      this.index++;
      var ds = Setting.singleton.currentDatastore;
      var conditionList = await ConditionService.internal().getConditionList();
      final List<SearchCondition> conditions = [];
      for (var item in conditionList) {
        SearchCondition sct = SearchCondition.fromJson(item);
        conditions.add(sct);
      }

      String conditionType = SpUtil.getString('conditionType', defValue: 'and');

      final items = await ApiService.getItems(
        ds,
        conditions: conditions,
        conditionType: conditionType,
        index: this.index,
        size: this.size,
      );

      if (items.itemsList != null) {
        this.items += items.itemsList ?? [];
        this.total = items.total;
        this.hasReachedMax = items.total <= (1 * size) ? true : false;

        for (var item in this.items) {
          checkItems.add(CheckedItem(itemId: item.itemId, checked: false));
        }
      }
    }
  }

  List<DynamicItem> buildItems(Map<String, its.Value> itemDatas) {
    List<DynamicItem> tempItems = [];
    if (this.fields.length > 0) {
      // 循环字段信息
      for (var f in this.fields) {
        if (itemDatas.containsKey(f.fieldId)) {
          var it = new DynamicItem(
            fieldID: f.fieldId,
            appID: f.appId,
            datastoreID: f.datastoreId,
            lookupDatastoreID: f.lookupDatastoreId,
            lookupFieldID: f.lookupFieldId,
            fieldName: f.fieldName,
            fieldType: f.fieldType,
            isImage: f.isImage,
            displayOrder: f.displayOrder,
            prefix: f.prefix,
            returnType: f.returnType,
            displayDigits: f.displayDigits,
            precision: f.precision,
            value: itemDatas[f.fieldId],
          );

          tempItems.add(it);
        } else {
          var value;
          switch (f.fieldType) {
            case 'text':
            case 'textarea':
            case 'number':
              value = '';
              break;
            case 'autonum':
              value = '';
              break;
            case 'date':
              value = '';
              break;
            case 'time':
              value = '';
              break;
            case 'user':
            case 'file':
              value = "[]";
              break;
            case 'switch':
              value = false;
              break;
            case 'options':
              value = '';
              break;
            case 'function':
              value = '';
              break;
            case 'lookup':
              value = '';
              break;
            default:
              value = '';
              break;
          }
          DynamicItem it = new DynamicItem(
            fieldID: f.fieldId,
            appID: f.appId,
            datastoreID: f.datastoreId,
            lookupDatastoreID: f.lookupDatastoreId,
            lookupFieldID: f.lookupFieldId,
            fieldName: f.fieldName,
            fieldType: f.fieldType,
            isImage: f.isImage,
            displayOrder: f.displayOrder,
            prefix: f.prefix,
            displayDigits: f.displayDigits,
            precision: f.precision,
            value: its.Value(value, f.fieldType),
          );

          tempItems.add(it);
        }
      }

      tempItems.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
      return tempItems;
    } else {
      return [];
    }
  }

  close() {
    if (this.scrollController != null) {
      this.scrollController.dispose();
    }
  }

  click(int index) {
    if (this.showCheck) {
      checkItems[index] = CheckedItem(
        itemId: items[index].itemId,
        checked: !checkItems[index].checked,
      );
      checkItems = checkItems;
      return;
    }

    _nav.navigateToPage(MaterialPageRoute(
      builder: (context) => DetailView(
        this.items[index].datastoreId,
        this.items[index].itemId,
        canCheck: this.canCheck,
        checkField: this.checkField,
      ),
    ));
  }

  check(int index, bool value) {
    checkItems[index] = CheckedItem(
      itemId: items[index].itemId,
      checked: value,
    );

    checkItems = checkItems;
  }

  change() {
    if (this.canCheck) {
      this.showCheck = !this.showCheck;
    }
  }

  inventory(BuildContext context) async {
    List<String> _items = [];
    for (var item in this.checkItems) {
      if (item.checked == true) {
        _items.add(item.itemId);
      }
    }

    if (_items.length > 0) {
      bool result = await ApiService.mutilInventoryItem(
        Setting.singleton.currentDatastore,
        "Visual",
        _items,
      );
      if (result) {
        BotToast.showText(
          text: 'info_check_success'.tr,
        );
      }

      CheckUpdate.showAlert(
        context,
        Setting.singleton.scanDatastore,
        _items,
      );
      eventBus.fire(RefreshEvent());
    }
  }
  // Add ViewModel specific code here
}
