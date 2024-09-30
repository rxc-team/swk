package cn.rxcsoft.pit3.utils;

import android.app.Activity;
import android.content.Intent;

import cn.rxcsoft.pit3.rfid.configreader.ConfigReaderDemo;
import cn.rxcsoft.pit3.rfid.inventory.InventoryTagDemo;
import io.flutter.plugin.common.BinaryMessenger;
import io.flutter.plugin.common.MethodCall;
import io.flutter.plugin.common.MethodChannel;

public class SkipPluginImpl implements MethodChannel.MethodCallHandler {
    //取到唯一标识
    public static final String CHANNEL = "cn.rxcsoft.pit3.plugins/skip_native_page";

    private Activity activity;
    private MethodChannel methodChannel;

    SkipPluginImpl(Activity activity) {
        this.activity = activity;
    }

    @Override
    public void onMethodCall(MethodCall methodCall, MethodChannel.Result result) {
        try {
            switch (methodCall.method) {
                //找到对应方法
                case "rfidConfig": {
                    activity.startActivity(new Intent(activity, ConfigReaderDemo.class));
                    break;
                }
                case "rfidScanner": {
                    activity.startActivity(new Intent(activity, InventoryTagDemo.class));
                    break;
                }
            }
            result.success(null);
        } catch (Exception e) {
            result.error("IOException encountered", methodCall.method, e);
        }
    }

    void stopListening() {
        if (this.methodChannel == null) {
            return;
        }

        methodChannel.setMethodCallHandler(null);
        methodChannel = null;
    }

    void startListening(BinaryMessenger messenger) {
        methodChannel = new MethodChannel(messenger, CHANNEL);
        methodChannel.setMethodCallHandler(this);
    }

    void setActivity(Activity activity) {
        this.activity = activity;
    }
}
