
package cn.rxcsoft.pit3.rfid.configreader;

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
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.ProgressBar;
import android.widget.SeekBar;
import android.widget.SeekBar.OnSeekBarChangeListener;
import android.widget.Spinner;
import android.widget.TabHost;
import android.widget.TextView;
import android.widget.Toast;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Date;

import cn.rxcsoft.pit3.R;
import cn.rxcsoft.pit3.rfid.bluetooth.ListBtDeviceActivity;
import jp.co.tss21.uhfrfid.dotr_android.DOTR_Util;
import jp.co.tss21.uhfrfid.dotr_android.EnBuzzerVolume;
import jp.co.tss21.uhfrfid.dotr_android.EnChannel;
import jp.co.tss21.uhfrfid.dotr_android.EnMaskFlag;
import jp.co.tss21.uhfrfid.dotr_android.EnSession;
import jp.co.tss21.uhfrfid.dotr_android.EnTagAccessFlag;
import jp.co.tss21.uhfrfid.dotr_android.OnDotrEventListener;

/**
 * jp.co.tss21.uhfrfid.dotr_androidパッケージを参照します
 */

/**
 * メイン
 *
 * @author Tohoku Systems Support.Co.,Ltd.
 */
public class ConfigReaderDemo extends TabActivity implements View.OnClickListener, OnDotrEventListener, OnSeekBarChangeListener {
    private final static String TAG = ConfigReaderDemo.class.getSimpleName();

    private TabHost mTabHost;

    /**
     * デバイスタブ用
     */
    private Button mBtnScan;
    private TextView mTxtDeviceAddr;
    private TextView mTxtDeviceName;
    private Button mbtnDevDisconnect;
    private Button mBtnDevForward;

    /**
     * 音量設定タブ用
     */
    ProgressBar mProgressBarBattBuzzer;
    TextView mTxtBattBuzzer;
    SeekBar mSeekBarBuzzer;
    TextView mTxtBuzzer;
    CheckBox mChkBuzzer;
    Button mBtnBuzzer;
    TextView mTxtFirmBuzzer;

    /**
     * 電源設定タブ用
     */
    ProgressBar mProgressBarBattPower;
    TextView mTxtBattPower;
    SeekBar mSeekBarPower;
    TextView mTxtPower;
    CheckBox mChkPower;
    Button mBtnPower;
    TextView mTxtFirmPower;

    /**
     * 電波強度設定タブ用
     */
    ProgressBar mProgressBarBattRadio;
    TextView mTxtBattRadio;
    SeekBar mSeekBarRadio;
    TextView mTxtRadio;
    TextView mTxtRadioMax;
    TextView mTxtRadioNow;
    Button mBtnRadio;
    Button mBtnRadioStart;
    Button mBtnRadioStop;
    TextView mTxtFirmRadio;

    /**
     * チャネル設定タブ用
     */
    ProgressBar mProgressBarBattChannel;
    TextView mTxtBattChannel;
    Button mBtnChannel;
    CheckBox mChkCh8;
    CheckBox mChkCh9;
    CheckBox mChkCh10;
    CheckBox mChkCh11;
    CheckBox mChkCh12;
    CheckBox mChkCh13;
    TextView mTxtFirmChannel;

    /**
     * 読み取り設定タブ用
     */
    SeekBar mSeekRadioCycle;
    TextView mTxtRadioCycle;
    Spinner mSpinnerSession;
    Spinner mSpinnerReadMode;
    Button mButtonReadMode;
    Button mButtonReadStart;
    Button mButtonReadEnd;
    TextView mTxtFirmReadMode;


    private DOTR_Util mDotrUtil;

