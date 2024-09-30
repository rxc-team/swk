package cn.rxcsoft.pit3.rfid.inventory;

import android.app.AlertDialog;
import android.app.TabActivity;
import android.bluetooth.BluetoothAdapter;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Resources;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import android.util.Log;
import android.view.View;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.SimpleAdapter;
import android.widget.Spinner;
import android.widget.TabHost;
import android.widget.TextView;
import android.widget.Toast;

import com.google.gson.Gson;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

/**
 * jp.co.tss21.uhfrfid.dotr_androidパッケージを参照します
 */
import cn.rxcsoft.pit3.MainActivity;
import cn.rxcsoft.pit3.R;
import cn.rxcsoft.pit3.rfid.bluetooth.ListBtDeviceActivity;
import cn.rxcsoft.pit3.utils.MessagePlugin;
import io.flutter.app.FlutterActivity;
import io.flutter.plugin.common.BasicMessageChannel;
import io.flutter.view.FlutterView;
import jp.co.tss21.uhfrfid.dotr_android.DOTR_Util;
import jp.co.tss21.uhfrfid.dotr_android.EnMaskFlag;
import jp.co.tss21.uhfrfid.dotr_android.EnMemoryBank;
import jp.co.tss21.uhfrfid.dotr_android.OnDotrEventListener;



/**
 * メイン
 *
 * @author Tohoku Systems Support.Co.,Ltd.
 */
public class InventoryTagDemo extends TabActivity implements View.OnClickListener,OnDotrEventListener {
    private final static String TAG = InventoryTagDemo.class.getSimpleName();

    private TabHost mTabHost;

    /** デバイスタブ用 */
    private Button mBtnScan;
    private TextView mTxtDeviceAddr;
    private TextView mTxtDeviceName;
    private Button mBtnDevForward;

    /** オプションタブ用 */
    private CheckBox mChkNoRepeat;
    private CheckBox mChkDateTime;
    private CheckBox mChkRadioPower;
    private Button mBtnOptBack;
    private Button mBtnOptForward;

    /** マスクタブ用 */
    private CheckBox mChkMaskSelect;
    private Spinner mSpnMemoryBank;
    private EditText mEdtOffset;
    private EditText mEdtBits;
    private EditText mEdtPattern;
    private Button mBtnMaskBack;
    private Button mBtnMaskForward;

    /** ログタブ用 */
    private Button mBtnLogClear;
    private Button mBtnConnect;
    private Button mBtnDisconnect;
    private ListView mListLog;
    private ArrayList<HashMap<String, String>> mAarryLog;
    private BaseAdapter mAdapterLog;

    private DOTR_Util mDotrUtil;

    /**
     * Called when the activity is first created.
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        Resources res = getResources();

        mTabHost = getTabHost();
        mTabHost.addTab(mTabHost.newTabSpec("device").setIndicator("デバイス", res.getDrawable(R.drawable.ic_volume_bluetooth_in_call)).setContent(R.id.tab1));
        mTabHost.addTab(mTabHost.newTabSpec("option").setIndicator("オプション", res.getDrawable(R.drawable.ic_menu_mark)).setContent(R.id.tab2));
        mTabHost.addTab(mTabHost.newTabSpec("mask").setIndicator("制限", res.getDrawable(R.drawable.ic_menu_myplaces)).setContent(R.id.tab3));
        mTabHost.addTab(mTabHost.newTabSpec("log").setIndicator("ログ", res.getDrawable(R.drawable.ic_menu_info_details)).setContent(R.id.tab4));
        mTabHost.setCurrentTab(0);

        /** デバイスタブ用 */
        mBtnScan = (Button) findViewById(R.id.btn_scan);
        mBtnScan.setOnClickListener(this);
        mBtnDevForward = (Button) findViewById(R.id.btn_dev_forward);
        mBtnDevForward.setOnClickListener(this);
        mTxtDeviceName = (TextView) findViewById(R.id.txt_device_name);
        mTxtDeviceAddr = (TextView) findViewById(R.id.txt_device_address);
        mTxtDeviceName.setText(getAutoConnectDeviceName());
        mTxtDeviceAddr.setText(getAutoConnectDeviceAddress());

