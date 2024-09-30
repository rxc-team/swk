import 'package:extended_image/extended_image.dart';
import 'package:flutter/material.dart';

class ImagePreviewDialog extends StatelessWidget {
  final List<String> images;
  final int index;
  const ImagePreviewDialog({Key key, this.images, this.index = 0}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        title: const Text(''),
      ),
      body: ExtendedImageGesturePageView.builder(
        controller: ExtendedPageController(
          initialPage: index,
        ),
        itemCount: images.length,
        itemBuilder: (BuildContext context, int i) {
          return Container(
            child: Column(
              children: [
                Expanded(
                  child: ExtendedImage.network(
                    images[i],
                    fit: BoxFit.contain,
                    mode: ExtendedImageMode.gesture,
                    initGestureConfigHandler: (ExtendedImageState state) {
                      return GestureConfig(
                        inPageView: true,
                        initialScale: 1.0,
                        maxScale: 5.0,
                        animationMaxScale: 6.0,
                        initialAlignment: InitialAlignment.center,
                      );
                    },
                  ),
                ),
                Container(
                  child: (Text('${i + 1}/${images.length}')),
                )
              ],
            ),
          );
        },
      ),
    );
  }
}
