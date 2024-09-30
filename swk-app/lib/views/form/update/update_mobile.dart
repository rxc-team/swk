part of update_view;

class _UpdateMobile extends StatefulWidget {
  final UpdateViewModel viewModel;
  _UpdateMobile(this.viewModel, {Key key}) : super(key: key);

  @override
  __UpdateMobileState createState() => __UpdateMobileState();
}

class __UpdateMobileState extends State<_UpdateMobile> {
  UpdateViewModel _vm;

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
        title: Text('update_title'.tr),
        actions: [
          UploadProgress(
            process: _vm.process,
          ),
        ],
      ),
      body: _body(),
    );
  }

  Widget _body() {
    if (_vm.loading) {
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

    if (_vm.isEmpty) {
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

    return _buildRow();
  }

  Widget _buildRow() {
    List<Widget> _items = [];
    for (var i = 0; i < _vm.fields.length; i++) {
      Field item = _vm.fields[i];
      switch (item.fieldType) {
        case 'text':
          _items.add(
            ListTile(
              dense: true,
              leading: Text.rich(
                TextSpan(children: [
                  TextSpan(text: (item.isRequired == true ? '*' : ''), style: TextStyle(color: Colors.red)),
                  TextSpan(
                    text: ts.Translations.trans(item.fieldName),
                  ),
                  TextSpan(
                    text: ":",
                  ),
                ]),
                textAlign: TextAlign.start,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          );
          _items.add(
            ReactiveTextField<String>(
              formControlName: item.fieldId,
              keyboardType: TextInputType.text,
              decoration: InputDecoration(
                hintText: 'placeholder_input'.tr,
                border: InputBorder.none,
                contentPadding: EdgeInsets.only(left: 12),
              ),
              validationMessages: (control) => {
                'required': 'info_check_required'.tr,
                'minLength': 'error_min_lenght_format'.trParams({'min': item.minLength.toString()}),
                'maxLength': 'error_max_lenght_format'.trParams({'max': item.maxLength.toString()}),
                'unique': 'error_unique'.tr.trParams({"fields": ts.Translations.trans(item.fieldName)}),
                'special': 'error_special'.tr
              },
              onTap: () {
                this._vm.focusItem = item;
              },
              onSubmitted: () {
                if (i < _vm.fields.length - 1) {
                  this._vm.form.focus(_vm.fields[i + 1].fieldId);
                }
              },
            ),
          );
          break;
        case 'textarea':
          _items.add(
            ListTile(
              dense: true,
              leading: Text.rich(
                TextSpan(children: [
                  TextSpan(text: (item.isRequired == true ? '*' : ''), style: TextStyle(color: Colors.red)),
                  TextSpan(
                    text: ts.Translations.trans(item.fieldName),
                  ),
                  TextSpan(
                    text: ":",
                  ),
                ]),
                textAlign: TextAlign.start,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          );
          _items.add(
            ReactiveTextField<String>(
              formControlName: item.fieldId,
              keyboardType: TextInputType.text,
              decoration: InputDecoration(
                hintText: 'placeholder_input'.tr,
                border: InputBorder.none,
                contentPadding: EdgeInsets.only(left: 12),
              ),
              maxLines: 5,
              validationMessages: (control) => {
                'required': 'info_check_required'.tr,
                'minLength': 'error_min_lenght_format'.trParams({'min': item.minLength.toString()}),
                'maxLength': 'error_max_lenght_format'.trParams({'max': item.maxLength.toString()}),
                'special': 'error_special'.tr
              },
              onTap: () {
                this._vm.focusItem = item;
              },
              onSubmitted: () {
                if (i < _vm.fields.length - 1) {
                  this._vm.form.focus(_vm.fields[i + 1].fieldId);
                }
              },
            ),
          );
          break;
        case 'number':
          _items.add(
            ListTile(
              dense: true,
              leading: Text.rich(
                TextSpan(children: [
                  TextSpan(text: (item.isRequired == true ? '*' : ''), style: TextStyle(color: Colors.red)),
                  TextSpan(
                    text: ts.Translations.trans(item.fieldName),
                  ),
                  TextSpan(
                    text: ":",
                  ),
                ]),
                textAlign: TextAlign.start,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          );
          _items.add(
            ReactiveTextField<String>(
              formControlName: item.fieldId,
              keyboardType: TextInputType.number,
              inputFormatters: [DecimalFormatter(decimalRange: item.precision)], //允许的输入格式
              decoration: InputDecoration(
                hintText: 'placeholder_input'.tr,
                border: InputBorder.none,
                contentPadding: EdgeInsets.only(left: 12),
              ),
              validationMessages: (control) => {
                'required': 'info_check_required'.tr,
                'min': 'error_min_value_format'.trParams({'min': item.minValue.toString()}),
                'max': 'error_max_value_format'.trParams({'max': item.maxValue.toString()}),
              },
              onTap: () {
                this._vm.focusItem = item;
              },
              onSubmitted: () {
                if (i < _vm.fields.length - 1) {
                  this._vm.form.focus(_vm.fields[i + 1].fieldId);
                }
              },
            ),
          );
          break;
        case 'autonum':
          _items.add(
            ListTile(
              dense: true,
              leading: Text.rich(
                TextSpan(children: [
                  TextSpan(text: (item.isRequired == true ? '*' : ''), style: TextStyle(color: Colors.red)),
                  TextSpan(
                    text: ts.Translations.trans(item.fieldName),
                  ),
                  TextSpan(
                    text: ":",
                  ),
                ]),
                textAlign: TextAlign.start,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          );
          _items.add(
            ReactiveTextField<String>(
              formControlName: item.fieldId,
              readOnly: true,
              decoration: InputDecoration(
                hintText: 'placeholder_auto_input'.tr,
                border: InputBorder.none,
                contentPadding: EdgeInsets.only(left: 12),
              ),
              onSubmitted: () {
                if (i < _vm.fields.length - 1) {
                  this._vm.form.focus(_vm.fields[i + 1].fieldId);
                }
              },
            ),
          );
          break;
        case 'function':
          _items.add(
            ListTile(
              dense: true,
              leading: Text.rich(
                TextSpan(children: [
                  TextSpan(text: (item.isRequired == true ? '*' : ''), style: TextStyle(color: Colors.red)),
                  TextSpan(
                    text: ts.Translations.trans(item.fieldName),
                  ),
                  TextSpan(
                    text: ":",
                  ),
                ]),
                textAlign: TextAlign.start,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          );
          _items.add(
            ReactiveTextField<String>(
              formControlName: item.fieldId,
              readOnly: true,
              decoration: InputDecoration(
                hintText: 'placeholder_auto_input'.tr,
                border: InputBorder.none,
                contentPadding: EdgeInsets.only(left: 12),
              ),
              onSubmitted: () {
                if (i < _vm.fields.length - 1) {
                  this._vm.form.focus(_vm.fields[i + 1].fieldId);
                }
              },
            ),
          );
          break;
        case 'file':
          // 添加图片
          if (item.isImage == true) {
            _items.add(
              ListTile(
                dense: true,
                leading: Text.rich(
                  TextSpan(children: [
                    TextSpan(text: (item.isRequired == true ? '*' : ''), style: TextStyle(color: Colors.red)),
                    TextSpan(
                      text: ts.Translations.trans(item.fieldName),
                    ),
                    TextSpan(
                      text: ":",
                    ),
                  ]),
                  textAlign: TextAlign.start,
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            );
            _items.add(
              ReactiveValueListenableBuilder<List<FileItem>>(
                formControlName: item.fieldId,
                builder: (context, value, child) {
                  return Container(
                    height: 240.0,
                    padding: EdgeInsets.all(4.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Container(
                          alignment: Alignment.centerRight,
                          child: ElevatedButton(
                            onPressed: _vm.process == 0
                                ? () async {
                                    showModalBottomSheet<bool>(
                                      context: context,
                                      builder: (context) {
                                        return Container(
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                          ),
                                          child: Column(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              ListTile(
                                                title: Text(
                                                  "image_upload_tips".tr,
                                                  style: TextStyle(fontWeight: FontWeight.bold),
                                                ),
                                              ),
                                              ListTile(
                                                leading: Icon(Icons.photo_camera),
                                                title: Text("image_upload_camera".tr),
                                                onTap: () async {
                                                  await _vm.getImage(item.datastoreId, item.fieldId, true);
                                                },
                                              ),
                                              ListTile(
                                                leading: Icon(Icons.photo_library),
                                                title: Text("image_upload_gallery".tr),
                                                onTap: () async {
                                                  await _vm.getImage(item.datastoreId, item.fieldId, false);
                                                },
                                              ),
                                            ],
                                          ),
                                        );
                                      },
                                    );
                                  }
                                : null,
                            child: Text(
                              'button_image_upload'.tr,
                              style: TextStyle(color: Colors.white),
                            ),
                          ),
                        ),
                        Expanded(
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: map<Widget>(
                                value.value,
                                (int index, FileItem file) {
                                  return InkWell(
                                    onTap: () {
                                      _vm.showImage(
                                        value.value,
                                        index,
                                        context,
                                      );
                                    },
                                    child: Container(
                                      decoration: BoxDecoration(
                                        border: Border.all(
                                          width: 1,
                                          color: Get.theme.dividerColor,
                                        ),
                                      ),
                                      child: Column(
                                        children: <Widget>[
                                          Container(
                                            child: Image.network(
                                              Setting.singleton.buildFileURL(file.url),
                                              fit: BoxFit.fill,
                                              height: 152,
                                              width: 100,
                                            ),
                                          ),
                                          InkWell(
                                            child: Container(
                                              height: 30,
                                              width: 100,
                                              color: Get.theme.cardColor,
                                              child: Icon(
                                                Icons.close,
                                                color: Colors.red,
                                              ),
                                            ),
                                            onTap: () {
                                              _vm.remove(item.fieldId, file);
                                            },
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            );
          } else {
            _items.add(
              ListTile(
                dense: true,
                leading: Text.rich(
                  TextSpan(children: [
                    TextSpan(text: (item.isRequired == true ? '*' : ''), style: TextStyle(color: Colors.red)),
                    TextSpan(
                      text: ts.Translations.trans(item.fieldName),
                    ),
                    TextSpan(
                      text: ":",
                    ),
                  ]),
                  textAlign: TextAlign.start,
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            );

            _items.add(
              ReactiveValueListenableBuilder<List<FileItem>>(
                formControlName: item.fieldId,
                builder: (context, value, child) {
                  return Container(
                    height: 180.0,
                    padding: EdgeInsets.all(4.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Container(
                          alignment: Alignment.centerRight,
                          child: ElevatedButton(
                            onPressed: _vm.process == 0
                                ? () async {
                                    await _vm.getFile(item.datastoreId, item.fieldId);
                                  }
                                : null,
                            child: Text(
                              'button_file_upload'.tr,
                              style: TextStyle(color: Colors.white),
                            ),
                          ),
                        ),
                        Expanded(
                          child: SingleChildScrollView(
                            scrollDirection: Axis.vertical,
                            child: Column(
                              children: map<Widget>(
                                value.value,
                                (int index, FileItem file) {
                                  return Container(
                                    margin: EdgeInsets.all(2.0),
                                    color: Get.theme.cardColor,
                                    child: ListTile(
                                      dense: true,
                                      title: Text(
                                        file.name,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      trailing: InkWell(
                                        child: Icon(
                                          Icons.close,
                                          color: Colors.red,
                                        ),
                                        onTap: () {
                                          _vm.remove(item.fieldId, file);
                                        },
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            );
          }
          break;
        case 'user':
          _items.add(
            ListTile(
              dense: true,
              leading: Text.rich(
                TextSpan(children: [
                  TextSpan(text: (item.isRequired == true ? '*' : ''), style: TextStyle(color: Colors.red)),
                  TextSpan(
                    text: ts.Translations.trans(item.fieldName),
                  ),
                  TextSpan(
                    text: ":",
                  ),
                ]),
                textAlign: TextAlign.start,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          );

          _items.add(
            InkWell(
              onTap: () {
                this._vm.focusItem = item;
              },
              child: ReactiveDropdownSearchMultiSelection<User, User>(
                formControlName: item.fieldId,
                decoration: InputDecoration(
                  hintText: 'placeholder_select'.tr,
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.fromLTRB(12, 0, 0, 0),
                ),
                showClearButton: true,
                popupTitle: Container(
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(
                        width: 0.5, //宽度
                        color: Get.theme.dividerColor, //边框颜色
                      ),
                    ),
                  ),
                  child: Text(
                    ts.Translations.trans(item.fieldName),
                    style: TextStyle(fontSize: 20),
                  ),
                  padding: EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                ),
                showSearchBox: true,
                emptyBuilder: (context, value) {
                  return NotFoundWidget();
                },
                mode: Mode.BOTTOM_SHEET,
                items: _vm.userMap[item.userGroupId],
                itemAsString: (a) {
                  return a.userName;
                },
                onPopupDismissed: () {
                  if (i < _vm.fields.length - 1) {
                    this._vm.form.focus(_vm.fields[i + 1].fieldId);
                  }
                },
                validationMessages: (control) => {
                  'required': 'info_check_required'.tr,
                },
              ),
            ),
          );

          break;
        case 'options':
          _items.add(
            ListTile(
              dense: true,
              leading: Text.rich(
                TextSpan(children: [
                  TextSpan(text: (item.isRequired == true ? '*' : ''), style: TextStyle(color: Colors.red)),
                  TextSpan(
                    text: ts.Translations.trans(item.fieldName),
                  ),
                  TextSpan(
                    text: ":",
                  ),
                ]),
                textAlign: TextAlign.start,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          );

          _items.add(
            InkWell(
              onTap: () {
                this._vm.focusItem = item;
              },
              child: ReactiveDropdownSearch<Option, Option>(
                formControlName: item.fieldId,
                decoration: InputDecoration(
                  hintText: 'placeholder_select'.tr,
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.fromLTRB(12, 0, 0, 0),
                ),
                popupTitle: Container(
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(
                        width: 0.5, //宽度
                        color: Get.theme.dividerColor, //边框颜色
                      ),
                    ),
                  ),
                  child: Text(
                    ts.Translations.trans(item.fieldName),
                    style: TextStyle(fontSize: 20),
                  ),
                  padding: EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                ),
                showSearchBox: true,
                emptyBuilder: (context, value) {
                  return NotFoundWidget();
                },
                showClearButton: true,
                mode: Mode.BOTTOM_SHEET,
                items: _vm.optionMap[item.optionId],
                itemAsString: (a) {
                  return ts.Translations.trans(a.optionLabel);
                },
                onPopupDismissed: () {
                  if (i < _vm.fields.length - 1) {
                    this._vm.form.focus(_vm.fields[i + 1].fieldId);
                  }
                },
                validationMessages: (control) => {
                  'required': 'info_check_required'.tr,
                },
              ),
            ),
          );

          break;
        case 'date':
          _items.add(
            ListTile(
              dense: true,
              leading: Text.rich(
                TextSpan(children: [
                  TextSpan(text: (item.isRequired == true ? '*' : ''), style: TextStyle(color: Colors.red)),
                  TextSpan(
                    text: ts.Translations.trans(item.fieldName),
                  ),
                  TextSpan(
                    text: ":",
                  ),
                ]),
                textAlign: TextAlign.start,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          );
          _items.add(
            InkWell(
              onTap: () {
                this._vm.focusItem = item;
              },
              child: ReactiveDateTimePicker(
                formControlName: item.fieldId,
                decoration: InputDecoration(
                  hintText: 'placeholder_select'.tr,
                  border: InputBorder.none,
                  suffixIcon: Icon(Icons.calendar_today),
                  contentPadding: EdgeInsets.fromLTRB(12, 12, 0, 0),
                ),
                showClearIcon: true,
                validationMessages: (control) => {
                  'required': 'info_check_required'.tr,
                },
              ),
            ),
          );

          break;
        case 'time':
          _items.add(
            ListTile(
              dense: true,
              leading: Text.rich(
                TextSpan(children: [
                  TextSpan(text: (item.isRequired == true ? '*' : ''), style: TextStyle(color: Colors.red)),
                  TextSpan(
                    text: ts.Translations.trans(item.fieldName),
                  ),
                  TextSpan(
                    text: ":",
                  ),
                ]),
                textAlign: TextAlign.start,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          );
          _items.add(
            InkWell(
              onTap: () {
                this._vm.focusItem = item;
              },
              child: ReactiveDateTimePicker(
                formControlName: item.fieldId,
                type: ReactiveDatePickerFieldType.time,
                decoration: InputDecoration(
                  hintText: 'placeholder_select'.tr,
                  border: InputBorder.none,
                  suffixIcon: Icon(Icons.calendar_today),
                  contentPadding: EdgeInsets.fromLTRB(12, 12, 0, 0),
                ),
                showClearIcon: true,
                validationMessages: (control) => {
                  'required': 'info_check_required'.tr,
                },
              ),
            ),
          );
          break;
        case 'lookup':
          _items.add(
            ListTile(
              dense: true,
              leading: Text.rich(
                TextSpan(children: [
                  TextSpan(text: (item.isRequired == true ? '*' : ''), style: TextStyle(color: Colors.red)),
                  TextSpan(
                    text: ts.Translations.trans(item.fieldName),
                  ),
                  TextSpan(
                    text: ":",
                  ),
                ]),
                textAlign: TextAlign.start,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          );

          _items.add(
            InkWell(
              onTap: () {
                this._vm.focusItem = item;
              },
              child: ReactiveDropDownDialog<Item, Item>(
                formControlName: item.fieldId,
                decoration: InputDecoration(
                  hintText: 'placeholder_select'.tr,
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.only(left: 12),
                ),
                conditionGen: () {
                  List<Field> fields = _vm.lookupFields[item.lookupDatastoreId];
                  fields.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
                  if (fields.length > 5) {
                    fields = fields.sublist(0, 5);
                  }
                  List<DropdownCondition> conditions = [];

                  fields.forEach((f) {
                    conditions.add(DropdownCondition(f.fieldId, ts.Translations.trans(f.fieldName), f.fieldType, '=', ''));
                  });

                  return conditions;
                },
                onSearch: (cd) async {
                  List<SearchCondition> conditions = [];
                  conditions.add(SearchCondition(
                    fieldId: cd.key,
                    fieldType: cd.dataType,
                    searchOperator: cd.operator,
                    searchValue: cd.value,
                    isDynamic: true,
                  ));

                  final items = await ApiService.getItems(item.lookupDatastoreId, conditions: conditions, index: 1, size: 100);
                  if (items != null) {
                    return items.itemsList ?? [];
                  }
                  return [];
                },
                onInit: () async {
                  final items = await ApiService.getItems(item.lookupDatastoreId, conditions: [], index: 1, size: 100);
                  if (items != null) {
                    return items.itemsList ?? [];
                  }
                  return [];
                },
                onChanged: (value) {
                  _vm.relations.forEach((rat) {
                    if (rat.datastoreId == item.lookupDatastoreId) {
                      rat.fields.forEach((ratKey, localKey) {
                        if (item.fieldId == localKey && item.lookupFieldId == ratKey) {
                          rat.fields.forEach((k, v) {
                            if (v != item.fieldId) {
                              _vm.form.controls[v].value = value;
                            }
                          });
                        }
                      });
                    }
                  });
                },
                compareFn: (item, selectedItem) {
                  if (item != null) {
                    return item.itemId == selectedItem.itemId;
                  }
                  return false;
                },
                itemAsString: (it) {
                  return it.items[item.lookupFieldId].value;
                },
                itemBuilder: (context, it, isSelected) {
                  return ItemView(
                    isSelected: isSelected,
                    datastoreId: item.lookupDatastoreId,
                    fields: _vm.lookupFields[item.lookupDatastoreId],
                    items: it.items,
                  );
                },
                validationMessages: (control) => {
                  'required': 'info_check_required'.tr,
                },
              ),
            ),
          );
          break;
        case 'switch':
          _items.add(
            ListTile(
              dense: true,
              title: Text.rich(
                TextSpan(children: [
                  TextSpan(text: (item.isRequired == true ? '*' : ''), style: TextStyle(color: Colors.red)),
                  TextSpan(
                    text: ts.Translations.trans(item.fieldName),
                  ),
                  TextSpan(
                    text: ":",
                  ),
                ]),
                textAlign: TextAlign.start,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          );
          _items.add(
            ReactiveAdvancedSwitch<bool>(
              formControlName: item.fieldId,
              decoration: InputDecoration(
                border: InputBorder.none,
                contentPadding: EdgeInsets.fromLTRB(12, 0, 0, 0),
              ),
            ),
          );
          break;
        default:
          break;
      }
    }

    return Container(
      child: ReactiveForm(
        formGroup: this._vm.form,
        child: Column(
          children: [
            NetWorkCheck(),
            Expanded(
              child: ListView.separated(
                itemBuilder: (context, index) {
                  return _items[index];
                },
                separatorBuilder: (context, index) {
                  if (index % 2 == 0) {
                    return Container();
                  }
                  return Divider(
                    height: 1,
                  );
                },
                itemCount: _items.length,
              ),
            ),
            ReactiveFormConsumer(
              builder: (context, form, child) {
                return Container(
                  height: 90,
                  width: double.infinity,
                  padding: EdgeInsets.symmetric(vertical: 20, horizontal: 16),
                  child: ElevatedButton(
                    child: Text('button_save'.tr),
                    onPressed: form.valid
                        ? () async {
                            await _vm.submit(form.value);
                          }
                        : null,
                  ),
                );
              },
            ),
          ],
        ),
      ),
      // bottomSheet: MySubmitButton(),
    );
  }
}