        /** オプションタブ用 */
        mChkNoRepeat = (CheckBox) findViewById(R.id.chk_no_repeat);
        mChkDateTime = (CheckBox) findViewById(R.id.chk_date_time);
        mChkRadioPower = (CheckBox) findViewById(R.id.chk_radio_power);
        mBtnOptBack = (Button) findViewById(R.id.btn_opt_back);
        mBtnOptBack.setOnClickListener(this);
        mBtnOptForward = (Button) findViewById(R.id.btn_opt_forward);
        mBtnOptForward.setOnClickListener(this);

        /** マスクタブ用 */
        mChkMaskSelect = (CheckBox) findViewById(R.id.chk_mask_select);
        mChkMaskSelect.setOnClickListener(this);
        mSpnMemoryBank = (Spinner) findViewById(R.id.spn_memory_bank);
        mEdtOffset = (EditText) findViewById(R.id.edt_offset);
        mEdtBits = (EditText) findViewById(R.id.edt_bits);
        mEdtPattern = (EditText) findViewById(R.id.edt_pattern);
        mBtnMaskBack = (Button) findViewById(R.id.btn_mask_back);
        mBtnMaskBack.setOnClickListener(this);
        mBtnMaskForward = (Button) findViewById(R.id.btn_mask_forward);
        mBtnMaskForward.setOnClickListener(this);

        /** ログタブ用 */
        mBtnConnect = (Button) findViewById(R.id.btn_connect);
        mBtnConnect.setOnClickListener(this);
        mBtnDisconnect = (Button) findViewById(R.id.btn_disconnect);
        mBtnDisconnect.setOnClickListener(this);
        mBtnLogClear = (Button) findViewById(R.id.btn_log_clear);
        mBtnLogClear.setOnClickListener(this);

        initLog();
        setEnable();

        //DOTR_Utilのインスタンスを生成します
        mDotrUtil = new DOTR_Util();

        //ベントリスナーを設定する
        mDotrUtil.setOnDotrEventListener(this);

