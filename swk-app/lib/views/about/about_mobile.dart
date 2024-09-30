part of about_view;

class _AboutMobile extends StatelessWidget {
  final AboutViewModel viewModel;

  _AboutMobile(this.viewModel);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        centerTitle: true,
        title: Text('about_title'.tr),
      ),
      body: Container(
        color: Get.theme.cardColor,
        child: Column(
          children: <Widget>[
            Image.asset(
              'images/logo.png',
            ),
            Divider(
              height: 1,
            ),
            Column(children: [
              ListTile(title: Text('株式会社プロシップ')),
              Divider(
                height: 1,
              ),
              ListTile(
                title: Row(children: <Widget>[
                  Padding(
                    child: Icon(Icons.phone_outlined),
                    padding: EdgeInsets.only(right: 2),
                  ),
                  Text("03-5805-6121"),
                ]),
              ),
              Divider(
                height: 1,
              ),
              ListTile(
                title: Row(children: <Widget>[
                  Padding(
                    child: Icon(Icons.mail_outline),
                    padding: EdgeInsets.only(right: 2),
                  ),
                  Text("東京都文京区後楽二丁目3番21号"),
                ]),
              ),
            ]),
          ],
        ),
      ),
    );
  }
}
