part of single_scan_view;

class _SingleScanMobile extends StatefulWidget {
  final SingleScanViewModel viewModel;
  _SingleScanMobile(this.viewModel, {Key key}) : super(key: key);

  @override
  __SingleScanMobileState createState() => __SingleScanMobileState();
}

class __SingleScanMobileState extends State<_SingleScanMobile> with SingleTickerProviderStateMixin {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');

  SingleScanViewModel _vm;

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

  // @override
  // void reassemble() {
  //   super.reassemble();
  //   if (Platform.isAndroid) {
  //     _vm.pauseCamera();
  //   } else if (Platform.isIOS) {
  //     _vm.resumeCamera();
  //   }
  // }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        centerTitle: true,
        title: Text('scan_single_btn'.tr),
      ),
      body: Container(
        child: Column(
          children: [_resultView(), Expanded(child: _scanView())],
        ),
      ),
    );
  }

  Widget _resultView() {
    if (_vm.scanText.isEmpty) {
      return Container();
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Text(
        _vm.scanText,
        style: TextStyle(
          color: Colors.red,
          fontSize: 20,
        ),
      ),
    );
  }

  Widget _scanView() {
    if (_vm.scanDivice == 'gun') {
      return Column(
        children: <Widget>[
          Expanded(
            child: Container(
              color: Colors.grey.shade300,
              child: TextField(
                autofocus: true,
                readOnly: true,
                onChanged: (value) => _vm.onGunScan(context, value),
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
                Padding(
                  padding: EdgeInsets.all(2),
                  child: OutlinedButton(
                    child: Text('button_cancle'.tr),
                    onPressed: _vm.cancel,
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    }

    return Column(
      children: <Widget>[
        Expanded(
          child: Container(
            child: QRView(
              key: qrKey,
              onQRViewCreated: (QRViewController controller) {
                _vm.onQRViewCreated(context, controller);
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              IconButton(
                onPressed: _vm.taggleFlash,
                icon: Icon(
                  Icons.flash_on_outlined,
                  color: _vm.flashState ? Colors.red : Colors.grey,
                ),
              ),
              Padding(
                padding: EdgeInsets.all(2),
                child: OutlinedButton(
                  child: Text('button_cancle'.tr),
                  onPressed: _vm.cancel,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
