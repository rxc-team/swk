part of detail_view;

class ItemModel {
  String title;
  IconData icon;

  ItemModel(this.title, this.icon);
}

class _DetailMobile extends StatefulWidget {
  final DetailViewModel viewModel;

  _DetailMobile(this.viewModel);
  @override
  __DetailMobileState createState() => __DetailMobileState();
}

class __DetailMobileState extends State<_DetailMobile> with TickerProviderStateMixin {
  CustomPopupMenuController _controller = CustomPopupMenuController();
  CustomPopupMenuController _addcontroller = CustomPopupMenuController();
  TextStyle lableStyle = TextStyle(
    color: Colors.grey.shade700,
    fontWeight: FontWeight.w400,
  );

  GlobalKey btnKey = GlobalKey();
  DetailViewModel _viewModel;
  StreamSubscription<RefreshEvent> _refresh;

  @override
  void initState() {
    super.initState();
    _viewModel = widget.viewModel;
    _refresh = eventBus.on<RefreshEvent>().listen((event) {
      _viewModel.refresh(_viewModel.datastoreId, _viewModel.itemId);
    });
  }

  @override
  void dispose() {
    super.dispose();
    if (_refresh != null) {
      _refresh.cancel();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        centerTitle: true,
        title: Text('detail_title'.tr),
      ),
      body: _body(),
    );
  }

  Widget _body() {
    if (_viewModel.loading) {
      return Container(
        child: Column(
          children: <Widget>[
            NetWorkCheck(),
            Expanded(
              child: LoadingIndicator(msg: 'loading'.tr),
            ),
          ],
        ),
      );
    }

    if (_viewModel.isEmpty) {
      return Container(
        child: Column(
          children: <Widget>[
            NetWorkCheck(),
            Expanded(
              child: EmptyWidget(),
            ),
          ],
        ),
      );
    }
    return Container(
      child: Column(
        children: <Widget>[
          NetWorkCheck(),
          _buildAction(),
          Expanded(
            child: _buildRow(_viewModel.listData, _viewModel.footerInfo),
          ),
        ],
      ),
    );
  }

  Widget _buildAction() {
    List<Widget> actions = [];
    List<Widget> scanItems = [
      // 目视确认
      GestureDetector(
        behavior: HitTestBehavior.translucent,
        onTap: () async {
          _controller.hideMenu();
          await _viewModel.check(context);
        },
        child: Container(
          height: 40,
          margin: EdgeInsets.symmetric(vertical: 8),
          padding: EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: <Widget>[
              Icon(Icons.remove_red_eye_outlined, color: Colors.green),
              Expanded(
                child: Container(
                  margin: EdgeInsets.only(left: 10),
                  padding: EdgeInsets.symmetric(vertical: 10),
                  child: Text(
                    'button_eye_check'.tr,
                    style: TextStyle(color: Colors.black38),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      Divider(height: 1),
      // 图片盘点
      GestureDetector(
        behavior: HitTestBehavior.translucent,
        onTap: () async {
          _controller.hideMenu();
          _viewModel.getImage(context);
        },
        child: Container(
          height: 40,
          margin: EdgeInsets.symmetric(vertical: 8),
          padding: EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: <Widget>[
              Icon(Icons.image_outlined, color: Colors.green),
              Expanded(
                child: Container(
                  margin: EdgeInsets.only(left: 10),
                  padding: EdgeInsets.symmetric(vertical: 10),
                  child: Text(
                    'button_image_check'.tr,
                    style: TextStyle(color: Colors.black38),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      Divider(height: 1),
      // 扫描盘点
      GestureDetector(
        behavior: HitTestBehavior.translucent,
        onTap: () async {
          _controller.hideMenu();
          if (_viewModel.scan) {
            _viewModel.check(context);
            return;
          }
          _viewModel.gotoScan();
        },
        child: Container(
          height: 40,
          margin: EdgeInsets.symmetric(vertical: 8),
          padding: EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: <Widget>[
              Icon(Icons.qr_code, color: Colors.green),
              Expanded(
                child: Container(
                  margin: EdgeInsets.only(left: 10),
                  padding: EdgeInsets.symmetric(vertical: 10),
                  child: Text(
                    'button_scan'.tr,
                    style: TextStyle(color: Colors.black38),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    ];
    List<Widget> addItems = [
      // 新规
      GestureDetector(
        behavior: HitTestBehavior.translucent,
        onTap: () async {
          _addcontroller.hideMenu();
          await _viewModel.gotoAdd();
        },
        child: Container(
          height: 40,
          margin: EdgeInsets.symmetric(vertical: 8),
          padding: EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: <Widget>[
              Icon(Icons.add_box_outlined, color: Colors.blue),
              Expanded(
                child: Container(
                  margin: EdgeInsets.only(left: 10),
                  padding: EdgeInsets.symmetric(vertical: 10),
                  child: Text(
                    'button_create'.tr,
                    style: TextStyle(color: Colors.black38),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      Divider(height: 1),
      // 复制
      GestureDetector(
        behavior: HitTestBehavior.translucent,
        onTap: () async {
          _addcontroller.hideMenu();
          await _viewModel.gotoCopyAdd();
        },
        child: Container(
          height: 40,
          margin: EdgeInsets.symmetric(vertical: 8),
          padding: EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: <Widget>[
              Icon(Icons.copy_all_outlined, color: Colors.blue),
              Expanded(
                child: Container(
                  margin: EdgeInsets.only(left: 10),
                  padding: EdgeInsets.symmetric(vertical: 10),
                  child: Text(
                    'button_copy'.tr,
                    style: TextStyle(color: Colors.black38),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      Divider(height: 1),
    ];

    if (_viewModel.checkField.isEmpty) {
      scanItems.removeAt(2);
      scanItems.removeAt(2);
    }

    if (_viewModel.scan) {
      scanItems.removeAt(0);
      scanItems.removeAt(0);
    }

    var check = _viewModel.canCheck && _viewModel.datastoreId == Setting.singleton.scanDatastore;

    if (check) {
      // 新规
      if (_viewModel.actions['insert']) {
        actions.add(
          Expanded(
            child: CustomPopupMenu(
              child: ActionButton(
                onTap: null,
                icon: Icons.add_outlined,
                iconColor: Colors.blue,
                label: 'button_new'.tr,
                disabled: _viewModel.footerInfo.status != '1',
              ),
              arrowSize: 20,
              arrowColor: Colors.white,
              menuBuilder: () => ClipRRect(
                borderRadius: BorderRadius.circular(5),
                child: Container(
                  color: Colors.white,
                  child: IntrinsicWidth(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: addItems,
                    ),
                  ),
                ),
              ),
              pressType: PressType.singleClick,
              verticalMargin: -10,
              controller: _addcontroller,
            ),
          ),
        );
      }
      // 更新
      if (_viewModel.actions['update']) {
        actions.add(
          Expanded(
            child: ActionButton(
              onTap: _viewModel.gotoUpdate,
              icon: Icons.edit_outlined,
              iconColor: Colors.orange,
              label: 'button_update'.tr,
              disabled: _viewModel.footerInfo.status != '1',
            ),
          ),
        );
      }
      // 盘点
      actions.add(
        Expanded(
          child: CustomPopupMenu(
            child: ActionButton(
              onTap: null,
              icon: Icons.task_outlined,
              iconColor: Colors.green,
              label: 'button_check'.tr,
              disabled: _viewModel.footerInfo.status != '1',
            ),
            arrowSize: 20,
            arrowColor: Colors.white,
            menuBuilder: () => ClipRRect(
              borderRadius: BorderRadius.circular(5),
              child: Container(
                color: Colors.white,
                child: IntrinsicWidth(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: scanItems,
                  ),
                ),
              ),
            ),
            pressType: PressType.singleClick,
            verticalMargin: -10,
            controller: _controller,
          ),
        ),
      );

      if (_viewModel.workflows.length > 0) {
        // 审批
        actions.add(
          Expanded(
            child: ActionButton(
              onTap: _audit,
              icon: Icons.inventory_sharp,
              iconColor: Colors.redAccent,
              label: 'button_audit'.tr,
              disabled: _viewModel.footerInfo.status != '1',
            ),
          ),
        );
      }

      if (actions.length < 4) {
        actions.add(
          Expanded(
            child: Material(color: Get.theme.primaryColor, child: Container()),
            flex: 4 - actions.length,
          ),
        );
      }

      return Container(
        height: 80,
        child: Row(
          children: actions,
        ),
      );
    }

    // 新规
    if (_viewModel.actions['insert']) {
      actions.add(
        Expanded(
          child: CustomPopupMenu(
            child: ActionButton(
              onTap: null,
              icon: Icons.add_outlined,
              iconColor: Colors.blue,
              label: 'button_new'.tr,
              disabled: _viewModel.footerInfo.status != '1',
            ),
            arrowSize: 20,
            arrowColor: Colors.white,
            menuBuilder: () => ClipRRect(
              borderRadius: BorderRadius.circular(5),
              child: Container(
                color: Colors.white,
                child: IntrinsicWidth(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: addItems,
                  ),
                ),
              ),
            ),
            pressType: PressType.singleClick,
            verticalMargin: -10,
            controller: _addcontroller,
          ),
        ),
      );
    }
    // 更新
    if (_viewModel.actions['update']) {
      actions.add(
        Expanded(
          child: ActionButton(
            onTap: _viewModel.gotoUpdate,
            icon: Icons.edit_outlined,
            iconColor: Colors.orange,
            label: 'button_update'.tr,
            disabled: _viewModel.footerInfo.status != '1',
          ),
        ),
      );
    }

    // 审批
    if (_viewModel.workflows.length > 0) {
      actions.add(
        Expanded(
          child: ActionButton(
            onTap: _audit,
            icon: Icons.inventory_sharp,
            iconColor: Colors.redAccent,
            label: 'button_audit'.tr,
            disabled: _viewModel.footerInfo.status != '1',
          ),
        ),
      );
    }

    if (actions.length < 4) {
      actions.add(
        Expanded(
          child: Material(color: Get.theme.primaryColor, child: Container()),
          flex: 4 - actions.length,
        ),
      );
    }

    return Container(
      height: 80,
      child: Row(
        children: actions,
      ),
    );
  }

  _audit() async {
    var alertDialogs = await showDialog(
        context: context,
        builder: (context) {
          return SimpleDialog(
            title: Text('button_audit'.tr),
            children: map<Widget>(
              _viewModel.workflows,
              (int index, Workflow wf) {
                return Padding(
                  padding: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                  child: ElevatedButton(
                    child: Text(ts.Translations.tranCommon(wf.menuName)),
                    onPressed: _viewModel.footerInfo.status == '1'
                        ? () {
                            _viewModel.gotoAudit(context, wf.wfId);
                          }
                        : null,
                  ),
                );
              },
            ),
          );
        });
    return alertDialogs;
  }

  Widget _buildRow(List<DynamicItem> items, SystemInfo systemInfo) {
    List<Widget> _items = [];

    items.forEach((item) {
      var value = Common.getValue(item.value);
      switch (item.fieldType) {
        case 'file':
          // 添加图片
          if (item.value == null || value.length == 0) {
            _items.add(
              ListTile(
                dense: true,
                title: Text(
                  ts.Translations.trans(item.fieldName) + ':',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                subtitle: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: new Row(
                    children: <Widget>[],
                  ),
                ),
              ),
            );
          } else {
            if (item.isImage == true) {
              List<Widget> images = [];
              for (var i = 0; i < value.length; i++) {
                if (value[i] is FileItem) {
                  images.add(
                    new InkWell(
                      onTap: () {
                        _viewModel.showImage(value, i, context);
                      },
                      child: Image.network(
                        Setting().buildFileURL(value[i].url),
                        height: 40,
                        width: 80,
                        fit: BoxFit.cover,
                      ),
                    ),
                  );
                }
              }
              _items.add(
                ListTile(
                  dense: true,
                  title: Text(
                    ts.Translations.trans(item.fieldName) + ':',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  subtitle: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: new Row(
                      children: <Widget>[...images],
                    ),
                  ),
                ),
              );
            } else {
              // 添加一般文件
              List<Widget> files = [];
              value.forEach((file) {
                if (file is FileItem) {
                  files.add(new InkWell(
                    onTap: () {
                      BotToast.showText(text: '下载路径为：${file.url}');
                    },
                    child: Text(
                      file.name,
                      style: TextStyle(fontSize: 16),
                    ),
                  ));
                }
              });

              _items.add(
                ListTile(
                  dense: true,
                  title: Text(
                    ts.Translations.trans(item.fieldName) + ':',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  subtitle: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: new Row(
                      children: <Widget>[...files],
                    ),
                  ),
                ),
              );
            }
          }
          break;
        case 'user':
          _items.add(
            ListTile(
              dense: true,
              title: Text(
                ts.Translations.trans(item.fieldName) + ':',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: new Row(
                  children: <Widget>[..._buildUsers(value)],
                ),
              ),
            ),
          );
          break;
        case 'date':
          _items.add(
            ListTile(
              dense: true,
              title: Text(
                ts.Translations.trans(item.fieldName) + ':',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Text(
                  value == ""
                      ? ""
                      : DateUtil.formatDateStr(
                          value,
                          format: 'yyyy-MM-dd',
                        ),
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
          );
          break;
        case 'time':
          _items.add(
            ListTile(
              dense: true,
              title: Text(
                ts.Translations.trans(item.fieldName) + ':',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Text(
                  value ?? "",
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
          );
          break;
        case 'lookup':
          _items.add(
            ListTile(
              dense: true,
              title: Text(
                ts.Translations.trans(item.fieldName) + ':',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Text(
                  value,
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
          );
          break;
        case 'switch':
          _items.add(
            ListTile(
              dense: true,
              title: Text(
                ts.Translations.trans(item.fieldName) + ':',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Text(
                  value.toString(),
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
          );
          break;
        case 'options':
          _items.add(
            ListTile(
              dense: true,
              title: Text(
                ts.Translations.trans(item.fieldName) + ':',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Text(
                  ts.Translations.trans(value),
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
          );
          break;
        case 'number':
          _items.add(
            ListTile(
              dense: true,
              title: Text(
                ts.Translations.trans(item.fieldName) + ':',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Text(
                  NumberUtil.numberFormat(value, precision: item.precision),
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
          );
          break;
        case 'autonum':
          _items.add(
            ListTile(
              dense: true,
              title: Text(
                ts.Translations.trans(item.fieldName) + ':',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Text(
                  value,
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
          );
          break;
        case 'function':
          if (item.returnType == 'text') {
            _items.add(
              ListTile(
                dense: true,
                title: Text(
                  ts.Translations.trans(item.fieldName) + ':',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                subtitle: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Text(
                    value,
                    style: TextStyle(fontSize: 16),
                  ),
                ),
              ),
            );
          } else {
            _items.add(
              ListTile(
                dense: true,
                title: Text(
                  ts.Translations.trans(item.fieldName) + ':',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                subtitle: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Text(
                    value.toString(),
                    style: TextStyle(fontSize: 16),
                  ),
                ),
              ),
            );
          }
          break;
        default:
          _items.add(
            ListTile(
              dense: true,
              title: Text(
                ts.Translations.trans(item.fieldName) + ':',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Text(
                  value,
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
          );
          break;
      }
    });

    return Container(
      child: BottomDragWidget(
        body: Container(
          margin: EdgeInsets.only(bottom: 36),
          child: ListView(
            children: ListTile.divideTiles(context: context, tiles: _items).toList(),
          ),
        ),
        dragContainer: DragContainer(
          defaultShowHeight: 36.0,
          height: 500,
          drawer: Container(
            width: Get.height * 0.5,
            decoration: BoxDecoration(
              color: Get.theme.bottomAppBarColor,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(10.0),
                topRight: Radius.circular(10.0),
              ),
            ),
            child: Column(
              children: <Widget>[
                Container(
                  height: 6.0,
                  width: 50.0,
                  margin: EdgeInsets.symmetric(vertical: 15),
                  decoration: BoxDecoration(
                    color: Color.fromARGB(255, 214, 215, 218),
                    borderRadius: BorderRadius.all(
                      Radius.circular(10.0),
                    ),
                  ),
                ),
                Expanded(
                  child: _buildSystemInfo(systemInfo),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSystemInfo(SystemInfo systemInfo) {
    return Material(
      child: Container(
        height: MediaQuery.of(context).size.height * 0.5 - 26,
        child: ListView(
          children: <Widget>[
            _buildCheckInfo(_viewModel.footerInfo.checkInfo),
            ListTile(
              title: Text(
                'detail_create_info'.tr,
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            Divider(
              height: 1,
            ),
            ListTile(
              leading: Icon(
                Icons.person_outline,
              ),
              title: Text(
                systemInfo.createUser,
              ),
              trailing: Text(
                date.DateUtils.formatDateTime(systemInfo.createTime),
              ),
            ),
            Divider(
              height: 1,
            ),
            ListTile(
              title: Text(
                'detail_update_info'.tr,
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            Divider(
              height: 1,
            ),
            ListTile(
              leading: Icon(
                Icons.person_outline,
              ),
              title: Text(
                systemInfo.updateUser,
              ),
              trailing: Text(
                date.DateUtils.formatDateTime(systemInfo.updateTime),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildUsers(List<dynamic> userList) {
    List<Widget> _users = [];
    if (userList != null && userList.length > 0) {
      for (var u in userList) {
        if (u != "") {
          _users.add(
            Chip(
              avatar: CircleAvatar(
                backgroundImage: AssetImage('images/default_user_header.png'),
              ),
              label: Text(u),
            ),
          );
        }
      }
    }

    return _users;
  }

  Widget _buildCheckInfo(CheckInfo checkInfo) {
    if (_viewModel.canCheck) {
      Widget body;
      if (checkInfo.lastCheckUser.isEmpty) {
        body = Card(
          clipBehavior: Clip.antiAlias,
          child: Container(
            padding: EdgeInsets.symmetric(vertical: 10),
            alignment: Alignment.center,
            child: Text(
              'detail_not_check'.tr,
            ),
          ),
        );
      } else {
        body = Card(
          clipBehavior: Clip.antiAlias,
          child: Container(
            height: 115,
            color: Get.theme.cardColor,
            child: Column(
              children: <Widget>[
                ListTile(
                  leading: Icon(
                    Icons.task_outlined,
                  ),
                  title: Text(
                    _viewModel.getCheckTypeName(context, checkInfo.lastCheckType),
                  ),
                  trailing: checkInfo.checkStatus == '1'
                      ? Icon(
                          Icons.check_circle,
                          color: Colors.green,
                        )
                      : Icon(
                          Icons.warning,
                          color: Colors.orange,
                        ),
                ),
                Divider(
                  height: 1,
                ),
                ListTile(
                  leading: Icon(
                    Icons.person_outline,
                  ),
                  title: Text(
                    checkInfo.lastCheckUser.isNotEmpty ? checkInfo.lastCheckUser : 'detail_not_check'.tr,
                  ),
                  trailing: Text(
                    date.DateUtils.formatDateTime(checkInfo.lastCheckTime),
                  ),
                ),
              ],
            ),
          ),
        );
      }

      return body;
    }
    return Container(
      height: 2.0,
    );
  }
}
