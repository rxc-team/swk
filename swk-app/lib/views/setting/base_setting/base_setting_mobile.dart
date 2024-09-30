/*
 * @Descripttion: 
 * @Author: Rxc 陳平
 * @Date: 2020-08-21 17:39:26
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2020-09-03 13:13:18
 */
part of base_setting_view;

class _BaseSettingMobile extends StatefulWidget {
  final BaseSettingViewModel viewModel;
  _BaseSettingMobile(this.viewModel, {Key key}) : super(key: key);

  @override
  __BaseSettingMobileState createState() => __BaseSettingMobileState();
}

class __BaseSettingMobileState extends State<_BaseSettingMobile> {
  BaseSettingViewModel _vm;

  @override
  void initState() {
    super.initState();
    _vm = widget.viewModel;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        centerTitle: true,
        title: Text('setting_base_title'.tr),
      ),
      body: SingleChildScrollView(
        child: Container(
          padding: EdgeInsets.symmetric(vertical: 16),
          child: ReactiveForm(
            formGroup: this._vm.form,
            child: Column(
              children: [
                ListTile(
                  leading: Text(
                    'setting_service_title'.tr,
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
                Divider(
                  height: 1,
                ),
                ReactiveDropdownField<String>(
                  formControlName: 'serverEnv',
                  decoration: InputDecoration(
                    prefixIcon: Icon(Icons.dns_outlined),
                    hintText: 'setting_service_title'.tr,
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.only(left: 12, top: 12),
                  ),
                  items: [
                    DropdownMenuItem(
                      value: 'dev',
                      child: Text('setting_service_develop'.tr),
                    ),
                    DropdownMenuItem(
                      value: 'prod',
                      child: Text('setting_service_prod'.tr),
                    ),
                    DropdownMenuItem(
                      value: 'custom',
                      child: Text('setting_service_custom'.tr),
                    ),
                  ],
                  onChanged: (String val) {
                    this._vm.change(val);
                  },
                ),
                Divider(
                  height: 1,
                ),
                ..._buildItems(),
                Container(
                  margin: EdgeInsets.only(top: 32),
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    child: Text('button_ok'.tr),
                    onPressed: _vm.done,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _buildItems() {
    List<Widget> items = [];
    if (_vm.readOnly) {
      return items;
    }

    items.add(
      ListTile(
        leading: Text(
          'setting_service_address'.tr,
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ),
    );
    items.add(
      Divider(
        height: 1,
      ),
    );

    items.add(
      ReactiveTextField(
        formControlName: 'serverHost',
        decoration: InputDecoration(
          prefixIcon: Icon(Icons.cloud_queue_outlined),
          hintText: 'setting_service_address'.tr,
          border: InputBorder.none,
          contentPadding: EdgeInsets.only(left: 12, top: 12),
        ),
        readOnly: _vm.readOnly,
        onSubmitted: () {
          this._vm.form.focus('fileServerHost');
        },
      ),
    );
    items.add(
      Divider(
        height: 1,
      ),
    );

    items.add(
      ListTile(
        leading: Text(
          'setting_service_file_service_address'.tr,
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ),
    );
    items.add(
      Divider(
        height: 1,
      ),
    );
    items.add(
      ReactiveTextField(
        formControlName: 'fileServerHost',
        decoration: InputDecoration(
          prefixIcon: Icon(Icons.cloud_upload_outlined),
          hintText: 'setting_service_file_service_address'.tr,
          border: InputBorder.none,
          contentPadding: EdgeInsets.only(left: 12, top: 12),
        ),
        readOnly: _vm.readOnly,
      ),
    );
    items.add(
      Divider(
        height: 1,
      ),
    );
    return items;
  }
}
