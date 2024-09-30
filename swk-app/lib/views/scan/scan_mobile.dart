part of scan_view;

class _ScanMobile extends StatelessWidget {
  final ScanViewModel viewModel;

  _ScanMobile(this.viewModel);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        centerTitle: true,
        title: Text('scan_title'.tr),
      ),
      body: Container(
        child: Column(
          children: [
            NetWorkCheck(),
            Container(
              height: 160,
              child: Card(
                color: Get.theme.cardColor,
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute<void>(
                        builder: (BuildContext context) => SingleScanView(),
                      ),
                    );
                  },
                  child: Container(
                    alignment: Alignment.center,
                    child: Row(
                      children: [
                        Container(
                          color: Get.theme.primaryColor,
                          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                          child: Icon(
                            Icons.qr_code,
                            size: 32,
                            color: Colors.white,
                          ),
                        ),
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'scan_single_btn'.tr,
                                style: TextStyle(
                                  color: Get.theme.primaryColor,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 24,
                                ),
                              ),
                              Text(
                                'scan_single_net_tips'.tr,
                                style: TextStyle(
                                  color: Get.theme.errorColor,
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              ),
            ),
            SizedBox(
              height: 20,
            ),
            Container(
              height: 160,
              child: Card(
                color: Get.theme.cardColor,
                clipBehavior: Clip.antiAlias,
                child: InkWell(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute<void>(
                        builder: (BuildContext context) => MutilScanView(),
                      ),
                    );
                  },
                  child: Container(
                    alignment: Alignment.center,
                    child: Row(
                      children: [
                        Container(
                          color: Get.theme.primaryColor,
                          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                          child: Icon(
                            Icons.grading_rounded,
                            size: 32,
                            color: Colors.white,
                          ),
                        ),
                        Expanded(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'scan_mutil_btn'.tr,
                                style: TextStyle(
                                  color: Get.theme.primaryColor,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 24,
                                ),
                              ),
                              Text(
                                'scan_mutil_net_tips'.tr,
                                style: TextStyle(
                                  color: Get.theme.errorColor,
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                        )
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
