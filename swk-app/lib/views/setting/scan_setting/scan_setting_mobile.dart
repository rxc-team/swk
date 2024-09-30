part of scan_setting_view;

class _ScanSettingMobile extends StatefulWidget {
  final ScanSettingViewModel viewModel;
  _ScanSettingMobile(this.viewModel, {Key key}) : super(key: key);

  @override
  __ScanSettingMobileState createState() => __ScanSettingMobileState();
}

class __ScanSettingMobileState extends State<_ScanSettingMobile> {
  ScanSettingViewModel _vm;

  @override
  void initState() {
    super.initState();
    this._vm = widget.viewModel;
  }

  @override
  Widget build(BuildContext context) {
    return _vm.loading ? LoadingIndicator(msg: 'loading'.tr) : _body(context);
  }

  Widget _body(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        centerTitle: true,
        title: Text('setting_scan_title'.tr),
      ),
      body: Column(
        children: <Widget>[
          ListTile(
            title: Text(
              'setting_scan_datastore_placeholder'.tr,
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Divider(
            height: 1,
            color: Get.theme.dividerColor,
          ),
          _vm.datastore == null || _vm.datastore.datastoreName.isEmpty
              ? ListTile(
                  title: Text(
                    'placeholder_select'.tr,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade400,
                    ),
                  ),
                  onTap: () {
                    var options = _getOptions();
                    Get.bottomSheet(Material(
                      borderRadius: BorderRadius.all(
                        Radius.circular(10.0),
                      ),
                      child: Container(
                        child: Wrap(
                          children: [
                            ListTile(
                              title: Text(
                                'setting_app_select_title'.tr,
                              ),
                            ),
                            ...options
                          ],
                        ),
                      ),
                    ));
                  },
                )
              : ListTile(
                  onTap: () {
                    var options = _getOptions();
                    Get.bottomSheet(Material(
                      borderRadius: BorderRadius.all(
                        Radius.circular(10.0),
                      ),
                      child: Container(
                        child: Wrap(
                          children: [
                            ListTile(
                              title: Text(
                                'setting_app_select_title'.tr,
                              ),
                            ),
                            ...options
                          ],
                        ),
                      ),
                    ));
                  },
                  title: Text(
                    ts.Translations.trans(_vm.datastore.datastoreName),
                  ),
                ),
          Divider(
            height: 1,
            color: Get.theme.dividerColor,
          ),
          ListTile(
            title: Text(
              'setting_scan_update_field_title'.tr,
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            trailing: ElevatedButton(
              child: Icon(Icons.add),
              onPressed: () async {
                UpdateCondition result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (BuildContext context) => FieldSelectDialog(
                      lookupFields: this._vm.lookupFields,
                      fieldOptions: this._vm.fieldOptions,
                      optionMap: this._vm.optionMap,
                    ),
                    fullscreenDialog: true,
                  ),
                );

                if (result != null) {
                  this._vm.add(result);
                }
              },
            ),
          ),
          Divider(
            height: 1,
            color: Get.theme.dividerColor,
          ),
          Expanded(
              child: ListView.separated(
            itemCount: _vm.updateConditions.length,
            separatorBuilder: (context, index) {
              return Divider(
                height: 1,
                color: Get.theme.dividerColor,
              );
            },
            itemBuilder: (context, index) {
              UpdateCondition item = _vm.updateConditions[index];
              return ListTile(
                leading: Text(
                  ts.Translations.trans(item.fieldName) + " : ",
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.black54,
                    fontSize: 16,
                  ),
                ),
                title: Text(
                  _vm.getValue(item),
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.left,
                  style: TextStyle(
                    color: Colors.black54,
                    fontSize: 16,
                  ),
                ),
                trailing: IconButton(
                  icon: Icon(
                    Icons.close_rounded,
                    color: Colors.red,
                  ),
                  onPressed: () => _vm.remove(item.id),
                ),
              );
            },
          )),
          ListTile(
            title: Container(
              margin: EdgeInsets.only(top: 32),
              padding: EdgeInsets.symmetric(horizontal: 16),
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                child: Text('button_ok'.tr),
                onPressed: _vm.done,
              ),
            ),
          ),
        ],
      ),
    );
  }

  _getOptions() {
    List<ListTile> options = [];
    for (var item in _vm.datastores) {
      options.add(
        ListTile(
          title: Center(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: <Widget>[
                Padding(
                  child: Icon(
                    Icons.storage_outlined,
                    color: Get.theme.primaryColor,
                  ),
                  padding: EdgeInsets.only(right: 8.0),
                ),
                Container(
                  child: Text(
                    ts.Translations.trans(item.datastoreName),
                    textAlign: TextAlign.start,
                  ),
                ),
              ],
            ),
          ),
          onTap: () {
            _vm.selectDatastore(item.datastoreId);
            Get.back();
          },
        ),
      );
    }

    return options;
  }
}