        BluetoothAdapter mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (mBluetoothAdapter == null) {
            // Device does not support Bluetooth
            finish();
        } else if (!mBluetoothAdapter.isEnabled()) {
            Intent intent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(intent, REQUEST_ENABLE_BT);
        }
    }


    /**
     * イベントハンドラを記載します
     */
    @Override
    public void onClick(View arg0) {
        switch (arg0.getId()) {
            case R.id.btn_scan: //デバイス検索ボタン
                Intent intent = new Intent(getApplicationContext(), ListBtDeviceActivity.class);
                startActivityForResult(intent, ListBtDevice_Activity);
                break;
            case R.id.btn_connect:  //接続ボタン
                if(mDotrUtil.isConnect()) {
                    setting();
                } else {
                    if (mDotrUtil.connect(getAutoConnectDeviceAddress())) {
                        setting();
                    } else {
                        showToastByOtherThread("接続に失敗しました。", Toast.LENGTH_SHORT);
                    }
                }
                break;
            case R.id.btn_disconnect:   //切断ボタン
                if(mDotrUtil.isConnect()){
                    if(!mDotrUtil.disconnect())
                        showToastByOtherThread("解除に失敗しました。", Toast.LENGTH_SHORT);
                }
                break;
            case R.id.btn_log_clear:    //ログ消去ボタン
                resetLog();
                break;
            case R.id.btn_dev_forward:  //次へボタン
                mTabHost.setCurrentTab(0 + 1);
                break;
            case R.id.btn_opt_back: //前へボタン
                mTabHost.setCurrentTab(1 - 1);
                break;
            case R.id.btn_opt_forward:  //次へボタン
                mTabHost.setCurrentTab(1 + 1);
                break;
            case R.id.btn_mask_back:    //前へボタン
                mTabHost.setCurrentTab(2 - 1);
                break;
            case R.id.btn_mask_forward: //次へボタン
                mTabHost.setCurrentTab(2 + 1);
                break;
            case R.id.chk_mask_select:  //チェックボックス
                setEnable();
                break;
        }
    }


    void setEnable() {
        //コントロールの活性/非活性を制御する
        boolean enable = mChkMaskSelect.isChecked();
        mSpnMemoryBank.setEnabled(enable);
        mEdtOffset.setEnabled(enable);
        mEdtBits.setEnabled(enable);
        mEdtPattern.setEnabled(enable);
    }


    //主に別スレッドを考慮したイベントハンドラを記載します
    public static final int MSG_QUIT = 9999;
    public static final int MSG_SHOW_TOAST = 20;
    public static final int MSG_BACK_COLOR = 21;
    public static final int MSG_INVENTORY_TAG = 22;
    public static final int MSG_FIRM = 23;

    private InventoryTagHandler mHandler = new InventoryTagHandler(InventoryTagDemo.this);

    /**
     * InventoryTagDemo用ハンドラ
     */
    static class InventoryTagHandler extends Handler {
        private final WeakReference<InventoryTagDemo> myActivity;

        InventoryTagHandler(InventoryTagDemo activity) {
            myActivity = new WeakReference<>(activity);
        }

        @Override
        public void handleMessage(Message msg) {
            InventoryTagDemo activity = myActivity.get();
            switch (msg.what) {
                case MSG_QUIT:
                    activity.closeApp();
                    break;
                case MSG_SHOW_TOAST:
                    Toast.makeText(activity, (String) msg.obj,msg.arg1).show();
                    break;
                case MSG_BACK_COLOR:
                    activity.mTabHost.setBackgroundColor(msg.arg2);//背景色変更
                    break;
                case MSG_INVENTORY_TAG:
                case MSG_FIRM:
                    HashMap<String, String> item = new HashMap<>();
                    item.put("epc", (String)msg.obj);
                    activity.mAarryLog.add(item);
                    activity.mAdapterLog.notifyDataSetChanged();
                    activity.mListLog.setSelection( activity.mAarryLog.size() - 1 );//最後の行に移動
                    break;
            }
        }
    }


    private void closeApp() {
        finish();
    }


    private void postCloseApp() {
        mHandler.sendEmptyMessageDelayed(MSG_QUIT, 1000);
    }


    private void showToastByOtherThread(String msg, int time) {
        mHandler.removeMessages(MSG_SHOW_TOAST);
        mHandler.sendMessage(mHandler.obtainMessage(MSG_SHOW_TOAST, time, 0, msg));
    }


    /* (非 Javadoc)
     * @see android.app.Activity#finalize()
     */
    @Override
    protected void finalize() throws Throwable {
        if (mDotrUtil != null) {
            if (mDotrUtil.isConnect()) {
                mDotrUtil.disconnect();
            }
        }

        super.finalize();
    }


    /* (非 Javadoc)
     * @see android.app.Activity#onBackPressed()
     */
    @Override
    public void onBackPressed() {
        super.onBackPressed();

//        new AlertDialog.Builder(this)
//                .setTitle("終了確認")
//                .setMessage("プログラムを終了しますか？")
//                .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
//                    public void onClick(DialogInterface dialog, int whichButton) {
//                        InventoryTagDemo.this.postCloseApp();
//                    }
//                })
//                .setNegativeButton("No", new DialogInterface.OnClickListener() {
//                    public void onClick(DialogInterface dialog, int whichButton) {
//                    }
//                }).create().show();
    }


    /** ---------------------------------------- ----------------------------------------
     * デバイスタブ用
     * ---------------------------------------- ---------------------------------------- */
    void setting() {
        //同一EPCタグ読取りの設定
        mDotrUtil.setNoRepeat(mChkNoRepeat.isChecked());
        if (!mChkNoRepeat.isChecked()) {
            mDotrUtil.clearAccessEPCList();
        }

        //一括読取り時の取得データ設定
        mDotrUtil.setInventoryReportMode(mChkDateTime.isChecked(), mChkRadioPower.isChecked());

        mChkMaskSelect = (CheckBox) findViewById(R.id.chk_mask_select);
        mSpnMemoryBank = (Spinner) findViewById(R.id.spn_memory_bank);
        mEdtOffset = (EditText) findViewById(R.id.edt_offset);
        mEdtBits = (EditText) findViewById(R.id.edt_bits);
        mEdtPattern = (EditText) findViewById(R.id.edt_pattern);

        if (mChkMaskSelect.isChecked()) {
            //マスク情報をセット
            EnMemoryBank bank = EnMemoryBank.valueOf((String) mSpnMemoryBank.getSelectedItem());
            byte[] maskPattern = Utility.asByteArray(mEdtPattern.getText().toString());
            int offset = Integer.valueOf(mEdtOffset.getText().toString());
            int bits = Integer.valueOf(mEdtBits.getText().toString());
            mDotrUtil.setTagAccessMask(bank, offset, bits, maskPattern);
        }
    }


    static final int ListBtDevice_Activity = 1;
    static final int REQUEST_ENABLE_BT = 2;

    /*
     * アクティビティの応答
     * (非 Javadoc)
     * @see android.app.Activity#onActivityResult(int, int, android.content.Intent)
     */
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        /** Bluetoothデバイスリスト画面からの応答の場合 */
        if (requestCode == ListBtDevice_Activity) {
            if (resultCode == RESULT_OK) {
                //選択したBluetoothデバイスを保存する。
                String addr = data.getExtras().getString(ListBtDeviceActivity.DEVICE_ADDRESS);
                String name = data.getExtras().getString(ListBtDeviceActivity.DEVICE_NAME);

                setAutoConnectDevice(name, addr);

                mTxtDeviceName.setText(name);
                mTxtDeviceAddr.setText(addr);

                showToastByOtherThread("デバイスを設定しました。", Toast.LENGTH_SHORT);
            } else if (resultCode == RESULT_CANCELED) {
                //
            }
        } else if(requestCode==REQUEST_ENABLE_BT){
            if (resultCode == RESULT_OK) {
                //Bluetooth有効
            } else if(resultCode==RESULT_CANCELED){
                //Bluetooth無効
            }
        }
    }


    /**
     * Bluetoothデバイスの名称およびMACアドレスを保存する
     *
     * @param strName    デバイス名称
     * @param strAddress MACアドレス
     */
    private void setAutoConnectDevice(String strName, String strAddress) {
        if (strName == null || strAddress == null) {
            return;
        }

        SharedPreferences pref = getSharedPreferences(TAG, 0);
        SharedPreferences.Editor editor = pref.edit();
        editor.putString("auto_link_device_name", strName);
        editor.putString("auto_link_device_address", strAddress);
        editor.commit();
    }


    /**
     * BluetoothデバイスのMACアドレスを取得する。
     *
     * @return MACアドレス
     */
    private String getAutoConnectDeviceAddress() {
        SharedPreferences pref = getSharedPreferences(TAG, 0);
        return pref.getString("auto_link_device_address", "");
    }


    /**
     * Bluetoothデバイスの名称を取得する。
     *
     * @return デバイス名称
     */
    private String getAutoConnectDeviceName() {
        SharedPreferences pref = getSharedPreferences(TAG, 0);
        return pref.getString("auto_link_device_name", "");
    }


    /** ---------------------------------------- ----------------------------------------
     * ログタブ用
     * ---------------------------------------- ---------------------------------------- */
    private void initLog() {
        mListLog = (ListView) findViewById(R.id.list_log);
        if (mAarryLog == null) {
            mAarryLog = new ArrayList<>();
            mAdapterLog = new SimpleAdapter(this, mAarryLog,
                    R.layout.list_row,
                    new String[]{"epc", "count"},
                    new int[]{R.id.textView1});
            mListLog.setAdapter(mAdapterLog);
        }
    }


    private void resetLog() {
        // TODO 测试使用，后期删除
        HashMap<String,String>   log = new HashMap<>();
        log.put("epc","1111");
        mAarryLog.add(log);
        // 取得epc的数组
        ArrayList<String> arrayList= new ArrayList<>();
        for (int i = 0;i<mAarryLog.size();i++){
            HashMap<String,String> m = mAarryLog.get(i);
            arrayList.add(m.get("epc"));
        }
        // 清空现有数据
        mAarryLog.clear();
        mAdapterLog.notifyDataSetChanged();
        // 发送消息到flutter
        MessagePlugin plugin = new MessagePlugin();
        Gson gson = new Gson();
        plugin.send(gson.toJson(arrayList));
        // 返回前画面
        this.onBackPressed();
    }


    /*
     * 接続完了イベント
     * (非 Javadoc)
     * @see jp.co.tss21.uhfrfid.dotr_android.OnDotrEventListener#onConnected()
     */
    @Override
    public void onConnected() {
        Log.d(TAG, "onConnected");

        resetLog();
        mHandler.sendMessage(mHandler.obtainMessage(MSG_BACK_COLOR, Toast.LENGTH_SHORT, getResources().getColor(R.color.background_connect), null));
        showToastByOtherThread("接続しました。", Toast.LENGTH_SHORT);

        //ファームウェアバージョンをログに表示
        String ver = "ファームウェア　" + mDotrUtil.getFirmwareVersion();
        mHandler.sendMessage(mHandler.obtainMessage(MSG_FIRM, 0, 0, ver));
    }


    /*
     * 接続解除イベント
     * (非 Javadoc)
     * @see jp.co.tss21.uhfrfid.dotr_android.OnDotrEventListener#onDisconnected()
     */
    @Override
    public void onDisconnected() {
        Log.d(TAG, "onDisconnected");
        mDotrUtil = new DOTR_Util();
        mDotrUtil.setOnDotrEventListener(this);
        mHandler.sendMessage(mHandler.obtainMessage(MSG_BACK_COLOR, Toast.LENGTH_SHORT, getResources().getColor(R.color.background_disconnect), null));
        showToastByOtherThread("切断しました。", Toast.LENGTH_SHORT);
    }


    /*
     * リンク切れイベント
     * (非 Javadoc)
     * @see jp.co.tss21.uhfrfid.dotr_android.OnDotrEventListener#onLinkLost()
     */
    @Override
    public void onLinkLost() {
        Log.d(TAG, "onLinkLost");

        mHandler.sendMessage(mHandler.obtainMessage(MSG_BACK_COLOR, Toast.LENGTH_SHORT, getResources().getColor(R.color.background_disconnect), null));
        showToastByOtherThread("リンクが切れました。", Toast.LENGTH_SHORT);
    }


    /*
     * トリガ状態変更イベント
     * (非 Javadoc)
     * @see jp.co.tss21.uhfrfid.dotr_android.OnDotrEventListener#onTriggerChaned(boolean)
     */
    @Override
    public void onTriggerChaned(boolean trigger) {
        Log.d(TAG, "onTriggerChaned(" + trigger + ")");

        if (trigger) {
            if (mChkMaskSelect.isChecked()) {
                //マスク情報を使用して読取り
                mDotrUtil.inventoryTag(false, EnMaskFlag.SelectMask, 0);
            } else {
                //マスク情報を使用せずに読取り
                mDotrUtil.inventoryTag(false, EnMaskFlag.None, 0);
            }
        } else {
            //トリガを離したら読取り処理をストップ
            mDotrUtil.stop();
        }
    }


    /*
     * EPC一括読取りイベント
     * (非 Javadoc)
     * @see jp.co.tss21.uhfrfid.dotr_android.OnDotrEventListener#onInventoryEPC(java.lang.String)
     */
    @Override
    public void onInventoryEPC(String epc) {
        Log.d(TAG, "onInventoryEPC(" + epc + ")");

        String[] list = epc.split(",");
        if (list.length >= 2) {
            for (int i = 0; i < list.length; i++) {
                if (list[i].startsWith("TIME=")) {
                    Date d = new Date(Long.parseLong(list[1].replace("TIME=", "")));
                    epc = epc.replace(list[1], String.format("%tY年%tm月%td日 %tH時%tM分%tS秒(%tL)", d, d, d, d, d, d, d));
                    break;
                }
            }
        }

        mHandler.sendMessage(mHandler.obtainMessage(MSG_INVENTORY_TAG, 0, 0, epc));
    }


    @Override
    public void onReadTagData(String data, String epc) {
        Log.d(TAG, "onReadTagData(" + data + ")(" + epc + ")");
    }


    @Override
    public void onWriteTagData(String epc) {
        Log.d(TAG, "onWriteTagData(" + epc + ")");
    }


    @Override
    public void onUploadTagData(String data) {
        Log.d(TAG, "onUploadTagData(" + data + ")");
    }


    @Override
    public void onTagMemoryLocked(String arg0) {
        // TODO 自動生成されたメソッド・スタブ
    }

    @Override
    public void onScanCode(String code){
        Log.d(TAG, "onScanCode(" + code + ")");
    }

    @Override
    public void onScanTriggerChanged(boolean trigger){
        Log.d(TAG, "onScanTriggerChanged(" + trigger + ")");
    }

}