part of mutil_scan_view;

class _MutilScanMobile extends StatefulWidget {
  final MutilScanViewModel viewModel;
  _MutilScanMobile(this.viewModel, {Key key}) : super(key: key);

  @override
  __MutilScanMobileState createState() => __MutilScanMobileState();
}

class __MutilScanMobileState extends State<_MutilScanMobile> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'Mutil-QR');
  MutilScanViewModel _vm;

  @override
  void initState() {
    super.initState();
    _vm = widget.viewModel;
  }

  @override
  void dispose() {
    super.dispose();
    _vm.close();
  }

  @override
  void reassemble() {
    super.reassemble();
    if (Platform.isAndroid) {
      _vm.pauseCamera();
    } else if (Platform.isIOS) {
      _vm.resumeCamera();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        centerTitle: true,
        title: Text('scan_mutil_btn'.tr),
      ),
      body: _body(),
    );
  }

  Widget _body() {
    if (_vm.scanDivice == 'gun') {
      return Column(
        children: <Widget>[
          Expanded(
            child: Container(
              color: Colors.grey.shade300,
              child: Column(
                children: <Widget>[
                  TextField(
                    autofocus: true,
                    readOnly: true,
                    controller: _vm.editingController,
                    onChanged: (value) => _vm.onGunScan(value),
                  ),
                  Expanded(
                      child: Container(
                    child: ListView.separated(
                      separatorBuilder: (BuildContext context, int index) {
                        return Container(
                          height: 1.0,
                          color: Colors.grey.shade300,
                        );
                      },
                      itemBuilder: (context, index) {
                        var data = _vm.scanData.toList();
                        return ListTile(
                          title: Text('${(index + 1)}. ${data[index]}'),
                          trailing: OutlinedButton(
                            child: Text('button_clear'.tr),
                            onPressed: () => _vm.remove(data[index]),
                          ),
                        );
                      },
                      itemCount: _vm.scanData.length,
                    ),
                    color: Colors.white,
                  ))
                ],
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Colors.transparent,
              borderRadius: BorderRadius.circular(100.0),
            ),
            padding: EdgeInsets.all(8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
                Expanded(
                  child: Container(
                    alignment: Alignment.center,
                    child: Text('${_vm.scanData.length}/99999'),
                  ),
                ),
                Padding(
                  padding: EdgeInsets.all(2),
                  child: OutlinedButton(
                    child: Text('button_cancle'.tr),
                    onPressed: _vm.cancel,
                  ),
                ),
                Padding(
                  padding: EdgeInsets.all(2),
                  child: ElevatedButton(
                    child: Text('button_ok'.tr),
                    onPressed: _vm.ok,
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    }

    return Container(
      child: Column(
        children: <Widget>[
          Expanded(
            child: Container(
              child: QRView(
                key: qrKey,
                onQRViewCreated: (QRViewController controller) {
                  _vm.onQRViewCreated(controller);
                },
                overlay: QrScannerOverlayShape(
                  borderColor: Color(0xFF00FF00),
                  overlayColor: Color(0x809E9E9E),
                  borderRadius: 0,
                  borderLength: 10,
                  borderWidth: 10,
                  cutOutSize: 200,
                ),
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Colors.transparent,
              borderRadius: BorderRadius.circular(100.0),
            ),
            padding: EdgeInsets.all(8),
            child: Row(
              children: <Widget>[
                IconButton(
                  onPressed: _vm.taggleFlash,
                  icon: Icon(
                    Icons.flash_on_outlined,
                    color: _vm.flashState ? Colors.red : Colors.grey,
                  ),
                ),
                Expanded(
                  child: Container(
                    alignment: Alignment.center,
                    child: Text('${_vm.scanData.length}/99999'),
                  ),
                ),
                Padding(
                  padding: EdgeInsets.all(2),
                  child: OutlinedButton(
                    child: Text('button_cancle'.tr),
                    onPressed: _vm.cancel,
                  ),
                ),
                Padding(
                  padding: EdgeInsets.all(2),
                  child: ElevatedButton(
                    child: Text('button_ok'.tr),
                    onPressed: _vm.ok,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
