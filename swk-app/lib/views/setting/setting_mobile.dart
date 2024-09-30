part of setting_view;

class _SettingMobile extends StatefulWidget {
  final SettingViewModel viewModel;
  _SettingMobile(this.viewModel, {Key key}) : super(key: key);

  @override
  __SettingMobileState createState() => __SettingMobileState();
}

class __SettingMobileState extends State<_SettingMobile> {
  SettingViewModel _viewModel;

  @override
  void initState() {
    super.initState();
    _viewModel = widget.viewModel;
  }

  @override
  Widget build(BuildContext context) {
    return _bodyData();
  }

  Widget _bodyData() {
    return ListView(
      children: <Widget>[
        ListTile(
          leading: Text('setting_base_title'.tr),
        ),
        Divider(
          height: 1,
          color: Get.theme.dividerColor,
        ),
        ListTile(
          title: Row(
            children: <Widget>[
              Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(
                  Icons.apps_outlined,
                ),
              ),
              Text('setting_app_title'.tr)
            ],
          ),
          trailing: Icon(Icons.keyboard_arrow_right_outlined),
          onTap: () => _viewModel.goAppSettingView(context),
        ),
        ListTile(
          title: Row(
            children: <Widget>[
              Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(
                  Icons.computer_outlined,
                ),
              ),
              Text('setting_service_title'.tr)
            ],
          ),
          trailing: Icon(Icons.keyboard_arrow_right_outlined),
          onTap: () => _viewModel.goBaseSettingView(context),
        ),
        ListTile(
          title: Row(
            children: <Widget>[
              Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(
                  Icons.translate,
                ),
              ),
              Text('setting_language_title'.tr)
            ],
          ),
          trailing: Icon(Icons.keyboard_arrow_right_outlined),
          onTap: () async {
            var options = _getOptions();
            Get.bottomSheet(Material(
              borderRadius: BorderRadius.all(
                Radius.circular(10.0),
              ),
              child: Container(
                child: Column(children: [
                  ListTile(
                    title: Text(
                      'setting_language_select_title'.tr,
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
                ]),
              ),
            ));
          },
        ),
        ListTile(
          leading: Text('setting_field_title'.tr),
        ),
        Divider(
          height: 1,
          color: Get.theme.dividerColor,
        ),
        ListTile(
          title: Row(
            children: <Widget>[
              Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(Icons.aod_outlined),
              ),
              Text('setting_field_title'.tr)
            ],
          ),
          trailing: Icon(Icons.keyboard_arrow_right_outlined),
          onTap: () => _viewModel.goFieldSettingView(context),
        ),
        ListTile(
          leading: Text('setting_scan_title'.tr),
        ),
        Divider(
          height: 1,
          color: Get.theme.dividerColor,
        ),
        ListTile(
          title: Row(
            children: <Widget>[
              Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(
                  Icons.qr_code,
                ),
              ),
              Text('setting_scan_title'.tr)
            ],
          ),
          trailing: Icon(Icons.keyboard_arrow_right_outlined),
          onTap: () => _viewModel.goScanSettingView(context),
        ),
        ListTile(
          title: Row(
            children: <Widget>[
              Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(Icons.fact_check_outlined),
              ),
              Text(
                _viewModel.showDetail ? 'setting_scan_show_detail'.tr : 'setting_scan_check_in'.tr,
              )
            ],
          ),
          trailing: CupertinoSwitch(
            activeColor: Get.theme.primaryColor,
            value: _viewModel.showDetail,
            onChanged: _viewModel.changeDetail,
          ),
        ),
        ListTile(
          title: Row(
            children: <Widget>[
              Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(
                  Icons.devices_other,
                ),
              ),
              Text('setting_scan_divice_title'.tr)
            ],
          ),
          trailing: Icon(Icons.keyboard_arrow_right_outlined),
          onTap: () {
            Get.bottomSheet(Material(
              borderRadius: BorderRadius.all(
                Radius.circular(10.0),
              ),
              child: Container(
                child: Wrap(
                  children: [
                    ListTile(
                      title: Text(
                        'setting_scan_divice_title'.tr,
                      ),
                    ),
                    ListTile(
                      title: Row(
                        children: <Widget>[
                          Padding(
                            child: Icon(
                              Icons.camera,
                              color: _viewModel.scanDivice == 'camera' ? Colors.green : Colors.black,
                            ),
                            padding: EdgeInsets.only(right: 8.0),
                          ),
                          Container(
                            child: Text(
                              'setting_scan_camera'.tr,
                              style: TextStyle(
                                color: _viewModel.scanDivice == 'camera' ? Colors.green : Colors.black,
                              ),
                              textAlign: TextAlign.start,
                            ),
                          ),
                        ],
                      ),
                      onTap: () {
                        _viewModel.changeScanDivice('camera');
                        Get.back();
                      },
                    ),
                    ListTile(
                      title: Row(
                        children: <Widget>[
                          Padding(
                            child: Icon(
                              Icons.scanner,
                              color: _viewModel.scanDivice == 'gun' ? Colors.green : Colors.black,
                            ),
                            padding: EdgeInsets.only(right: 8.0),
                          ),
                          Container(
                            child: Text(
                              'setting_scan_gun'.tr,
                              style: TextStyle(
                                color: _viewModel.scanDivice == 'gun' ? Colors.green : Colors.black,
                              ),
                              textAlign: TextAlign.start,
                            ),
                          ),
                        ],
                      ),
                      onTap: () {
                        _viewModel.changeScanDivice('gun');
                        Get.back();
                      },
                    ),
                    ListTile(
                      title: Row(
                        children: <Widget>[
                          Padding(
                            child: Icon(
                              Icons.speaker_phone,
                              color: _viewModel.scanDivice == 'rfid' ? Colors.green : Colors.black,
                            ),
                            padding: EdgeInsets.only(right: 8.0),
                          ),
                          Container(
                            child: Text(
                              'RFID',
                              style: TextStyle(
                                color: _viewModel.scanDivice == 'rfid' ? Colors.green : Colors.black,
                              ),
                              textAlign: TextAlign.start,
                            ),
                          ),
                        ],
                      ),
                      onTap: () {
                        _viewModel.changeScanDivice('rfid');
                        Get.back();
                      },
                    ),
                  ],
                ),
              ),
            ));
          },
        ),
        ListTile(
          title: Row(
            children: <Widget>[
              Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(
                  Icons.speaker_phone,
                ),
              ),
              Text('setting_rfid_setting_title'.tr)
            ],
          ),
          trailing: Icon(Icons.keyboard_arrow_right_outlined),
          onTap: () => {SkipPluginUtil.skipPage('rfidConfig')},
        ),
        ListTile(
          leading: Text('setting_image_title'.tr),
        ),
        Divider(
          height: 1,
          color: Get.theme.dividerColor,
        ),
        ListTile(
          title: Row(
            children: <Widget>[
              Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(
                  Icons.image_outlined,
                ),
              ),
              Text('setting_show_image_label'.tr)
            ],
          ),
          trailing: CupertinoSwitch(
            activeColor: Get.theme.primaryColor,
            value: _viewModel.showImage,
            onChanged: _viewModel.changeImage,
          ),
        ),
        ListTile(
          leading: Text('setting_list_title'.tr),
        ),
        Divider(
          height: 1,
          color: Get.theme.dividerColor,
        ),
        ListTile(
          title: Row(
            children: <Widget>[
              Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(
                  Icons.format_list_numbered_outlined,
                ),
              ),
              Text('setting_list_count_title'.tr)
            ],
          ),
          trailing: Text('${_viewModel.line}'),
          onTap: () {
            _showLineSetting();
          },
        ),
        ListTile(
          leading: Text(
            'setting_update_title'.tr,
          ),
        ),
        Divider(
          height: 1,
          color: Get.theme.dividerColor,
        ),
        ListTile(
          title: Row(
            children: <Widget>[
              Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(
                  Icons.security_update_good_outlined,
                ),
              ),
              Text('setting_update_version_title'.tr)
            ],
          ),
          trailing: Text('2.4.6'),
        ),
        ListTile(
          title: Row(
            children: <Widget>[
              Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(
                  Icons.privacy_tip_outlined,
                ),
              ),
              Text('setting_privacy_statement_title'.tr)
            ],
          ),
          trailing: Icon(Icons.keyboard_arrow_right_outlined),
          onTap: _viewModel.openPrivacy,
        ),
        ListTile(
          title: Row(
            children: <Widget>[
              Padding(
                padding: EdgeInsets.only(right: 10),
                child: Icon(
                  Icons.info_outline,
                ),
              ),
              Text('about_title'.tr)
            ],
          ),
          trailing: Icon(Icons.keyboard_arrow_right_outlined),
          onTap: () => _viewModel.goAboutView(context),
        ),
      ],
    );
  }

  void _showLineSetting() {
    showDialog<void>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, state) {
            return AlertDialog(
              title: Text('setting_list_count_title'.tr),
              content: Container(
                height: 80,
                child: ReactiveForm(
                  formGroup: this._viewModel.form,
                  child: Column(
                    children: [
                      Divider(
                        height: 1,
                      ),
                      ReactiveTextField<int>(
                        formControlName: 'line',
                        keyboardType: TextInputType.number,
                        inputFormatters: [FilteringTextInputFormatter.digitsOnly], //允许的输入格式
                        decoration: InputDecoration(
                          hintText: 'placeholder_input'.tr,
                          border: InputBorder.none,
                        ),
                        validationMessages: (control) => {
                          'required': 'info_check_required'.tr,
                          'min': 'error_min_value_format'.trParams({'min': '10'}),
                          'max': 'error_max_value_format'.trParams({'max': '100'}),
                        },
                      ),
                      Divider(
                        height: 1,
                      ),
                    ],
                  ),
                ),
              ),
              actions: <Widget>[
                OutlinedButton(
                  child: Text('button_cancle'.tr),
                  onPressed: _viewModel.goBack,
                ),
                ElevatedButton(
                  child: Text('button_ok'.tr),
                  onPressed: _viewModel.forSubmitted,
                ),
              ],
            );
          },
        );
      },
    );
  }

  _getOptions() {
    List<ListTile> options = [];
    options.add(
      ListTile(
        title: Row(
          children: <Widget>[
            Container(
              width: 40,
              child: Text('🇨🇳'),
              padding: EdgeInsets.only(right: 8.0),
            ),
            Container(
              width: 80,
              child: Text(
                'setting_language_zh'.tr,
                style: TextStyle(
                  color: _viewModel.locale.languageCode == 'zh' ? Colors.green : Colors.black,
                ),
              ),
            ),
          ],
        ),
        onTap: () {
          var locale = Locale('zh', 'CN');
          Get.updateLocale(locale);
          _viewModel.setSelectLanguage('zh');
          Get.back();
        },
      ),
    );

    options.add(
      ListTile(
        title: Row(
          children: <Widget>[
            Container(
              width: 40,
              child: Text('🇺🇸'),
              padding: EdgeInsets.only(right: 8.0),
            ),
            Container(
              width: 80,
              child: Text(
                'setting_language_en'.tr,
                style: TextStyle(
                  color: _viewModel.locale.languageCode == 'en' ? Colors.green : Colors.black,
                ),
              ),
            ),
          ],
        ),
        onTap: () {
          var locale = Locale('en', 'US');
          Get.updateLocale(locale);
          _viewModel.setSelectLanguage('en');
          Get.back();
        },
      ),
    );

    options.add(
      ListTile(
        title: Row(
          children: <Widget>[
            Container(
              width: 40,
              child: Text('🇯🇵'),
              padding: EdgeInsets.only(right: 8.0),
            ),
            Container(
              width: 80,
              child: Text(
                'setting_language_jp'.tr,
                style: TextStyle(
                  color: _viewModel.locale.languageCode == 'ja' ? Colors.green : Colors.black,
                ),
              ),
            ),
          ],
        ),
        onTap: () {
          var locale = Locale('ja', 'JP');
          Get.updateLocale(locale);
          _viewModel.setSelectLanguage('ja');
          Get.back();
        },
      ),
    );
    options.add(
      ListTile(
        title: Row(
          children: <Widget>[
            Container(
              width: 40,
              child: Text('🇹🇭'),
              padding: EdgeInsets.only(right: 8.0),
            ),
            Container(
              width: 80,
              child: Text(
                'setting_language_th'.tr,
                style: TextStyle(
                  color: _viewModel.locale.languageCode == 'th' ? Colors.green : Colors.black,
                ),
              ),
            ),
          ],
        ),
        onTap: () {
          var locale = Locale('th', 'TH');
          Get.updateLocale(locale);
          _viewModel.setSelectLanguage('th');
          Get.back();
        },
      ),
    );

    return options;
  }
}
