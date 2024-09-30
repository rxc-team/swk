import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart';
import '../logger.dart';

class BaseViewModel extends ChangeNotifier {
  String _title;
  bool _busy;
  Logger log;
  bool _isDisposed = false;
  String _msg ='';
  bool _loading;
  bool _isEmpty = false;

  BaseViewModel({
    bool busy = false,
    String title,
  })  : _busy = busy,
        _title = title {
    log = getLogger(title ?? this.runtimeType.toString());
  }

  bool get busy => this._busy;
  bool get isDisposed => this._isDisposed;
  String get title => _title ?? this.runtimeType.toString();

  set busy(bool busy) {
    log.i(
      'busy: '
      '$title is entering '
      '${busy ? 'busy' : 'free'} state',
    );
    this._busy = busy;
    notifyListeners();
  }

  String get message => this._msg;
  set message(String value) {
    this._msg = value;
    notifyListeners();
  }

  bool get loading => this._loading;
  set loading(bool value) {
    this._loading = value;
    notifyListeners();
  }

  bool get isEmpty => this._isEmpty;
  set isEmpty(bool value) {
    this._isEmpty = value;
    notifyListeners();
  }

  @override
  void notifyListeners() {
    if (!isDisposed) {
      super.notifyListeners();
    } else {
      log.w('notifyListeners: Notify listeners called after '
          '${title ?? this.runtimeType.toString()} has been disposed');
    }
  }

  @override
  void dispose() {
    log.i('dispose');
    _isDisposed = true;
    super.dispose();
  }
}
