package cn.rxcsoft.pit3.utils;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import io.flutter.embedding.engine.plugins.FlutterPlugin;
import io.flutter.plugin.common.BasicMessageChannel;
import io.flutter.plugin.common.BinaryMessenger;
import io.flutter.plugin.common.PluginRegistry;
import io.flutter.plugin.common.StringCodec;

public class MessagePlugin implements BasicMessageChannel.MessageHandler, FlutterPlugin {
    public static String CHANNEL = "cn.rxcsoft.pit3/message";
    private static BasicMessageChannel messageChannel;

    public MessagePlugin() {
    }

    /**
     * Plugin registration.
     */
    @SuppressWarnings("deprecation")
    public static void registerWith(PluginRegistry.Registrar registrar) {
        final MessagePlugin plugin = new MessagePlugin();
        plugin.onAttachedToEngine(registrar.messenger());
    }

    public void send(Object message) {
        if (messageChannel != null) {
            Log.e(CHANNEL, "发送消息给flutter:" + message.toString());
            messageChannel.send(message);
        }
    }

    @Override
    public void onMessage(@Nullable Object message, @NonNull BasicMessageChannel.Reply reply) {
        Log.e(CHANNEL, "接收到来自flutter的消息:" + message.toString());
    }

    @Override
    public void onAttachedToEngine(@NonNull FlutterPluginBinding binding) {
        onAttachedToEngine(binding.getBinaryMessenger());
    }

    private void onAttachedToEngine(BinaryMessenger messenger) {
        messageChannel = new BasicMessageChannel(messenger, CHANNEL, StringCodec.INSTANCE);
        messageChannel.setMessageHandler(this);
    }

    @Override
    public void onDetachedFromEngine(@NonNull FlutterPluginBinding binding) {
        messageChannel.setMessageHandler(null);
        messageChannel = null;
    }
}
