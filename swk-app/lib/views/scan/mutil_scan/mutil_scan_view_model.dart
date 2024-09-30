import 'package:flutter/material.dart';
import 'package:pit3_app/common/setting.dart';
import 'package:pit3_app/core/base/base_view_model.dart';
import 'package:pit3_app/core/locator.dart';
import 'package:pit3_app/core/services/navigator_service.dart';
import 'package:pit3_app/views/scan/scan_handle/scan_handle_view.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';

class MutilScanViewModel extends BaseViewModel {
  final _nav = locator.get<NavigatorService>();
  QRViewController _scanController;
  TextEditingController _editingController;
  bool _flashState;
  Set<String> _scanData;
  String _scanDivice;

  String get scanDivice => this._scanDivice;
  set scanDivice(String value) {
    this._scanDivice = value;
    notifyListeners();
  }

  QRViewController get controller => this._scanController;
  set controller(QRViewController value) {
    this._scanController = value;
    notifyListeners();
  }

  TextEditingController get editingController => this._editingController;
  set editingController(TextEditingController value) {
    this._editingController = value;
    notifyListeners();
  }

  bool get flashState => this._flashState;
  set flashState(bool value) {
    this._flashState = value;
    notifyListeners();
  }

  Set<String> get scanData => this._scanData;
  set scanData(Set<String> value) {
    this._scanData = value;
    notifyListeners();
  }

  MutilScanViewModel();

  init() {
    this.flashState = false;
    this.scanData = Set();
    this.scanDivice = Setting.singleton.scanDivice;
    this.editingController = TextEditingController();
  }

  taggleFlash() {
    if (controller != null) {
      controller.toggleFlash();
      this.flashState = !this.flashState;
    }
  }

  close() {
    if (this.controller != null) {
      this.controller.dispose();
    }
  }

  onQRViewCreated(
    QRViewController controller,
  ) async {
    this.controller = controller;
    controller.scannedDataStream.listen((data) {
      if (data.code.isNotEmpty) {
        // 某些机器上出现无法重启相机导致卡死的情况，因此注释掉该代码。
        // this.controller.pauseCamera();
        this.scanData.add(data.code);
        this.scanData = this.scanData;
        // Future.delayed(Duration(milliseconds: 500), () {
        //   this.controller.resumeCamera();
        // });
      }
    });
  }

  onScan(String value) {
    this.scanData.add(value);
    this.scanData = this.scanData;
    this.editingController.clear();
  }

  onGunScan(String value) {
    if (value.endsWith('\n')) {
      this.scanData.add(value.replaceAll('\n', ''));
      this.scanData = this.scanData;
      this.editingController.clear();
    }
  }

  remove(String value) {
    this.scanData.remove(value);
    this.scanData = this.scanData;
  }

  cancel() {
    _nav.pop();
  }

  ok() async {
    this.controller.pauseCamera();
    List<String> result = await _nav.navigateToPage(MaterialPageRoute(
      builder: (context) => ScanHandleView(
        this.scanData.toList(),
      ),
    ));

    if (this.controller != null) {
      this.controller.resumeCamera();
    }

    this.scanData.clear();
    this.scanData.addAll(result);

    this.scanData = this.scanData;
  }

  pauseCamera() {
    controller.pauseCamera();
  }

  resumeCamera() {
    controller.resumeCamera();
  }
  // Add ViewModel specific code here
}
