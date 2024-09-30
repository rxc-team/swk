package cn.rxcsoft.pit3;

import androidx.annotation.NonNull;

import cn.rxcsoft.pit3.utils.MessagePlugin;
import cn.rxcsoft.pit3.utils.SkipPlugin;
import io.flutter.embedding.android.FlutterActivity;
import io.flutter.embedding.engine.FlutterEngine;
import io.flutter.embedding.engine.plugins.shim.ShimPluginRegistry;
import io.flutter.plugins.GeneratedPluginRegistrant;

public class MainActivity extends FlutterActivity {


    @Override
    public void configureFlutterEngine(@NonNull FlutterEngine flutterEngine) {
        GeneratedPluginRegistrant.registerWith(flutterEngine);
        registerCustomPlugin(flutterEngine);
    }

    private static void registerCustomPlugin(@NonNull FlutterEngine flutterEngine) {
        flutterEngine.getPlugins().add(new SkipPlugin());
        flutterEngine.getPlugins().add(new MessagePlugin());
    }
}
