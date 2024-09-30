part of scan_list_view;

class _ScanListMobile extends StatefulWidget {
  final ScanListViewModel viewModel;
  _ScanListMobile(this.viewModel, {Key key}) : super(key: key);

  @override
  __ScanListMobileState createState() => __ScanListMobileState();
}

class __ScanListMobileState extends State<_ScanListMobile> {
  ScanListViewModel _viewModel;

  @override
  void initState() {
    super.initState();
    _viewModel = widget.viewModel;
    _viewModel.scrollController.addListener(() {
      if (_viewModel.scrollController.position.pixels == _viewModel.scrollController.position.maxScrollExtent) {
        _viewModel.loadMore();
      }
    });
  }

  @override
  void dispose() {
    super.dispose();
    _viewModel.close();
  }

  @override
  Widget build(BuildContext context) {
    return _viewModel.loading ? LoadingIndicator(msg: 'loading'.tr) : _body();
  }

  Widget _body() {
    if (_viewModel.isEmpty) {
      return DatastoreDataEmpty();
    }

    return Scaffold(
        appBar: AppBar(
          elevation: 0,
          centerTitle: true,
          title: Text('scan_result_title'.tr),
        ),
        body: Container(
          child: Column(
            children: [
              NetWorkCheck(),
              Container(
                height: 50,
                padding: EdgeInsets.only(top: 10),
                width: double.infinity,
                color: Colors.grey.shade300,
                child: Text(
                  'scan_mutil_tips'.trParams({
                    'total': _viewModel.total.toString(),
                    'selected': _viewModel.checkItems.where((e) => e.checked == true).length.toString(),
                  }),
                  style: TextStyle(
                    color: Colors.red,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              Expanded(
                child: EasyRefresh(
                  onLoad: () => _viewModel.loadMore(),
                  onRefresh: () => _viewModel.refresh(),
                  child: ListView.separated(
                    padding: EdgeInsets.only(top: 2.0, bottom: 4.0),
                    separatorBuilder: (BuildContext context, int index) {
                      return Container(
                        height: 1.0,
                        color: Colors.grey.shade300,
                      );
                    },
                    itemBuilder: (BuildContext context, int index) {
                      return _renderRow(context, index);
                    },
                    physics: AlwaysScrollableScrollPhysics(),
                    controller: _viewModel.scrollController,
                    itemCount: _viewModel.items.length,
                  ),
                ),
              ),
              Container(
                height: 60,
                color: Colors.grey.shade300,
                padding: EdgeInsets.only(left: 32, right: 32),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    ElevatedButton(
                      child: Text('button_check'.tr),
                      onPressed: () {
                        _viewModel.inventory(context);
                      },
                    ),
                    Expanded(
                      child: Container(),
                    ),
                    OutlinedButton(
                      child: Text('button_return'.tr),
                      onPressed: () {
                        _viewModel.cancel();
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ));
  }

  Widget _renderRow(BuildContext context, int index) {
    if (index < _viewModel.items.length) {
      return Material(
        child: InkWell(
          onTap: () {
            _viewModel.click(index);
          },
          child: Container(
            child: Row(
              children: <Widget>[
                _buildCheckBox(index),
                Expanded(
                  child: Container(
                    height: 145,
                    child: Row(
                      children: <Widget>[
                        _buildImage(index),
                        SizedBox(
                          width: 5.0,
                        ),
                        Expanded(
                          child: Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.rectangle,
                              borderRadius: BorderRadius.circular(2.0),
                            ),
                            child: _buildRow(_viewModel.items[index].items),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }
    return Container();
  }

  Widget _buildNetImage(String url) {
    return new Container(
      width: 74,
      height: 100,
      decoration: BoxDecoration(
        shape: BoxShape.rectangle,
        border: Border.all(color: Colors.grey.shade100, width: 1.0, style: BorderStyle.solid),
        borderRadius: BorderRadius.circular(2.0),
        image: DecorationImage(image: ExtendedNetworkImageProvider(url), fit: BoxFit.cover),
      ),
    );
  }

  Widget _buildCheckBox(int index) {
    return Checkbox(
      checkColor: Colors.white,
      activeColor: Colors.green,
      onChanged: (value) {
        _viewModel.check(index, value);
      },
      value: _viewModel.checkItems[index].checked,
    );
  }

  Widget _buildAssetImage(String url) {
    return new Container(
      width: 74,
      height: 100,
      decoration: BoxDecoration(
        shape: BoxShape.rectangle,
        borderRadius: BorderRadius.circular(2.0),
        image: DecorationImage(image: AssetImage(url), fit: BoxFit.contain),
      ),
    );
  }

  Widget _buildImage(int index) {
    var show = Setting.singleton.showImage && _viewModel.checkField.isNotEmpty;
    if (!show) {
      return Container(
        width: 74,
        height: 100,
      );
    }

    var item = _viewModel.items[index];
    if (!item.items.containsKey(_viewModel.checkField)) {
      return Container(
        width: 74,
        height: 100,
        child: _buildAssetImage('images/no_image.png'),
      );
    }
    List<dynamic> images = json.decode(
      item.items[_viewModel.checkField].value,
    );
    if (images == null || images.length == 0) {
      return Container(
        width: 74,
        height: 100,
        child: _buildAssetImage('images/no_image.png'),
      );
    }

    List<FileItem> imageList = [];
    for (var f in images) {
      imageList.add(FileItem(f['url'], f['name']));
    }

    return Container(
      width: 74,
      height: 100,
      child: _buildNetImage(Setting().buildFileURL(
        imageList[imageList.length - 1].url,
      )),
    );
  }

  Widget _buildRow(Map<String, items.Value> items) {
    List<Widget> _items = [];

    List<DynamicItem> dynamicItems = _viewModel.buildItems(items);

    dynamicItems.sublist(0, 3).forEach((item) {
      var value = Common.getValue(item.value, dataType: item.fieldType);

      switch (item.fieldType) {
        case 'options':
          _items.add(
            ListTile(
              dense: true,
              leading: Container(
                width: 120,
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: ts.Translations.trans(item.fieldName),
                      ),
                      TextSpan(
                        text: ':',
                      )
                    ],
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              title: Text(
                ts.Translations.trans(value),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          );
          break;
        case 'file':
          String valStr = '';
          if (value is List) {
            for (var item in value) {
              valStr += item.name;
            }
            _items.add(
              ListTile(
                dense: true,
                leading: Container(
                  width: 120,
                  child: Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: ts.Translations.trans(item.fieldName),
                        ),
                        TextSpan(
                          text: ':',
                        )
                      ],
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                title: Text(
                  valStr,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            );
          }
          break;
        case 'user':
          List<dynamic> val = value;
          String valStr = '';
          if (val is List) {
            valStr = val.join(",");
            _items.add(
              ListTile(
                dense: true,
                leading: Container(
                  width: 120,
                  child: Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: ts.Translations.trans(item.fieldName),
                        ),
                        TextSpan(
                          text: ':',
                        )
                      ],
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                title: Text(
                  valStr,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            );
          }
          break;
        case 'lookup':
          _items.add(
            ListTile(
              dense: true,
              leading: Container(
                width: 120,
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: ts.Translations.trans(item.fieldName),
                      ),
                      TextSpan(
                        text: ':',
                      )
                    ],
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              title: Text(
                value,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          );
          break;
        case 'switch':
          _items.add(
            ListTile(
              dense: true,
              leading: Container(
                width: 120,
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: ts.Translations.trans(item.fieldName),
                      ),
                      TextSpan(
                        text: ':',
                      )
                    ],
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              title: Text(
                value.toString(),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          );
          break;
        case 'date':
          _items.add(
            ListTile(
              dense: true,
              leading: Container(
                width: 120,
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: ts.Translations.trans(item.fieldName),
                      ),
                      TextSpan(
                        text: ':',
                      )
                    ],
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              title: Text(
                value == ""
                    ? ""
                    : DateUtil.formatDateStr(
                        value,
                        format: 'yyyy-MM-dd',
                      ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          );
          break;
        case 'time':
          _items.add(
            ListTile(
              dense: true,
              leading: Container(
                width: 120,
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: ts.Translations.trans(item.fieldName),
                      ),
                      TextSpan(
                        text: ':',
                      )
                    ],
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              title: Text(
                value,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          );
          break;
        case 'text':
        case 'textarea':
          _items.add(
            ListTile(
              dense: true,
              leading: Container(
                width: 120,
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: ts.Translations.trans(item.fieldName),
                      ),
                      TextSpan(
                        text: ':',
                      )
                    ],
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              title: Text(
                value,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          );
          break;
        case 'number':
          _items.add(
            ListTile(
              dense: true,
              leading: Container(
                width: 120,
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: ts.Translations.trans(item.fieldName),
                      ),
                      TextSpan(
                        text: ':',
                      )
                    ],
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              title: Text(
                NumberUtil.numberFormat(value, precision: item.precision),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          );
          break;
        case 'autonum':
          _items.add(
            ListTile(
              dense: true,
              leading: Container(
                width: 120,
                child: Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: ts.Translations.trans(item.fieldName),
                      ),
                      TextSpan(
                        text: ':',
                      )
                    ],
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              title: Text(
                value,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          );
          break;
        default:
          break;
      }
    });

    return Container(
      height: 200,
      child: Column(
        children: _items,
      ),
    );
  }
}
