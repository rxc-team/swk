part of field_setting_view;

class _FieldSettingMobile extends StatefulWidget {
  final FieldSettingViewModel viewModel;
  _FieldSettingMobile(this.viewModel, {Key key}) : super(key: key);

  @override
  __FieldSettingMobileState createState() => __FieldSettingMobileState();
}

class __FieldSettingMobileState extends State<_FieldSettingMobile> {
  FieldSettingViewModel _vm;

  @override
  void initState() {
    super.initState();
    this._vm = widget.viewModel;
  }

  @override
  Widget build(BuildContext context) {
    return _vm.loading ? LoadingIndicator(msg: 'loading'.tr) : _body();
  }

  Widget _body() {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        centerTitle: true,
        title: Text('setting_field_title'.tr),
      ),
      body: Column(
        children: <Widget>[
          ListTile(
            title: Text(
              'setting_datastore_placeholder'.tr,
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ),
          Divider(
            height: 1,
          ),
          _vm.datastore == null || _vm.datastore.datastoreName.isEmpty
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
                                'setting_datastore_placeholder'.tr,
                                style: TextStyle(fontSize: 20),
                              ),
                            ),
                            Divider(
                              height: 1,
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
                    Get.bottomSheet(
                      Material(
                        borderRadius: BorderRadius.all(
                          Radius.circular(10.0),
                        ),
                        child: Container(
                          child: Column(
                            children: [
                              ListTile(
                                title: Text(
                                  'setting_datastore_placeholder'.tr,
                                  style: TextStyle(fontSize: 20),
                                ),
                              ),
                              Divider(
                                height: 1,
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
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                  title: Text(
                    ts.Translations.trans(_vm.datastore.datastoreName),
                  ),
                ),
          Divider(
            height: 1,
          ),
          ListTile(
            title: Text(
              'setting_show_field'.tr,
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            trailing: ElevatedButton(
              onPressed: () {
                var options = _getFieldOptions();
                Get.bottomSheet(Material(
                  borderRadius: BorderRadius.all(
                    Radius.circular(10.0),
                  ),
                  child: Container(
                    child: Column(
                      children: [
                        ListTile(
                          title: Text(
                            'setting_show_field'.tr,
                            style: TextStyle(fontSize: 20),
                          ),
                        ),
                        Divider(
                          height: 1,
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
                      ],
                    ),
                  ),
                ));
              },
              child: Icon(Icons.add),
            ),
          ),
          Divider(
            height: 1,
          ),
          Expanded(
            child: ListView(
              children: _buildList(_vm.displayFields),
            ),
          ),
          ListTile(
            title: Container(
              margin: EdgeInsets.only(top: 32),
              padding: EdgeInsets.symmetric(horizontal: 16),
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                child: Text('button_save'.tr),
                onPressed: _vm.datastore == null ? null : () => _vm.done(context),
              ),
            ),
          ),
          ListTile(
            title: Container(
              margin: EdgeInsets.only(top: 16),
              padding: EdgeInsets.symmetric(horizontal: 16),
              width: double.infinity,
              height: 50,
              child: OutlinedButton(
                child: Text('button_cancle'.tr),
                onPressed: _vm.cancel,
              ),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildList(List<DisplayField> fields) {
    List<Widget> list = [];
    for (var field in fields) {
      list.add(
        ListTile(
          title: Text(ts.Translations.trans(field.fieldName)),
          subtitle: Text(field.fieldType),
          trailing: IconButton(
            onPressed: () {
              _vm.removeField(field);
            },
            icon: Icon(
              Icons.close,
              color: Colors.red,
            ),
          ),
        ),
      );
    }
    return list;
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

  _getFieldOptions() {
    List<ListTile> options = [];
    for (var item in _vm.fields) {
      options.add(
        ListTile(
          title: Text(
            ts.Translations.trans(item.fieldName),
            textAlign: TextAlign.start,
          ),
          subtitle: Text(item.fieldType),
          onTap: () {
            _vm.addField(item.fieldId);
            Get.back();
          },
        ),
      );
    }

    return options;
  }
}
