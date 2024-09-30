package cn.rxcsoft.pit3;

import android.os.Bundle;

import cn.rxcsoft.pit3.utils.MessagePlugin;
import cn.rxcsoft.pit3.utils.SkipPlugin;
import cn.rxcsoft.pit3.utils.SkipPluginImpl;
import io.flutter.app.FlutterActivity;
import io.flutter.plugin.common.PluginRegistry;

public class EmbeddingV1Activity extends FlutterActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    registerCustomPlugin(this);
  }

  private static void registerCustomPlugin(PluginRegistry registrar) {
    SkipPlugin.registerWith(registrar.registrarFor(SkipPluginImpl.CHANNEL));
    MessagePlugin.registerWith(registrar.registrarFor(MessagePlugin.CHANNEL));
  }
}
