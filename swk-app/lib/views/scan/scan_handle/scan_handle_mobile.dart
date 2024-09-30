part of scan_handle_view;

class _ScanHandleMobile extends StatefulWidget {
  final ScanHandleViewModel viewModel;

  _ScanHandleMobile(this.viewModel, {Key key}) : super(key: key);

  @override
  __ScanHandleMobileState createState() => __ScanHandleMobileState();
}

class __ScanHandleMobileState extends State<_ScanHandleMobile> {
  ScanHandleViewModel _vm;

  @override
  void initState() {
    super.initState();
    _vm = widget.viewModel;
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      child: Scaffold(
        appBar: AppBar(
          elevation: 0,
          centerTitle: true,
          leading: BackButton(onPressed: () => {this._vm.pop()}),
          title: Text('scan_title'.tr),
          actions: <Widget>[
            IconButton(
              icon: Icon(
                Icons.playlist_add_check,
                size: 30,
              ),
              onPressed: () => _vm.mutilScan(context),
            )
          ],
        ),
        body: Container(
            child: Column(
          children: [
            NetWorkCheck(),
            Expanded(
              child: ListView.separated(
                separatorBuilder: (BuildContext context, int index) {
                  return Divider(
                    height: 1.0,
                    color: Get.theme.dividerColor,
                  );
                },
                itemBuilder: (BuildContext context, int index) {
                  return Container(
                    padding: EdgeInsets.all(8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: <Widget>[
                        Expanded(
                          child: Column(
                            children: <Widget>[
                              Container(
                                alignment: Alignment.centerLeft,
                                child: Text(
                                  _vm.scanData[index].value,
                                ),
                              ),
                              Container(
                                alignment: Alignment.centerLeft,
                                child: Text(
                                  _vm.scanData[index].errorMsg,
                                  style: TextStyle(
                                    color: Colors.red,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Padding(
                          padding: EdgeInsets.all(2),
                          child: MaterialButton(
                            elevation: 0,
                            textColor: Colors.white,
                            child: Text(
                              _vm.getStatusName(_vm.scanData[index].status, context),
                            ),
                            color: _vm.scanData[index].status == '4' ? Colors.redAccent : Colors.green,
                            disabledColor: _vm.scanData[index].status == '4' ? Colors.redAccent : Colors.green,
                            disabledTextColor: Colors.white,
                            onPressed: _vm.scanData[index].status == '1'
                                ? () {
                                    _vm.scan(context, index);
                                  }
                                : null,
                          ),
                        ),
                      ],
                    ),
                  );
                },
                itemCount: _vm.scanData.length,
              ),
            ),
          ],
        )),
      ),
      onWillPop: () async {
        this._vm.pop();
        return false;
      },
    );
  }
}
