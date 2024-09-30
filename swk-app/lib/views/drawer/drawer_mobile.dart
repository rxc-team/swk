part of drawer_view;

class _DrawerMobile extends StatefulWidget {
  final DrawerViewModel viewModel;
  _DrawerMobile(this.viewModel, {Key key}) : super(key: key);

  @override
  __DrawerMobileState createState() => __DrawerMobileState();
}

class __DrawerMobileState extends State<_DrawerMobile> {
  DrawerViewModel _viewModel;

  @override
  void initState() {
    super.initState();
    _viewModel = widget.viewModel;
  }

  @override
  Widget build(BuildContext context) {
    return _body();
  }

  Widget _body() {
    if (_viewModel.auth) {
      return Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: <Widget>[
            _authWidget(),
            _company(),
            _logoutWidget(),
          ],
        ),
      );
    }
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: <Widget>[
          _unAuthWidget(),
          _company(),
        ],
      ),
    );
  }

  Widget _company() {
    String company = SpUtil.getString("company", defValue: "");
    return Container(
      padding: EdgeInsets.only(left: 16, bottom: 8),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            width: 0.5, //宽度
            color: Colors.grey.shade300, //边框颜色
          ),
        ),
      ),
      child: Text(
        company.length > 100 ? company.substring(0, 100) : company,
        style: TextStyle(fontSize: 18),
      ),
    );
  }

  Widget _unAuthWidget() {
    return UserAccountsDrawerHeader(
      accountName: Text(
        'drawer_unauth'.tr,
        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
      ),
      accountEmail: Text(
        'drawer_unauth_tips'.tr,
        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.0),
      ),
      currentAccountPicture: InkWell(
        child: CircleAvatar(
          backgroundColor: Colors.white,
          backgroundImage: _viewModel.avatar(),
        ),
        onTap: () {
          _viewModel.onLoginClick(context);
        },
      ),
    );
  }

  Widget _authWidget() {
    return UserAccountsDrawerHeader(
      accountName: Text(
        SpUtil.getString("name", defValue: ""),
        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
      ),
      accountEmail: Text(
        SpUtil.getString("email", defValue: ""),
        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.0),
      ),
      currentAccountPicture: CircleAvatar(
        backgroundColor: Colors.white,
        backgroundImage: _viewModel.avatar(),
      ),
    );
  }

  Widget _logoutWidget() {
    return ListTile(
      title: Text(
        'drawer_logout'.tr,
        textAlign: TextAlign.left,
      ),
      leading: Icon(Icons.logout_outlined, size: 22.0),
      onTap: () {
        _viewModel.logout();
      },
    );
  }
}
