part of item_list_view;

class _ItemListMobile extends StatefulWidget {
  final ItemListViewModel viewModel;
  _ItemListMobile(this.viewModel, {Key key}) : super(key: key);

  @override
  __ItemListMobileState createState() => __ItemListMobileState();
}

class __ItemListMobileState extends State<_ItemListMobile> {
  ItemListViewModel _viewModel;

  @override
  void initState() {
    super.initState();
    _viewModel = widget.viewModel;
    _viewModel.scrollController.addListener(() {
      if (_viewModel.scrollController.position.pixels == _viewModel.scrollController.position.maxScrollExtent) {
        _viewModel.loadMore();
      }
    });
    eventBus.on<ShowImageEvent>().listen((event) {
      _viewModel.refresh();
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
      body: EasyRefresh(
        onLoad: () => _viewModel.loadMore(),
        onRefresh: () => _viewModel.refresh(),
        child: ListView.separated(
          separatorBuilder: (BuildContext context, int index) {
            return Divider(
              height: 1,
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
      floatingActionButton: _viewModel.showCheck
          ? FloatingActionButton(
              onPressed: () {
                _viewModel.inventory(context);
              },
              child: Text('button_check'.tr),
            )
          : null,
    );
  }

  Widget _renderRow(BuildContext context, int index) {
    if (index < _viewModel.items.length) {
      return Material(
        child: InkWell(
          onTap: () {
            _viewModel.click(index);
          },
          onLongPress: _viewModel.change,
          child: Container(
            child: Row(
              children: <Widget>[
                _buildCheckBox(index),
                Expanded(
                  child: Column(
                    children: <Widget>[
                      Container(
                        height: 80,
                        child: Row(
                          children: <Widget>[
                            _buildImage(index),
                            SizedBox(
                              width: 5.0,
                            ),
                            Expanded(
                              child: Container(
                                // height: 88,
                                padding: EdgeInsets.all(0),
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
                      Container(
                        height: 32,
                        padding: EdgeInsets.all(4.0),
                        margin: EdgeInsets.only(bottom: 4.0),
                        decoration: BoxDecoration(
                          shape: BoxShape.rectangle,
                          borderRadius: BorderRadius.circular(2.0),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: <Widget>[
                            Expanded(
                              child: Text(
                                _viewModel.items[index].createdBy,
                              ),
                            ),
                            Text(
                              date.DateUtils.formatDateTime(
                                _viewModel.canCheck ? _viewModel.items[index].checkedAt : _viewModel.items[index].createdAt,
                              ),
                              style: TextStyle(fontSize: 12),
                            ),
                            _buildCheckStatus(_viewModel.items[index].checkStatus)
                          ],
                        ),
                      ),
                    ],
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

  Widget _buildCheckStatus(String checkStatus) {
    if (!_viewModel.canCheck) {
      return Container();
    }
    if (checkStatus == '1') {
      return Icon(
        Icons.check_circle,
        color: Colors.green,
      );
    }

    return Icon(
      Icons.warning,
      color: Colors.orange,
    );
  }

  Widget _buildNetImage(String url) {
    return new Container(
      width: 74,
      height: 60,
      decoration: BoxDecoration(
        shape: BoxShape.rectangle,
        border: Border.all(color: Colors.grey.shade100, width: 1.0, style: BorderStyle.solid),
        borderRadius: BorderRadius.circular(2.0),
        image: DecorationImage(image: ExtendedNetworkImageProvider(url), fit: BoxFit.cover),
      ),
    );
  }

  Widget _buildCheckBox(int index) {
    if (_viewModel.showCheck) {
      return Checkbox(
        checkColor: Colors.white,
        activeColor: Colors.green,
        onChanged: (value) {
          _viewModel.check(index, value);
        },
        value: _viewModel.checkItems[index].checked,
      );
    }

    return Container(
      height: 0,
    );
  }

  Widget _buildAssetImage(String url) {
    return Container(
      width: 74,
      height: 60,
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
      return Container();
    }

    var item = _viewModel.items[index];
    if (!item.items.containsKey(_viewModel.checkField)) {
      return Container(
        width: 74,
        height: 60,
        child: _buildAssetImage('images/no_image.png'),
      );
    }
    List<dynamic> images = json.decode(
      item.items[_viewModel.checkField].value,
    );
    if (images == null || images.length == 0) {
      return Container(
        width: 74,
        height: 60,
        child: _buildAssetImage('images/no_image.png'),
      );
    }

    List<FileItem> imageList = [];
    for (var f in images) {
      imageList.add(FileItem(f['url'], f['name']));
    }

    return Container(
      width: 74,
      height: 60,
      child: _buildNetImage(Setting().buildFileURL(
        imageList[imageList.length - 1].url,
      )),
    );
  }

  Widget _buildRow(Map<String, items.Value> items) {
    List<Widget> _items = [];

    List<DynamicItem> dynamicItems = _viewModel.buildItems(items);

    if (dynamicItems.length > 3) {
      dynamicItems = dynamicItems.sublist(0, 3);
    }

    dynamicItems.forEach((item) {
      var value = Common.getValue(item.value, dataType: item.fieldType);

      switch (item.fieldType) {
        case 'options':
          _items.add(
            Row(
              children: [
                Container(
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
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    ts.Translations.trans(value),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
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
              Row(
                children: [
                  Container(
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
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Expanded(
                    child: Text(
                      valStr,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
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
              Row(
                children: [
                  Container(
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
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Expanded(
                    child: Text(
                      valStr,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            );
          }
          break;
        case 'lookup':
          _items.add(
            Row(
              children: [
                Container(
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
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    value,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          );
          break;
        case 'switch':
          _items.add(
            Row(
              children: [
                Container(
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
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    value.toString(),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          );
          break;
        case 'date':
          _items.add(
            Row(
              children: [
                Container(
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
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    value == ""
                        ? ""
                        : DateUtil.formatDateStr(
                            value,
                            format: 'yyyy-MM-dd',
                          ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          );
          break;
        case 'time':
          _items.add(
            Row(
              children: [
                Container(
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
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    value,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          );
          break;
        case 'text':
        case 'textarea':
          _items.add(
            Row(
              children: [
                Container(
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
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    value,
                    overflow: TextOverflow.ellipsis,
                  ),
                )
              ],
            ),
          );
          break;
        case 'number':
          _items.add(
            Row(
              children: [
                Container(
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
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    NumberUtil.numberFormat(value, precision: item.precision),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          );
          break;
        case 'autonum':
          _items.add(
            Row(
              children: [
                Container(
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
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    value,
                    overflow: TextOverflow.ellipsis,
                  ),
                )
              ],
            ),
          );
          break;
        case 'function':
          _items.add(
            Row(
              children: [
                Container(
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
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Expanded(
                  child: Text(
                    value,
                    overflow: TextOverflow.ellipsis,
                  ),
                )
              ],
            ),
          );
          break;
        default:
          break;
      }
    });

    return Container(
      height: 80,
      padding: EdgeInsets.symmetric(vertical: 5.0),
      alignment: Alignment.topLeft,
      child: Column(
        children: _items,
      ),
    );
  }
}
