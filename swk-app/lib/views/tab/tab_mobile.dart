part of tab_view;

class _TabMobile extends StatelessWidget {
  final TabViewModel viewModel;

  _TabMobile(this.viewModel);

  @override
  Widget build(BuildContext context) {
    return viewModel.loading ? SplashWidget() : AppBarPage(viewModel);
  }
}

//应用页面使用有状态Widget
class AppBarPage extends StatefulWidget {
  final TabViewModel viewModel;
  AppBarPage(this.viewModel, {Key key}) : super(key: key);

  @override
  AppBarPageState createState() => AppBarPageState();
}

//应用页面状态实现类
class AppBarPageState extends State<AppBarPage> {
  TabViewModel _vm;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _vm = widget.viewModel;
  }

  @override
  Widget build(BuildContext context) {
    var titles = ['home_title'.tr, 'setting_title'.tr];
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        appBar: AppBar(
          elevation: 0,
          centerTitle: true,
          title: Text(titles[_vm.selectedIndex]),
          actions: [
            _vm.selectedIndex == 0
                ? IconButton(
                    icon: Icon(Icons.sync),
                    onPressed: _vm.refresh,
                  )
                : Container(),
          ],
        ),
        drawer: DrawerView(),
        body: Container(
          child: Column(
            children: [
              NetWorkCheck(),
              Expanded(
                child: Container(
                  child: IndexedStack(
                    children: _vm.pages,
                    index: _vm.selectedIndex,
                  ),
                ),
              )
            ],
          ),
        ),
        //底部导航按钮 包含图标及文本
        bottomNavigationBar: BottomNavigationBar(
          elevation: 0,
          items: <BottomNavigationBarItem>[
            BottomNavigationBarItem(
              icon: _vm.home,
              label: 'home_tab_title'.tr,
            ),
            BottomNavigationBarItem(
              icon: _vm.setting,
              label: 'setting_tab_title'.tr,
            ),
          ],
          type: BottomNavigationBarType.fixed, //设置显示的模式
          selectedFontSize: 12.0,
          unselectedFontSize: 12.0,
          currentIndex: _vm.selectedIndex, //当前选中项的索引
          onTap: _vm.onItemTapped, //选择按下处理
        ),
      ),
    );
  }

  Future<bool> _onWillPop() {
    return showDialog(
          context: context,
          builder: (context) => new AlertDialog(
            title: Text('pop_title'.tr),
            content: Text('pop_tip'.tr),
            actions: <Widget>[
              OutlinedButton(
                onPressed: () => _vm.goBack(false),
                child: Text('pop_cancle_btn'.tr),
              ),
              ElevatedButton(
                onPressed: () => _vm.goBack(true),
                child: Text('pop_ok_btn'.tr),
              ),
            ],
          ),
        ) ??
        false;
  }
}
