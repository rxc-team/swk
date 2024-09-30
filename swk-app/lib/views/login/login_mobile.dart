part of login_view;

class _LoginMobile extends StatelessWidget {
  final LoginViewModel viewModel;

  _LoginMobile(this.viewModel);

  @override
  Widget build(BuildContext context) {
    Future<bool> _onWillPop() {
      return showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: Text('pop_title'.tr),
              content: Text('pop_tip'.tr),
              actions: <Widget>[
                OutlinedButton(
                  onPressed: () => viewModel.goBack(context, false),
                  child: Text('pop_cancle_btn'.tr),
                ),
                ElevatedButton(
                  onPressed: () => viewModel.goBack(context, true),
                  child: Text('pop_ok_btn'.tr),
                ),
              ],
            ),
          ) ??
          false;
    }

    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        appBar: AppBar(
          elevation: 0,
          centerTitle: true,
          title: Text('login_title'.tr),
          actions: [
            IconButton(
              icon: Icon(
                Icons.translate,
                size: 20,
              ),
              onPressed: () {
                Get.bottomSheet(Material(
                  borderRadius: BorderRadius.all(
                    Radius.circular(10.0),
                  ),
                  child: Container(
                    child: Wrap(
                      children: [
                        ListTile(
                          title: Text(
                            'setting_language_select_title'.tr,
                          ),
                        ),
                        ListTile(
                          title: Row(
                            children: <Widget>[
                              Padding(
                                child: Text('🇨🇳'),
                                padding: EdgeInsets.only(right: 8.0),
                              ),
                              Container(
                                width: 80,
                                child: Text(
                                  'setting_language_zh'.tr,
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ],
                          ),
                          onTap: () {
                            var locale = Locale('zh', 'CN');
                            Get.updateLocale(locale);
                            viewModel.changeLanguage('zh');
                            Get.back();
                          },
                        ),
                        ListTile(
                          title: Row(
                            children: <Widget>[
                              Padding(
                                child: Text('🇺🇸'),
                                padding: EdgeInsets.only(right: 8.0),
                              ),
                              Container(
                                width: 80,
                                child: Text(
                                  'setting_language_en'.tr,
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ],
                          ),
                          onTap: () {
                            var locale = Locale('en', 'US');
                            Get.updateLocale(locale);
                            viewModel.changeLanguage('en');
                            Get.back();
                          },
                        ),
                        ListTile(
                          title: Row(
                            children: <Widget>[
                              Padding(
                                child: Text('🇯🇵'),
                                padding: EdgeInsets.only(right: 8.0),
                              ),
                              Container(
                                width: 80,
                                child: Text(
                                  'setting_language_jp'.tr,
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ],
                          ),
                          onTap: () {
                            var locale = Locale('ja', 'JP');
                            Get.updateLocale(locale);
                            viewModel.changeLanguage('ja');
                            Get.back();
                          },
                        ),
                        ListTile(
                          title: Row(
                            children: <Widget>[
                              Padding(
                                child: Text('🇹🇭'),
                                padding: EdgeInsets.only(right: 8.0),
                              ),
                              Container(
                                width: 80,
                                child: Text(
                                  'setting_language_th'.tr,
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ],
                          ),
                          onTap: () {
                            var locale = Locale('th', 'TH');
                            Get.updateLocale(locale);
                            viewModel.changeLanguage('th');
                            Get.back();
                          },
                        ),
                      ],
                    ),
                  ),
                ));
              },
            ),
            IconButton(
              icon: Icon(Icons.settings_outlined),
              onPressed: () {
                Navigator.of(context).push(MaterialPageRoute(builder: (context) {
                  return BaseSettingView();
                }));
              },
            ),
          ],
        ),
        body: LoginForm(viewModel),
      ),
    );
  }
}

class LoginForm extends StatefulWidget {
  final LoginViewModel viewModel;
  LoginForm(this.viewModel, {Key key}) : super(key: key);

  @override
  _LoginFormState createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  VoidCallback listener;

  LoginViewModel _viewModel;

  final FormGroup form = FormGroup({
    'email': FormControl<String>(
      validators: [Validators.required, Validators.pattern(r'^\w+([-+.]\w+)*@\w+([-.]\w+)*$')],
    ),
    'password': FormControl<String>(
      validators: [Validators.required, Validators.pattern(r'^(?=.*[A-Z])(?=.*[a-z])(?=.*[1-9])(?=.*[\W]).{8,}$')],
    ),
  });

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    //在这里添加监听事件
    _viewModel.addListener(listener);
  }

  @override
  void dispose() {
    //在这里添加监听事件
    _viewModel.removeListener(listener);
    super.dispose();
  }

  @override
  void initState() {
    _viewModel = widget.viewModel;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Container(
        color: Get.theme.cardColor,
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8.0),
        child: ReactiveForm(
          formGroup: this.form,
          child: Column(
            children: <Widget>[
              _error(),
              Center(
                child: Image.asset(
                  'images/logo.png',
                  height: 50,
                ),
              ),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 0.0, vertical: 10.0),
                child: ReactiveTextField(
                  formControlName: 'email',
                  decoration: InputDecoration(
                    prefixIcon: Icon(
                      Icons.person_outline,
                      color: Get.theme.hintColor,
                      size: 20,
                    ),
                    hintText: 'login_input_email'.tr,
                  ),
                  onSubmitted: () {
                    form.focus('password');
                    this._viewModel.message = '';
                  },
                  validationMessages: (control) => {'required': 'error_login_email_required'.tr, 'pattern': 'error_login_email_format'.tr},
                ),
              ),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 0.0, vertical: 10.0),
                child: ReactiveTextField(
                  formControlName: 'password',
                  decoration: InputDecoration(
                    prefixIcon: Icon(
                      Icons.lock_outline,
                      color: Get.theme.hintColor,
                      size: 20,
                    ),
                    suffixIcon: GestureDetector(
                      onTap: _viewModel.changeObscure,
                      child: _viewModel.obscureTextLogin
                          ? Padding(
                              padding: EdgeInsets.only(right: 4.0),
                              child: Icon(
                                Icons.visibility,
                                size: 20.0,
                                color: Color(0xffc8c9cc),
                              ),
                            )
                          : Padding(
                              padding: EdgeInsets.only(right: 4.0),
                              child: Icon(
                                Icons.visibility_off,
                                size: 20.0,
                                color: Color(0xffc8c9cc),
                              ),
                            ),
                    ),
                    hintText: 'login_input_password'.tr,
                  ),
                  onSubmitted: form.valid
                      ? () {
                          _viewModel.login(this.form.value);
                          this._viewModel.message = '';
                        }
                      : null,
                  obscureText: _viewModel.obscureTextLogin ? true : false,
                  validationMessages: (control) =>
                      {'required': 'error_login_password_required'.tr, 'pattern': 'error_login_password_format'.tr},
                ),
              ),
              ReactiveFormConsumer(builder: (context, form, child) {
                return Container(
                  margin: EdgeInsets.only(top: 32),
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: form.valid
                        ? () {
                            _viewModel.login(this.form.value);
                          }
                        : null,

                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('login_btn'.tr),
                        _viewModel.loading
                            ? Container(
                                margin: EdgeInsets.only(left: 20),
                                height: 16,
                                width: 16,
                                child: CircularProgressIndicator(
                                  color: Get.theme.primaryColorLight,
                                  strokeWidth: 2.0,
                                ),
                              )
                            : Container()
                      ],
                    ),
                    // onPressed: viewModel.form.valid ? _onPressed : null,
                  ),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _error() {
    return _viewModel.message.isNotEmpty
        ? Container(
            decoration: BoxDecoration(
              color: Get.theme.errorColor,
              border: Border.all(
                color: Get.theme.errorColor,
                width: 1,
                style: BorderStyle.solid,
              ),
            ),
            margin: EdgeInsets.symmetric(horizontal: 8.0, vertical: 10.0),
            padding: EdgeInsets.symmetric(horizontal: 8.0, vertical: 10.0),
            child: Text(
              _viewModel.message,
              style: TextStyle(
                color: Colors.white,
              ),
            ),
          )
        : Container();
  }
}
