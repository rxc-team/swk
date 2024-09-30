part of app_setting_view;

class _AppSettingMobile extends StatefulWidget {
  final AppSettingViewModel viewModel;

  _AppSettingMobile(this.viewModel, {Key key}) : super(key: key);

  @override
  __AppSettingMobileState createState() => __AppSettingMobileState();
}

class __AppSettingMobileState extends State<_AppSettingMobile> {
  AppSettingViewModel _viewModel;

  @override
  void initState() {
    super.initState();
    _viewModel = widget.viewModel;
  }

  @override
  Widget build(BuildContext context) {
    return _viewModel.loading ? LoadingIndicator(msg: 'loading'.tr) : _body();
  }

  Widget _body() {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: Text('setting_app_title'.tr),
      ),
      body: ListView(
        children: <Widget>[
          ListTile(
            leading: Text(
              'setting_app_current'.tr,
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
          Divider(
            height: 1,
          ),
          _viewModel.currentAppName.isEmpty
              ? ListTile(
                  onTap: () {
                    var options = _getOptions();
                    Get.bottomSheet(Material(
                      borderRadius: BorderRadius.all(
                        Radius.circular(10.0),
                      ),
                      child: Container(
                        child: Column(
                          children: [
                            ListTile(
                              title: Text(
                                'setting_app_select_title'.tr,
                              ),
                            ),
                            Expanded(
                              child: ListView.separated(
                                itemBuilder: (context, index) {
                                  return options[index];
                                },
                                separatorBuilder: (context, index) {
                                  return Divider(
                                    height: 1,
                                  );
                                },
                                itemCount: options.length,
                              ),
                            ),
                            // ...options
                          ],
                        ),
                      ),
                    ));
                  },
                  title: Text(
                    'placeholder_select'.tr,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade400,
                    ),
                  ),
                )
              : ListTile(
                  onTap: () {
                    var options = _getOptions();
                    Get.bottomSheet(Material(
                      borderRadius: BorderRadius.all(
                        Radius.circular(10.0),
                      ),
                      child: Container(
                        child: Column(
                          children: [
                            ListTile(
                              title: Text(
                                'setting_app_select_title'.tr,
                              ),
                            ),
                            Expanded(
                              child: ListView.separated(
                                itemBuilder: (context, index) {
                                  return options[index];
                                },
                                separatorBuilder: (context, index) {
                                  return Divider(
                                    height: 1,
                                  );
                                },
                                itemCount: options.length,
                              ),
                            ),
                            // ...options
                          ],
                        ),
                      ),
                    ));
                  },
                  title: Text(ts.Translations.trans(_viewModel.currentAppName)),
                ),
          Divider(
            height: 1,
          ),
          ListTile(
            title: Container(
              margin: EdgeInsets.only(top: 32),
              padding: EdgeInsets.symmetric(horizontal: 16),
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                child: Text('button_ok'.tr),
                onPressed: _viewModel.changeApp,
              ),
            ),
          )
        ],
      ),
    );
  }

  _getOptions() {
    List<ListTile> options = [];
    for (var item in _viewModel.apps) {
      options.add(
        ListTile(
          title: Center(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: <Widget>[
                Padding(
                  child: Icon(
                    Icons.apps_rounded,
                    color: Get.theme.primaryColor,
                  ),
                  padding: EdgeInsets.only(right: 8.0),
                ),
                Container(
                  child: Text(
                    ts.Translations.trans(item.appName),
                    textAlign: TextAlign.start,
                  ),
                ),
              ],
            ),
          ),
          onTap: () {
            _viewModel.selectApp(item.appId);
            Get.back();
          },
        ),
      );
    }

    return options;
  }
}