    /**
     * Called when the activity is first created.
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.config);

        Resources res = getResources();


        mTabHost = getTabHost();
        mTabHost.addTab(mTabHost.newTabSpec("device").setIndicator("デバイス", res.getDrawable(R.drawable.ic_volume_bluetooth_in_call)).setContent(R.id.tab1));
        mTabHost.addTab(mTabHost.newTabSpec("buzzer").setIndicator("音量", res.getDrawable(R.drawable.ic_menu_mark)).setContent(R.id.tab2));
        mTabHost.addTab(mTabHost.newTabSpec("power").setIndicator("電源", res.getDrawable(R.drawable.ic_menu_mark)).setContent(R.id.tab3));
        mTabHost.addTab(mTabHost.newTabSpec("radio").setIndicator("電波強度", res.getDrawable(R.drawable.ic_menu_mark)).setContent(R.id.tab4));
        mTabHost.addTab(mTabHost.newTabSpec("channel").setIndicator("チャネル", res.getDrawable(R.drawable.ic_menu_mark)).setContent(R.id.tab5));
        mTabHost.addTab(mTabHost.newTabSpec("read_mode").setIndicator("読取", res.getDrawable(R.drawable.ic_menu_mark)).setContent(R.id.tab6));
        mTabHost.setCurrentTab(0);

        /** デバイスタブ用 */
        mBtnScan = (Button) findViewById(R.id.btn_scan);
        mBtnScan.setOnClickListener(this);
        mbtnDevDisconnect = (Button) findViewById(R.id.btn_dev_disconnect);
        mbtnDevDisconnect.setOnClickListener(this);
        mBtnDevForward = (Button) findViewById(R.id.btn_dev_forward);
        mBtnDevForward.setOnClickListener(this);
        mTxtDeviceName = (TextView) findViewById(R.id.txt_device_name);
        mTxtDeviceAddr = (TextView) findViewById(R.id.txt_device_addr);
        mTxtDeviceName.setText(getAutoConnectDeviceName());
        mTxtDeviceAddr.setText(getAutoConnectDeviceAddr());

        /** 音量設定タブ用 */
        mProgressBarBattBuzzer = (ProgressBar) findViewById(R.id.progressBar_batt_buzzer);
        mTxtBattBuzzer = (TextView) findViewById(R.id.txt_batt_buzzer);
        mSeekBarBuzzer = (SeekBar) findViewById(R.id.seekBar_buzzer);
        mSeekBarBuzzer.setOnSeekBarChangeListener(this);
        mTxtBuzzer = (TextView) findViewById(R.id.txt_buzzer);
        mChkBuzzer = (CheckBox) findViewById(R.id.chk_buzzer);
        mBtnBuzzer = (Button) findViewById(R.id.btn_buzzer);
        mBtnBuzzer.setOnClickListener(this);
        mTxtFirmBuzzer = (TextView) findViewById(R.id.txt_firm_buzzer);
        setTextBuzzerVolume(mSeekBarBuzzer);

        /** 電源設定タブ用 */
        mProgressBarBattPower = (ProgressBar) findViewById(R.id.progressBar_batt_power);
        mTxtBattPower = (TextView) findViewById(R.id.txt_batt_power);
        mSeekBarPower = (SeekBar) findViewById(R.id.seekBar_power);
        mSeekBarPower.setOnSeekBarChangeListener(this);
        mTxtPower = (TextView) findViewById(R.id.txt_power);
        mChkPower = (CheckBox) findViewById(R.id.chk_power);
        mBtnPower = (Button) findViewById(R.id.btn_power);
        mBtnPower.setOnClickListener(this);
        mTxtFirmPower = (TextView) findViewById(R.id.txt_firm_power);
        setTextPower(mSeekBarPower);

        /** 電波強度設定タブ用 */
        mProgressBarBattRadio = (ProgressBar) findViewById(R.id.progressBar_batt_radio);
        mTxtBattRadio = (TextView) findViewById(R.id.txt_batt_radio);
        mSeekBarRadio = (SeekBar) findViewById(R.id.seekBar_radio);
        mSeekBarRadio.setOnSeekBarChangeListener(this);
        mTxtRadio = (TextView) findViewById(R.id.txt_radio);
        mTxtRadioMax = (TextView) findViewById(R.id.txt_radio_max);
        mTxtRadioNow = (TextView) findViewById(R.id.txt_radio_now);
        mBtnRadio = (Button) findViewById(R.id.btn_radio);
        mBtnRadio.setOnClickListener(this);
        mBtnRadioStart = (Button) findViewById(R.id.btn_radio_start);
        mBtnRadioStart.setOnClickListener(this);
        mBtnRadioStop = (Button) findViewById(R.id.btn_radio_stop);
        mBtnRadioStop.setOnClickListener(this);
        mTxtFirmRadio = (TextView) findViewById(R.id.txt_firm_radio);
        setTextRadio(mSeekBarRadio);

