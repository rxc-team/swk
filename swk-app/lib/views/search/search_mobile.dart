part of search_view;

class _SearchMobile extends StatefulWidget {
  final SearchViewModel viewModel;
  _SearchMobile(this.viewModel, {Key key}) : super(key: key);

  @override
  __SearchMobileState createState() => __SearchMobileState();
}

class __SearchMobileState extends State<_SearchMobile> {
  SearchViewModel _vm;

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
        title: Text('search_title'.tr),
        actions: <Widget>[
          IconButton(
            onPressed: _vm.refresh,
            icon: Icon(Icons.search),
          ),
        ],
      ),
      body: _body(),
    );
  }

  Widget _body() {
    if (_vm.loading) {
      return LoadingIndicator(msg: 'loading'.tr);
    }
    if (_vm.isEmpty) {
      return EmptyWidget();
    }

    return Container(
      child: Column(
        children: [
          ListTile(
            title: Text(
              'search_type'.tr,
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            subtitle: Text('AND / OR'),
            trailing: CupertinoSwitch(
              activeColor: Get.theme.primaryColor,
              value: _vm.searchType,
              onChanged: (v) {
                _vm.changeSearchType(v);
              },
            ),
          ),
          Divider(
            height: 1,
          ),
          ListTile(
            title: Text(
              'search_list_title'.tr,
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            trailing: ElevatedButton(
              onPressed: () async {
                SearchCondition result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (BuildContext context) => SearchSelectDialog(
                      lookupFields: this._vm.lookupFields,
                      fieldOptions: this._vm.fields,
                      optionMap: this._vm.optionMap,
                      userMap: this._vm.userMap,
                    ),
                    fullscreenDialog: true,
                  ),
                );

                if (result != null) {
                  this._vm.add(result);
                }
              },
              child: Icon(Icons.add),
            ),
          ),
          Divider(
            height: 1,
          ),
          Expanded(
            child: ListView.separated(
                itemBuilder: (context, index) {
                  SearchCondition item = _vm.conditions[index];
                  return ListTile(
                    title: Row(
                      children: [
                        Container(
                          width: 100,
                          height: 35,
                          decoration: BoxDecoration(
                            border: Border.all(
                              width: 1,
                              color: Get.theme.dividerColor,
                            ),
                            borderRadius: BorderRadius.all(
                              Radius.circular(4.0),
                            ),
                          ),
                          padding: EdgeInsets.symmetric(horizontal: 4),
                          alignment: Alignment.centerLeft,
                          child: Text(
                            item.isDynamic ? ts.Translations.trans(item.fieldName) : item.fieldName,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                        SizedBox(
                          width: 4,
                        ),
                        OutlinedButton(
                          onPressed: () {},
                          child: Text(
                            '${item.searchOperator}',
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.left,
                            style: TextStyle(
                              fontSize: 16,
                            ),
                          ),
                        ),
                        SizedBox(
                          width: 4,
                        ),
                        Expanded(
                          child: Container(
                            height: 35,
                            decoration: BoxDecoration(
                              color: Get.theme.cardColor,
                              border: Border.all(
                                width: 1,
                                color: Get.theme.dividerColor,
                              ),
                              borderRadius: BorderRadius.all(
                                Radius.circular(4.0),
                              ),
                            ),
                            padding: EdgeInsets.symmetric(horizontal: 4),
                            alignment: Alignment.centerLeft,
                            child: Text(
                              '${_vm.getValue(item)}',
                              overflow: TextOverflow.ellipsis,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 16,
                              ),
                            ),
                          ),
                        )
                      ],
                    ),
                    trailing: IconButton(
                      icon: Icon(
                        Icons.close_rounded,
                        color: Colors.red,
                      ),
                      onPressed: () => _vm.remove(item.id),
                    ),
                    onLongPress: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute<void>(
                          builder: (BuildContext context) => ItemPreviewDialog(
                            field: item.isDynamic ? ts.Translations.trans(item.fieldName) : item.fieldName,
                            operator: item.searchOperator,
                            value: _vm.getValue(item),
                          ),
                          fullscreenDialog: true,
                        ),
                      );
                    },
                  );
                },
                separatorBuilder: (context, index) {
                  return Divider(
                    height: 1,
                    color: Get.theme.dividerColor,
                  );
                },
                itemCount: _vm.conditions.length),
          ),
        ],
      ),
    );
  }
}
