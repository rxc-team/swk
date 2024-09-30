import 'package:sp_util/sp_util.dart';

class Setting {
  static final Setting singleton = Setting._internal();

  // 服务器地址
  static final String _defaultServerHost = "https://api.propluspit.com";
  // 文件服务器地址
  static final String _defaultFileServerHost = "https://file.propluspit.com";

  factory Setting() {
    return singleton;
  }

  Setting._internal();
  // 服务器环境设置
  String serverEnv;
  // 服务器地址
  String serverHost;
  // 文件服务器地址
  String fileServerHost;
  // 扫描台账ID
  String scanDatastore = '';
  // 扫描图片使用的字段
  String scanField = '';
  // 当前台账ID
  String currentDatastore = '';
  // 是否可以盘点
  bool canCheck = false;
  // 是否是扫描枪
  String scanDivice = 'camera';
  // 显示图片
  bool showImage = true;
  // 扫描后是否显示详细情报
  bool showDetail = true;
  // 扫描后是否显示详细情报
  int listLine = 10;

  void setServerHost(String host) {
    this.serverHost = host;
    SpUtil.putString("host", this.serverHost);
  }

  void setServerEnv(String env) {
    this.serverEnv = env;
    SpUtil.putString("env", this.serverEnv);
  }

  void setFileServerHost(String fileHost) {
    this.fileServerHost = fileHost;
    SpUtil.putString("file_host", this.fileServerHost);
  }

  void setScanDatastore(String datastoreID) {
    this.scanDatastore = datastoreID;
    SpUtil.putString("scan_datastore", this.scanDatastore);
  }

  void setScanField(String f) {
    this.scanField = f;
    SpUtil.putString("scan_field", this.scanField);
  }

  void setCurrentDatastore(String datastoreID, bool canCheck) {
    this.currentDatastore = datastoreID;
    this.canCheck = canCheck;
    SpUtil.putString("current_datastore", this.currentDatastore);
    SpUtil.putBool("can_check", this.canCheck);
  }

  void setScanDivice(String scanDivice) {
    this.scanDivice = scanDivice;
    SpUtil.putString("scan_divice", this.scanDivice);
  }

  void setShowImage(bool showImage) {
    this.showImage = showImage;
    SpUtil.putBool("show_image", this.showImage);
  }

  void setShowDetail(bool showDetail) {
    this.showDetail = showDetail;
    SpUtil.putBool("show_detail", this.showDetail);
  }

  void setListLine(int listLine) {
    this.listLine = listLine;
    SpUtil.putInt("list_line", this.listLine);
  }

  String getServerHost() {
    var host = SpUtil.getString("host", defValue: _defaultServerHost);
    this.serverHost = host;
    return this.serverHost;
  }

  String getServerEnv() {
    var env = SpUtil.getString("env", defValue: "prod");
    this.serverEnv = env;
    return this.serverEnv;
  }

  String getFileServerHost() {
    var host = SpUtil.getString("file_host", defValue: _defaultFileServerHost);
    this.fileServerHost = host;
    return this.fileServerHost;
  }

  String getScanDatastore() {
    this.scanDatastore = SpUtil.getString("scan_datastore");
    return this.scanDatastore;
  }

  String getScanField() {
    this.scanField = SpUtil.getString("scan_field");
    return this.scanField;
  }

  void getCurrentDatastore() {
    this.currentDatastore = SpUtil.getString("current_datastore", defValue: "");
    this.canCheck = SpUtil.getBool("can_check", defValue: false);
  }

  bool getShowImage() {
    var showImage = SpUtil.getBool("show_image", defValue: false);
    this.showImage = showImage;
    return this.showImage;
  }

  String getScanDivice() {
    this.scanDivice = SpUtil.getString("scan_divice", defValue: "camera");
    return this.scanDivice;
  }

  bool getShowDetail() {
    this.showDetail = SpUtil.getBool("show_detail", defValue: false);
    return this.showDetail;
  }

  int getListLine() {
    this.listLine = SpUtil.getInt("list_line", defValue: 10);
    return this.listLine;
  }

  void clearSetting() {
    this.scanDatastore = null;
    this.currentDatastore = null;
    this.listLine = 10;
    this.canCheck = false;
    this.scanDivice = 'camera';
    this.showImage = true;
    this.showDetail = true;
    clearSettingInfo();
  }

  clearSettingInfo() async {
    SpUtil.putString("scan_datastore", '');
    SpUtil.putString("current_datastore", '');
    SpUtil.putString("scan_divice", 'camera');
    SpUtil.putBool("can_check", false);
    SpUtil.putBool("show_image", true);
    SpUtil.putBool("show_detail", true);
    SpUtil.putInt("list_line", 10);
  }

  String buildFileURL(String url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return this.fileServerHost + url.substring(8);
  }
}