        /** チャネル設定タブ用 */
        mProgressBarBattChannel = (ProgressBar) findViewById(R.id.progressBar_batt_channel);
        mTxtBattChannel = (TextView) findViewById(R.id.txt_batt_channel);
        mBtnChannel = (Button) findViewById(R.id.btn_channel);
        mBtnChannel.setOnClickListener(this);
        mChkCh8 = (CheckBox) findViewById(R.id.chk_ch8);
        mChkCh9 = (CheckBox) findViewById(R.id.chk_ch9);
        mChkCh10 = (CheckBox) findViewById(R.id.chk_ch10);
        mChkCh11 = (CheckBox) findViewById(R.id.chk_ch11);
        mChkCh12 = (CheckBox) findViewById(R.id.chk_ch12);
        mChkCh13 = (CheckBox) findViewById(R.id.chk_ch13);
        mTxtFirmChannel = (TextView) findViewById(R.id.txt_firm_channel);

        /** 読み取り設定タブ用 */
        mSeekRadioCycle = (SeekBar) findViewById(R.id.seekBar_radio_cycle);
        mSeekRadioCycle.setOnSeekBarChangeListener(this);
        mTxtRadioCycle = (TextView) findViewById(R.id.txt_radio_cycle);
        mSpinnerSession = (Spinner) findViewById(R.id.spinner_session);
        mSpinnerReadMode = (Spinner) findViewById(R.id.spinner_mode);
        mButtonReadMode = (Button) findViewById(R.id.btn_read_mode);
        mButtonReadMode.setOnClickListener(this);
        mButtonReadStart = (Button) findViewById(R.id.btn_read_start);
        mButtonReadStart.setOnClickListener(this);
        mButtonReadEnd = (Button) findViewById(R.id.btn_read_end);
        mButtonReadEnd.setOnClickListener(this);
        mTxtFirmReadMode = (TextView) findViewById(R.id.txt_firm_read_mode);


        /** DOTR_Utilのインスタンスを生成します */
        mDotrUtil = new DOTR_Util();

        /** イベントリスナーを設定する */
        mDotrUtil.setOnDotrEventListener(this);

