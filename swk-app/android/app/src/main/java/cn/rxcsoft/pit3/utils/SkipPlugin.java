package cn.rxcsoft.pit3.utils;

import androidx.annotation.NonNull;

import io.flutter.embedding.engine.plugins.FlutterPlugin;
import io.flutter.embedding.engine.plugins.activity.ActivityAware;
import io.flutter.embedding.engine.plugins.activity.ActivityPluginBinding;
import io.flutter.plugin.common.PluginRegistry;

public class SkipPlugin implements FlutterPlugin, ActivityAware {
    private final SkipPluginImpl impl;

    public SkipPlugin() {
        impl = new SkipPluginImpl(null);
    }

    /**
     * Plugin registration.
     */
    @SuppressWarnings("deprecation")
    public static void registerWith(PluginRegistry.Registrar registrar) {
        SkipPluginImpl impl = new SkipPluginImpl(registrar.activity());
        impl.startListening(registrar.messenger());
    }

    @Override
    public void onAttachedToEngine(@NonNull FlutterPluginBinding binding) {
        impl.setActivity(null);
        impl.startListening(binding.getBinaryMessenger());
    }

    @Override
    public void onDetachedFromEngine(@NonNull FlutterPluginBinding binding) {
        impl.setActivity(null);
        impl.stopListening();
    }

    @Override
    public void onAttachedToActivity(@NonNull ActivityPluginBinding binding) {
        impl.setActivity(binding.getActivity());
    }

    @Override
    public void onDetachedFromActivityForConfigChanges() {
        onDetachedFromActivity();
    }

    @Override
    public void onReattachedToActivityForConfigChanges(@NonNull ActivityPluginBinding binding) {
        onAttachedToActivity(binding);
    }

    @Override
    public void onDetachedFromActivity() {
        impl.setActivity(null);
    }
}
