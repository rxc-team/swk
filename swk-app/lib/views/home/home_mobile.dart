part of home_view;

class _HomeMobile extends StatefulWidget {
  final HomeViewModel viewModel;
  _HomeMobile(this.viewModel, {Key key}) : super(key: key);

  @override
  __HomeMobileState createState() => __HomeMobileState();
}

class __HomeMobileState extends State<_HomeMobile> {
  HomeViewModel _viewModel;
  StreamSubscription<RefreshEvent> _refresh;

  @override
  void initState() {
    super.initState();
    _viewModel = widget.viewModel;
    _refresh = eventBus.on<RefreshEvent>().listen((event) {
      _viewModel.init();
    });
    eventBus.on<TotalEvent>().listen((event) {
      _viewModel.setTotal(event.total);
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
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
    return _viewModel.loading ? LoadingIndicator(msg: 'loading'.tr) : _body();
  }

  Widget _body() {
    if (_viewModel.isEmpty) {
      return DatastoreDataEmpty();
    }

    return Container(
      child: Column(
        children: <Widget>[
          _buildAction(),
          Expanded(
            child: Container(
              child: Column(
                children: <Widget>[
                  Container(
                    child: ListTile(
                      title: Text.rich(
                        TextSpan(
                          text: ts.Translations.trans(
                            _viewModel.current?.datastoreName ?? "",
                          ),
                          children: <TextSpan>[
                            TextSpan(text: "("),
                            TextSpan(
                              text: "${_viewModel.total ?? 0}",
                              style: TextStyle(
                                color: Colors.red,
                              ),
                            ),
                            TextSpan(text: ")"),
                          ],
                        ),
                      ),
                      trailing: PopupMenuButton<String>(
                        padding: EdgeInsets.zero,
                        onSelected: (val) {
                          if (val == _viewModel.current.datastoreId) {
                            return;
                          }

                          final AlertDialog dialog = AlertDialog(
                            title: Text('pop_title'.tr),
                            content: Text('info_database_switch_confirm'.tr),
                            actions: [
                              OutlinedButton(
                                onPressed: () => Get.back(),
                                child: Text('button_cancle'.tr),
                              ),
                              ElevatedButton(
                                onPressed: () {
                                  _viewModel.change(val);
                                  Get.back();
                                },
                                child: Text('button_ok'.tr),
                              ),
                            ],
                          );

                          Get.dialog(dialog);
                        },
                        itemBuilder: (BuildContext context) {
                          return map<PopupMenuEntry<String>>(
                            _viewModel.datastores,
                            (int index, Datastore item) {
                              return PopupMenuItem<String>(
                                value: item.datastoreId,
                                height: 60,
                                child: Text(
                                  ts.Translations.trans(item.datastoreName),
                                ),
                              );
                            },
                          );
                        },
                      ),
                    ),
                  ),
                  Expanded(
                    child: ItemListView(canCheck: _viewModel.canCheck),
                  )
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAction() {
    List<Widget> actions = [];
    // 检索
    actions.add(
      Expanded(
        child: ActionButton(
          onTap: _viewModel.gotoSearch,
          icon: Icons.search_outlined,
          iconColor: Colors.green,
          label: 'button_search'.tr,
        ),
      ),
    );
    // 新规
    if (_viewModel.actions['insert']) {
      actions.add(
        Expanded(
          child: ActionButton(
            onTap: _viewModel.gotoAdd,
            icon: Icons.add_outlined,
            iconColor: Colors.blue,
            label: 'button_create'.tr,
          ),
        ),
      );
    }
    if (_viewModel.canCheck) {
      // 扫描
      actions.add(
        Expanded(
          child: ActionButton(
            onTap: _viewModel.gotoScan,
            icon: Icons.qr_code,
            iconColor: Colors.orange,
            label: 'button_scan'.tr,
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
}
