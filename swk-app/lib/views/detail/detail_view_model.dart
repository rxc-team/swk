import 'package:bot_toast/bot_toast.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart';
import 'package:pit3_app/common/application.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/models/field.dart';
import 'package:pit3_app/core/models/file.dart';
import 'package:pit3_app/core/models/items.dart' as its;
import 'package:pit3_app/core/models/workflow.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:get/get.dart';
import 'package:pit3_app/logic/event/refresh_event.dart';
import 'package:pit3_app/logic/event/tip_event.dart';
import 'package:pit3_app/logic/http/api_service.dart';
import 'package:pit3_app/core/models/common_model.dart';
import 'package:pit3_app/views/form/add/add_view.dart';
import 'package:pit3_app/views/form/copy/copy_view.dart';
import 'package:pit3_app/views/form/update/update_view.dart';
import 'package:pit3_app/views/scan/check_update.dart';
import 'package:pit3_app/views/scan/detail_scan/detail_scan_view.dart';
import 'package:pit3_app/widgets/dialog/image_preview_dialog.dart';
import 'package:pit3_app/widgets/loading/loading_indicator.dart';

class DetailViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();
  List<DynamicItem> _listData = [];
  List<Workflow> _workflows = [];
  Map<String, bool> _actions = new Map();
  SystemInfo _footerInfo;
  String _checkField = '';
  String _datastoreId = '';
  String _itemId = '';
  bool _canCheck = false;
  bool _scan = false;

  List<DynamicItem> get listData => this._listData;
  set listData(List<DynamicItem> value) {
    this._listData = value;
    notifyListeners();
  }

  List<Workflow> get workflows => this._workflows;
  set workflows(List<Workflow> value) {
    this._workflows = value;
    notifyListeners();
  }

  Map<String, bool> get actions => this._actions;
  set actions(Map<String, bool> value) {
    this._actions = value;
    notifyListeners();
  }

  SystemInfo get footerInfo => this._footerInfo;
  set footerInfo(SystemInfo value) {
    this._footerInfo = value;
    notifyListeners();
  }

  String get checkField => this._checkField;
  set checkField(String value) {
    this._checkField = value;
    notifyListeners();
  }

  String get datastoreId => this._datastoreId;
  set datastoreId(String value) {
    this._datastoreId = value;
    notifyListeners();
  }

  String get itemId => this._itemId;
  set itemId(String value) {
    this._itemId = value;
    notifyListeners();
  }

  bool get canCheck => this._canCheck;
  set canCheck(bool value) {
    this._canCheck = value;
    notifyListeners();
  }

  bool get scan => this._scan;
  set scan(bool value) {
    this._scan = value;
    notifyListeners();
  }

  DetailViewModel();

  // Add ViewModel specific code here
  init(String datastoreId, String itemId, String checkField, bool canCheck, bool scan) async {
    this.loading = true;
    this.checkField = checkField;
    this.datastoreId = datastoreId;
    this.itemId = itemId;
    this.canCheck = canCheck;
    this.scan = scan;

    try {
      List<Future<dynamic>> futures = [
        ApiService.getFields(datastoreId),
        ApiService.getItem(datastoreId, itemId),
        ApiService.getUserWorkflows(datastoreId, action: 'update'),
        ApiService.getDatastore(this.datastoreId),
        ApiService.checkAction('insert', this.datastoreId),
        ApiService.checkAction('update', this.datastoreId)
      ];

      final data = await Future.wait(futures);
      final fields = data[0];
      final item = data[1];
      final workflows = data[2];
      final ds = data[3];
      final insert = data[4];
      final update = data[5];

      if (fields == null || item == null) {
        this.isEmpty = true;
      } else {
        // 设置中间部分检查人员信息
        CheckInfo check = CheckInfo(
          item.checkedBy,
          item.checkedAt,
          item.checkType,
          item.checkStatus,
        );
        // 设置底部固定信息
        SystemInfo system = SystemInfo(
          item.createdBy,
          item.createdAt,
          item.updatedBy,
          item.updatedAt,
          item.owners,
          check,
          item.status,
        );

        this.listData = buildItems(fields, item.items);
        this.footerInfo = system;
        this.workflows = workflows ?? [];
      }

      // 按钮权限判定
      // insert
      if (ds.apiKey == 'keiyakudaicho') {
        this.actions['insert'] = false;
        this.actions['update'] = false;
      } else {
        if (insert.data == true) {
          this.actions['insert'] = true;
        } else {
          this.actions['insert'] = false;
        }

        // update
        if (update.data == true) {
          this.actions['update'] = true;
        } else {
          this.actions['update'] = false;
        }
      }
      this.loading = false;
    } catch (e) {
      this.loading = false;
    }
  }

  // Add ViewModel specific code here
  refresh(String datastoreID, String itemID) async {
    this.loading = true;
    try {
      List<Future<dynamic>> futures = [
        ApiService.getFields(datastoreId),
        ApiService.getItem(datastoreId, itemId),
        ApiService.getUserWorkflows(datastoreId, action: 'update'),
      ];

      final data = await Future.wait(futures);
      final fields = data[0];
      final item = data[1];
      final workflows = data[2];

      if (fields == null || item == null) {
        this.isEmpty = true;
      } else {
        // 设置中间部分检查人员信息
        CheckInfo check = CheckInfo(
          item.checkedBy,
          item.checkedAt,
          item.checkType,
          item.checkStatus,
        );
        // 设置底部固定信息
        SystemInfo system = SystemInfo(
          item.createdBy,
          item.createdAt,
          item.updatedBy,
          item.updatedAt,
          item.owners,
          check,
          item.status,
        );

        this.listData = buildItems(fields, item.items);
        this.footerInfo = system;
        this.workflows = workflows ?? [];
      }
      this.loading = false;
    } catch (e) {
      this.loading = false;
    }
  }

  List<DynamicItem> buildItems(
    List<Field> fieldDatas,
    Map<String, its.Value> itemDatas,
  ) {
    List<DynamicItem> tempItems = [];
    // 循环字段信息
    for (var f in fieldDatas) {
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
          case 'date':
            value = '';
            break;
          case 'time':
            value = '';
            break;
          case 'user':
          case 'file':
            value = '[]';
            break;
          case 'switch':
            value = false;
            break;
          case 'options':
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
  }

  Future<void> getImage(BuildContext context) async {
    eventBus.fire(TipEvent());
    var imagePicker = ImagePicker();
    var image = await imagePicker.pickImage(source: ImageSource.camera);
    if (image != null) {
      var cancel = BotToast.showCustomLoading(toastBuilder: (cancelFunc) {
        return LoadingIndicator(
          msg: 'info_file_upload_loading'.tr,
        );
      });

      try {
        FileData result = await ApiService.upload(
          datastoreId,
          image.path,
          basename(image.path),
          true,
          (int received, int total) {},
        );
        cancel();
        if (result != null) {
          bool scanResult = await ApiService.inventoryItem(
            datastoreId,
            itemId,
            'Image',
            image: result.url,
            checkField: checkField,
          );

          if (scanResult) {
            BotToast.showText(text: 'info_check_success'.tr);
            eventBus.fire(RefreshEvent());
          } else {
            BotToast.showText(text: 'error_check_failure'.tr);
          }
        }
      } catch (e) {
        cancel();
      }
    }
  }

  Future<void> check(BuildContext context) async {
    if (scan) {
      bool result = await ApiService.inventoryItem(
        datastoreId,
        itemId,
        'Scan',
      );
      if (result) {
        BotToast.showText(text: 'info_check_success'.tr);
        eventBus.fire(RefreshEvent());
      } else {
        BotToast.showText(text: 'error_check_failure'.tr);
      }
      CheckUpdate.showAlert(
        context,
        datastoreId,
        [itemId],
      );
    } else {
      bool result = await ApiService.inventoryItem(
        datastoreId,
        itemId,
        'Visual',
      );
      if (result) {
        BotToast.showText(text: 'info_check_success'.tr);
        eventBus.fire(RefreshEvent());
      } else {
        BotToast.showText(text: 'error_check_failure'.tr);
      }
    }
  }

  String getCheckTypeName(BuildContext context, String checkType) {
    if (checkType == 'Visual') {
      return 'check_type_visual'.tr;
    }
    if (checkType == 'Scan') {
      return 'check_type_scan'.tr;
    }
    if (checkType == 'Image') {
      return 'check_type_image'.tr;
    }

    return '';
  }

  //跳转到更新画面
  gotoUpdate() {
    _nav.navigateToPage(MaterialPageRoute(
      builder: (context) => UpdateView(
        datastoreId: this.datastoreId,
        itemId: this.itemId,
      ),
    ));
  }

  //跳转到新规画面
  gotoAdd() async {
    await _nav.navigateToPage(MaterialPageRoute(
      builder: (context) => AddView(),
    ));
  }

  //跳转到新规画面
  gotoCopyAdd() async {
    await _nav.navigateToPage(MaterialPageRoute(
      builder: (context) => CopyView(
        datastoreId: this.datastoreId,
        itemId: this.itemId,
      ),
    ));
  }

  //跳转到扫描画面
  Future<void> gotoScan() async {
    var result = await _nav.navigateToPage(MaterialPageRoute(
      builder: (context) => DetailScanView(
        itemId: this.itemId,
      ),
    ));

    if (result) {
      refresh(this.datastoreId, this.itemId);
    }
  }

  //跳转到更新（审批）画面
  gotoAudit(BuildContext context, String wfId) {
    Navigator.pop(context);
    _nav.navigateToPage(MaterialPageRoute(
      builder: (context) => UpdateView(
        datastoreId: this.datastoreId,
        itemId: this.itemId,
        wfId: wfId,
      ),
    ));
  }

//显示图片
  showImage(List<dynamic> files, int index, BuildContext context) {
    if (files is List<String>) {
      List<String> images = [];
      for (var url in files) {
        images.add(Setting().buildFileURL(url));
      }
      Navigator.push(
        context,
        MaterialPageRoute<void>(
          builder: (BuildContext context) => ImagePreviewDialog(
            images: images,
            index: index,
          ),
          fullscreenDialog: true,
        ),
      );
    } else {
      List<String> images = [];
      for (var image in files) {
        images.add(Setting().buildFileURL(image.url));
      }
      Navigator.push(
        context,
        MaterialPageRoute<void>(
          builder: (BuildContext context) => ImagePreviewDialog(
            images: images,
            index: index,
          ),
          fullscreenDialog: true,
        ),
      );
    }
  }
}