        BluetoothAdapter ba = BluetoothAdapter.getDefaultAdapter();
        if (!ba.isEnabled()) {
            Intent intent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivity(intent);
        }
    }


    /**
     * イベントハンドラを記載します
     */
    @Override
    public void onClick(View arg0) {

        switch (arg0.getId()) {
            /** デバイス検索ボタンクリック */
            case R.id.btn_scan:
                Intent intent = new Intent(getApplicationContext(), ListBtDeviceActivity.class);
                startActivityForResult(intent, ListBtDevice_Activity);
                break;

            /** 切断ボタンクリック */
            case R.id.btn_dev_disconnect:
                if(mDotrUtil.isConnect()){
                    if(!mDotrUtil.disconnect())
                        showToastByOtherThread("解除に失敗しました。", Toast.LENGTH_SHORT);
                }
                break;

            /** 接続して次へボタンクリック */
            case R.id.btn_dev_forward:
                if(mDotrUtil.isConnect()) {
                    getSetting();
                    mTabHost.setCurrentTab(0 + 1);
                } else {
                    if (mDotrUtil.connect(getAutoConnectDeviceAddr())) {
                        getSetting();
                        mTabHost.setCurrentTab(0 + 1);
                    } else {
                        showToastByOtherThread("接続に失敗しました。", Toast.LENGTH_SHORT);
                    }
                }

                break;

            /** ブザー設定ボタンクリック */
            case R.id.btn_buzzer:
                EnBuzzerVolume[] envol = new EnBuzzerVolume[]{EnBuzzerVolume.Mute, EnBuzzerVolume.Low, EnBuzzerVolume.High};
                int vol = mSeekBarBuzzer.getProgress();
                if (mDotrUtil.setBuzzerVolume(envol[vol], mChkBuzzer.isChecked())) {
                    showToastByOtherThread("ブザー音量の設定が完了しました。", Toast.LENGTH_SHORT);
                }
                break;

            /** 自動電源オフボタンクリック */
            case R.id.btn_power:
                int secIndex = mSeekBarPower.getProgress();
                if (mDotrUtil.setPowerOffDelay(timetable[secIndex], mChkPower.isChecked())) {
                    showToastByOtherThread("自動電源OFFの設定が完了しました。", Toast.LENGTH_SHORT);
                }
                break;

            /** 電波強度設定ボタンクリック */
            case R.id.btn_radio:
                int radio = mSeekBarRadio.getProgress();
                if (mDotrUtil.setRadioPower(radio)) {
                    showToastByOtherThread("電波出力強度の設定が完了しました。", Toast.LENGTH_SHORT);
                }
                //現在出力を再表示
                int powNow = mDotrUtil.getRadioPower();
                mTxtRadioNow.setText(String.valueOf(powNow) + "dBm");
                break;

            //btn_radio
            /** テスト開始ボタンクリック */
            case R.id.btn_radio_start:
            case R.id.btn_read_start:
                if(!mDotrUtil.inventoryTag(false, EnMaskFlag.None, 0)){
                    showToastByOtherThread("テスト開始できませんでした。", Toast.LENGTH_SHORT);
                }
                break;

            /** テスト終了ボタンクリック */
            case R.id.btn_radio_stop:
            case R.id.btn_read_end:
                if(!mDotrUtil.stop()){
                    showToastByOtherThread("テスト終了できませんでした。", Toast.LENGTH_SHORT);
                }
                break;

            /** チャネル設定ボタンクリック */
            case R.id.btn_channel:

                ArrayList<EnChannel> array = new ArrayList<>();
                if (mChkCh8.isChecked()) {
                    array.add(EnChannel.Ch05);
                }
                if (mChkCh9.isChecked()) {
                    array.add(EnChannel.Ch11);
                }
                if (mChkCh10.isChecked()) {
                    array.add(EnChannel.Ch17);
                }
                if (mChkCh11.isChecked()) {
                    array.add(EnChannel.Ch23);
                }
                if (mChkCh12.isChecked()) {
                    array.add(EnChannel.Ch24);
                }
                if (mChkCh13.isChecked()) {
                    array.add(EnChannel.Ch25);
                }
                if (mDotrUtil.setRadioChannel(array.toArray(new EnChannel[0]))) {
                    showToastByOtherThread("電波出力チャネルの設定が完了しました。", Toast.LENGTH_SHORT);
                } else {
                    showToastByOtherThread("電波出力チャネルの設定が失敗しました。", Toast.LENGTH_LONG);
                }
                break;

            /** 読み取りモード設定ボタンクリック */
            case R.id.btn_read_mode:
                int cycle = mSeekRadioCycle.getProgress() + 40;

                EnSession session = EnSession.Session0;
                switch (mSpinnerSession.getSelectedItemPosition()) {
                    case 0:
                        session = EnSession.Session0;
                        break;
                    case 1:
                        session = EnSession.Session1;
                        break;
                    case 2:
                        session = EnSession.Session2;
                        break;
                    case 3:
                        session = EnSession.Session3;
                        break;
                }

                EnTagAccessFlag flag = EnTagAccessFlag.FlagA;
                switch (mSpinnerReadMode.getSelectedItemPosition()) {
                    case 0:
                        flag = EnTagAccessFlag.FlagA;
                        break;
                    case 1:
                        flag = EnTagAccessFlag.FlagB;
                        break;
                    case 2:
                        flag = EnTagAccessFlag.FlagAandB;
                        break;
                }

                if ((mDotrUtil.setTxCycle(cycle)) &&
                        (mDotrUtil.setSession(session)) &&
                        (mDotrUtil.setTagAccessFlag(flag))) {
                    showToastByOtherThread("読み取り設定が完了しました。", Toast.LENGTH_SHORT);
                }
                break;
        }
    }


    /**
     * 主に別スレッドを考慮したイベントハンドラを記載します
     */
    public static final int MSG_QUIT = 9999;
    public static final int MSG_SHOW_TOAST = 20;
    public static final int MSG_BACK_COLOR = 21;
    public static final int MSG_INVENTORY_TAG = 22;
    private ConfigReaderDemoHandler mHandler = new ConfigReaderDemoHandler(ConfigReaderDemo.this);

    static class ConfigReaderDemoHandler extends Handler {
        private final WeakReference<ConfigReaderDemo> myActivity;

        ConfigReaderDemoHandler(ConfigReaderDemo activity) {
            myActivity = new WeakReference<>(activity);
        }

        @Override
        public void handleMessage(Message msg) {
            ConfigReaderDemo activity = myActivity.get();
            switch (msg.what) {
                case MSG_QUIT:
                    activity.closeApp();
                    break;
                case MSG_SHOW_TOAST:
                    if (msg.arg1 > 0) {
                        Toast.makeText(activity.getApplicationContext(), (String) msg.obj, Toast.LENGTH_LONG).show();
                    } else {
                        Toast.makeText(activity.getApplicationContext(), (String) msg.obj, Toast.LENGTH_SHORT).show();
                    }
                    break;
                case MSG_BACK_COLOR:
                    activity.mTabHost.setBackgroundColor(msg.arg2);//背景色変更
                    break;
            }
        }
    }


    private void closeApp() {
        android.os.Process.killProcess(android.os.Process.myPid());
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
//                        ConfigReaderDemo.this.postCloseApp();
//                    }
//                })
//                .setNegativeButton("No", new DialogInterface.OnClickListener() {
//                    public void onClick(DialogInterface dialog, int whichButton) {
//                    }
//                }).create().show();
    }


    private void getSetting() {
        //バッテリー残量取得
        int level = mDotrUtil.getBatteryLevel();
        if (level >= 0) {
            mProgressBarBattBuzzer.setProgress(level);
            mProgressBarBattPower.setProgress(level);
            mProgressBarBattRadio.setProgress(level);
            mProgressBarBattChannel.setProgress(level);

            mTxtBattBuzzer.setText(String.valueOf(level) + "%");
            mTxtBattPower.setText(String.valueOf(level) + "%");
            mTxtBattRadio.setText(String.valueOf(level) + "%");
            mTxtBattChannel.setText(String.valueOf(level) + "%");
        }

        //ブザー音量取得
        EnBuzzerVolume vol = mDotrUtil.getBuzzerVolume();
        if (vol != EnBuzzerVolume.Unknown) {
            mSeekBarBuzzer.setProgress(vol.getValue());
            mTxtBuzzer.setText(vol.toString());
        }

        //自動電源OFF時間取得
        int sec = mDotrUtil.getPowerOffDelay();
        if (sec >= 0) {
            int secIndex = 0;
            for (int i = 0; i < timetable.length; i++) {
                if (sec <= timetable[i]) {
                    secIndex = i;
                    break;
                }
            }
            mSeekBarPower.setProgress(secIndex);
            mTxtPower.setText(String.valueOf(timetable[secIndex]));
        }

        //電波出力強度取得
        int powMax = mDotrUtil.getMaxRadioPower();    //最大出力
        int powNow = mDotrUtil.getRadioPower();       //現在出力
        mTxtRadioMax.setText(String.valueOf(powMax) + "dBm");
        mTxtRadioNow.setText(String.valueOf(powNow) + "dBm");

        if (vol != EnBuzzerVolume.Unknown) {
            mSeekBarRadio.setProgress(powMax - powNow);
            mTxtRadio.setText("-" + String.valueOf(powMax - powNow) + "dBm");
        }

        //電波出力チャネル取得
        EnChannel[] channels = mDotrUtil.getRadioChannel();
        for (EnChannel ch : EnChannel.values()) {
            boolean use = false;
            for (EnChannel ch2 : channels) {
                if (ch2 == ch || ch2 == EnChannel.ALL) {
                    use = true;
                    break;
                }
            }

            switch (ch) {
                case Ch05:
                    mChkCh8.setChecked(use);
                    break;
                case Ch11:
                    mChkCh9.setChecked(use);
                    break;
                case Ch17:
                    mChkCh10.setChecked(use);
                    break;
                case Ch23:
                    mChkCh11.setChecked(use);
                    break;
                case Ch24:
                    mChkCh12.setChecked(use);
                    break;
                case Ch25:
                    mChkCh13.setChecked(use);
                    break;
            }

        }

        //電波照射時間を取得して画面へセット
        int cycle = mDotrUtil.getTxCycle();
        if (cycle >= 40) {
            mTxtRadioCycle.setText(String.valueOf(cycle) + "msec");
            mSeekRadioCycle.setProgress(cycle - 40);
        }

        //使用セッションを取得して画面へセット
        EnSession session = mDotrUtil.getSession();
        switch (session) {
            case Session0:
                mSpinnerSession.setSelection(0);
                break;
            case Session1:
                mSpinnerSession.setSelection(1);
                break;
            case Session2:
                mSpinnerSession.setSelection(2);
                break;
            case Session3:
                mSpinnerSession.setSelection(3);
                break;
            case NotSet:
                break;
        }

        //読み取りモードを取得して画面へセット
        EnTagAccessFlag flag = mDotrUtil.getTagAccessFlag();
        switch (flag) {
            case FlagA:
                mSpinnerReadMode.setSelection(0);
                break;
            case FlagB:
                mSpinnerReadMode.setSelection(1);
                break;
            case FlagAandB:
                mSpinnerReadMode.setSelection(2);
                break;
            case NotSet:
                break;
        }

        //ファームウェアバージョンを取得し、各画面へセット
        String ver = mDotrUtil.getFirmwareVersion();
        mTxtFirmBuzzer.setText(ver);
        mTxtFirmChannel.setText(ver);
        mTxtFirmPower.setText(ver);
        mTxtFirmRadio.setText(ver);
        mTxtFirmReadMode.setText(ver);

    }


    static final int ListBtDevice_Activity = 1;
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
        if (strName == null || strAddress == null) return;

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
    private String getAutoConnectDeviceAddr() {
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


    /*
     * 接続完了イベント
     * (非 Javadoc)
     * @see jp.co.tss21.uhfrfid.dotr_android.OnDotrEventListener#onConnected()
     */
    @Override
    public void onConnected() {
        Log.d(TAG, "onConnected");

        mHandler.sendMessage(mHandler.obtainMessage(MSG_BACK_COLOR, Toast.LENGTH_SHORT, getResources().getColor(R.color.background_connect), null));
        showToastByOtherThread("接続しました。", Toast.LENGTH_SHORT);
    }


    /*
     * 接続解除イベント
     * (非 Javadoc)
     * @see jp.co.tss21.uhfrfid.dotr_android.OnDotrEventListener#onDisconnected()
     */
    @Override
    public void onDisconnected() {
        Log.d(TAG, "onDisconnected");

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
    public void onScanCode(String code){
        Log.d(TAG, "onScanCode(" + code + ")");
    }


    @Override
    public void onScanTriggerChanged(boolean trigger){
        Log.d(TAG, "onScanTriggerChanged(" + trigger + ")");
    }


    /**
     * ---------------------------------------- ----------------------------------------
     * シークバー用
     * ---------------------------------------- ----------------------------------------
     */
    void setTextBuzzerVolume(SeekBar seekBar) {
        switch (seekBar.getProgress()) {
            case 0:
                mTxtBuzzer.setText(EnBuzzerVolume.Mute.toString());
                break;
            case 1:
                mTxtBuzzer.setText(EnBuzzerVolume.Low.toString());
                break;
            case 2:
                mTxtBuzzer.setText(EnBuzzerVolume.High.toString());
                break;
        }
    }


    final int[] timetable = new int[]{
            0, 30, 60, 90, 120,
            180, 240, 300, 600, 900,
            1200, 2400, 3600, 7200};

    void setTextPower(SeekBar seekBar) {
        mTxtPower.setText(String.valueOf(timetable[seekBar.getProgress()]) + "秒");
    }


    void setTextRadio(SeekBar seekBar) {
        mTxtRadio.setText("-" + String.valueOf(seekBar.getProgress()) + "dBm");
    }


    //電波照射時間を画面表示する
    void setTextRadioCycle(SeekBar seekBar) {
        mTxtRadioCycle.setText(String.valueOf(seekBar.getProgress() + 40) + "msec");
    }


    @Override
    public void onProgressChanged(SeekBar arg0, int arg1, boolean arg2) {
        switch (arg0.getId()) {
            case R.id.seekBar_buzzer:
                setTextBuzzerVolume(arg0);
                break;
            case R.id.seekBar_power:
                setTextPower(arg0);
                break;
            case R.id.seekBar_radio:
                setTextRadio(arg0);
                break;
            case R.id.seekBar_radio_cycle:
                setTextRadioCycle(arg0);
                break;
        }
    }


    @Override
    public void onStartTrackingTouch(SeekBar seekBar) {
        // TODO 自動生成されたメソッド・スタブ
    }


    @Override
    public void onStopTrackingTouch(SeekBar seekBar) {
        // TODO 自動生成されたメソッド・スタブ
    }


    @Override
    public void onTagMemoryLocked(String arg0) {
        // TODO 自動生成されたメソッド・スタブ
    }
}