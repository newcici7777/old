---
title: code sharing
date: 2025-03-24
keywords: android
---
Design Patten:
1. Oberseve觀察者模式
2. CallBack模式
3. MVP(Model-View-Presenter)

MVP(Model-View-Presenter)
1. View : 負責繪製UI元素，簡單來說就是Activity以及Fragment。
2. View interface : 需要View的實現接口，View 通過View interface 與 Presenter進行交互，降低耦合，方便進行單元測試。
3. Model : 負責儲存、搜尋、操作資料數據(有時候也會實現一個Model interface用來降低耦合)。
4. Presenter : 作為View與Model交互的橋樑，處理與用戶對應的邏輯功能。

MVP優點
MVP的P把所有與用戶對應的邏輯都集中在這裡，所以可以透過MOCK一個View及Model來測試P。降低程式耦合性。
讓架構更清楚了解，其實最大的好處是方便測試和移植

MVP：
- View不直接與Model交互，而是通過與Presenter交互來與Model間接交互 
  Presenter與View的交互是通過接口來進行的，更有利於添加單元測試 
- 通常View與Presenter是一對一的，但複雜的View可能綁定多個Presenter來處理邏輯
這樣的話，Activity的工作變簡單了，只用來響應生命週期，其他工作都丟到Presenter中去完成。

Code:
View Interface
{% highlight java linenos %}
public interface LoginView extends BaseView{
  void goToLoginPage();
  void goToMainPage();
  void goToDownloadMultyPage();
  void goToStorePage();
  void goToBuyLicense();
  void goToBuyMultyPage();
}
{% endhighlight %}

View(Activity)
{% highlight java linenos %}
public abstract class BaseActivity extends AppCompatActivity implements IObserver, LoginView{
  @Override
  protected void onResume() {
    loginPresenter = new LoginPresenter(context);
    loginPresenter.checkAccessTokenExpire();
  }
  @Override
  public void goToLoginPage() {
    Intent ssoIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(SecurityConstant.SSO_LOGIN));
    startActivity(ssoIntent);
    finish();
  }
  @Override
  public void goToMainPage() {
    LogUtil.d(TAG, "回到主頁面");
    Intent intent = new Intent(this, MainActivity.class);
    startActivity(intent);
    finish();
  }
  @Override
  public void goToDownloadMultyPage() {
    Intent intent = new Intent(this, InstallMultyActivity.class);
    startActivity(intent);
    finish();
  }
  @Override
  public void goToStorePage() {
    Intent intent = new Intent(this, DeepLinkActivity.class);
    startActivity(intent);
    finish();
  }
  @Override
  public void goToBuyLicense() {
    Intent intent = new Intent(this, NoLicense.class);
    startActivity(intent);
    finish();
  }
  @Override
  public void goToBuyMultyPage() {
    Intent intent = new Intent(this, BuyMultyActivity.class);
    startActivity(intent);
    finish();
  }
}
{% endhighlight %}

Precenter
{% highlight java linenos %}
public class LoginPresenter implements IObserver {   
  private static LoginPresenter mInstance;
  public static LoginPresenter getmInstance(WeakReference<Context> context){
    if(mInstance == null) {
      synchronized (LoginPresenter.class) {
        if (mInstance == null) {
          mInstance = new LoginPresenter(context);
        }
      }
    }
    return mInstance;
  }
  private LoginPresenter(WeakReference<Context> context) {
    mWeakContext = context;
    mContext = context.get();
    loginView = (LoginView) context.get();
  }
  public void checkAccessTokenExpire() {
    getTokenData();
    String access_token = AppData.getData(SecurityConstant.ACCESS_TOKEN);
    String refresh_token = AppData.getData(SecurityConstant.REFRESH_TOKEN);
    String access_token_timestamp = AppData.getData(SecurityConstant.ACCESS_TIMESTAMP);

    if (access_token != null && !"".equals(access_token) &&
        refresh_token != null && !"".equals(refresh_token) &&
        access_token_timestamp != null && !access_token_timestamp.equals("")) {
        .......
    } else {
      if (refresh_token != null && !"".equals(refresh_token)) {
        ssoApi.getAccessTokenWithRefreshToken(refresh_token);
      } else {
        //開啟登入頁面
        loginView.goToLoginPage();
      }

    }
  }
}
{% endhighlight %}

Observe觀察者模式

「訂閱」後就能自動收到更新通知 的概念，
即是 觀察者模式 (Observer Pattern)。
那些被訂閱、被追蹤、被觀察的，稱為 — 主題/目標 (Subject)
而對主題感興趣的我們，則是 — 觀察者 (Observer) 
Code

觀察者介面
{% highlight java linenos %}
public interface IObserver {
  void eventNotify(Context activity, IEvent eventType, String eventMsg);
}
{% endhighlight %}

通知者Notifier
{% highlight java linenos %}
public class Notifier {
  private static Notifier mInstance;
  private Looper mLooper;
  private List<WeakReference<?>> observerList;
  public static Notifier getmInstance() {
    if (mInstance == null) {
      synchronized (Notifier.class) {
        if (mInstance == null) {
          mInstance = new Notifier();
        }
      }
    }
    return mInstance;
  }
  private Notifier(){
    observerList = new ArrayList<>();
    RefWatcher refWatcher = MyApplication.getRefWatcher(MyApplication.getAppContext());
    refWatcher.watch(this);
  }
  public  void addObserver(WeakReference<?> observer){
    if(observerList!=null) {
      if(!observerList.contains(observer))
        observerList.add(observer);
    }
  }
  public  void removeObserver(IObserver observer){
    if(observerList!=null) {
      if(observerList.contains(observer))
        observerList.remove(observer);
    }
  }
  private static class MyHandler extends Handler {
    private Looper mLooper;
    public MyHandler(Looper looper) {
      super(looper);
      mLooper = looper;
    }
    public MyHandler(){
      super();
    }

    @Override
    public void handleMessage(Message msg) {
      super.handleMessage(msg);
    }
  }
  public void notifyEvent(final WeakReference<?> activity, final IEvent event, final String msg){
    Looper.prepare();
    MyHandler myHandler = null;
    if(activity.get() instanceof Activity) {
      myHandler = new MyHandler(Looper.getMainLooper());
    }else{
      myHandler = new MyHandler();
    }

    if(observerList.contains(activity)){
      MyRunnable runnable = new MyRunnable(activity,event,msg);
      if(runnable !=null) {
         myHandler.post(runnable);
      }
    }
    Looper.loop();
  }
  public static class MyRunnable implements Runnable {
    private WeakReference<?> activityRef;
    private IEvent mEvent;
    private String mMsg;
    public MyRunnable(WeakReference<?> activity,IEvent event,String msg) {
      activityRef = activity;
      mEvent = event;
      mMsg = msg;
    }
    public void run() {
      IObserver o = (IObserver) activityRef.get();
      o.eventNotify((Context) o,mEvent, mMsg);
    }
  }
}
{% endhighlight %}

觀察者實作

Okhttp
Callback function
GetEndDeviceListPrecenter

BaseActivity
{% highlight java linenos %}
public enum  ToolbarType {
  TOOLBAR,//沒側邊選單的toolbar
  DRAWER_TOOLBAR,//有側邊選單的toolbar
  NONE;//沒有任何一個toolbar
}
public abstract class BaseActivity extends AppCompatActivity {
  abstract int getLayoutId();
  abstract void initView(Bundle savedInstanceState);
  abstract Context getActivityContext();
  abstract ToolbarType getToolbarType();
}
{% endhighlight %}

繼承BaseActivity(實作抽象方法)
{% highlight java linenos %}
public class NoLicense extends BaseActivity {
  private static final String TAG = "NoLicense";
  @BindView(R.id.renew_btn)
  Button renewBtn;
  @BindView(R.id.no_license_title)
  TextView noLicenseTitle;
  @Override
  int getLayoutId() {
    return R.layout.activity_no_license;
  }
  @Override
  void initView(Bundle savedInstanceState) {
    ButterKnife.bind(this);
    fontChanger.replaceFonts((ViewGroup) findViewById(android.R.id.content));
    fontChangerBold.replaceFonts(renewBtn);
    fontChangerBold.replaceFonts(noLicenseTitle);
  }
  @Override
  Context getActivityContext() {
    return this;
  }
  @Override
  ToolbarType getToolbarType() {
    return ToolbarType.DRAWER_TOOLBAR;
  }
  @OnClick(R.id.renew_btn)
  public void onViewClicked() {
    Intent intent = new Intent(this, DeepLinkActivity.class);
    startActivity(intent);
    finish();
  }
}
{% endhighlight %}

BaseActivity繼承的兒子都可以用的
{% highlight java linenos %}
public abstract class BaseActivity extends AppCompatActivity implements IObserver, LoginView {
  private static String TAG = "BaseActivity";
  protected XmppController mXmppController;
  protected XmppConnectionPresenter mXmppConnectionPresenter;
  protected PushNotificationPresenter mPushNotificationPresenter;
  protected FontChangeCrawler fontChanger;
  protected FontChangeCrawler fontChangerBold;
  protected ImageButton menu_home_btn, menu_profile_btn, menu_dev_btn, menu_security_btn;
  protected Bundle savedInstanceState;
  private static WeakReference<Context> mContextWeakReference;
  @Override
  public void onBackPressed() {
    if (getActivityContext() instanceof MainActivity) {
      super.onBackPressed();
    } else if (getToolbarType() == ToolbarType.DRAWER_TOOLBAR) {//是主要四個頁面
      Intent intent = new Intent(getActivityContext(), MainActivity.class);
      startActivity(intent);
      finish();
    } else if (getToolbarType() == ToolbarType.TOOLBAR || getToolbarType() == ToolbarType.NONE) {
      super.onBackPressed();
    }
  }
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(getLayoutId());
    this.savedInstanceState = savedInstanceState;
    mContextWeakReference = new WeakReference<Context>(this);
    //檢查網路
    int connectionType = APPUtils.checkConnectionType(this);
    if (connectionType == 0) {
      HttpError(EnumError.NO_INTERNET_CONNECTION, "network error");
    }
    Notifier.getmInstance().addObserver(this);
    mXmppController = XmppController.getmInstance(mContextWeakReference.get());
    mXmppConnectionPresenter = XmppConnectionPresenter.getmInstance(mContextWeakReference.get());
    fontChanger = new FontChangeCrawler(getAssets(), "fonts/GOTHIC.TTF");
    fontChangerBold = new FontChangeCrawler(getAssets(), "fonts/GOTHICB.TTF");
    //判斷是否有toolbar
    switch (getToolbarType()) {
      case DRAWER_TOOLBAR:
        getDrawerToolBarSetting();
        getMenuList();
        break;
      case TOOLBAR:
        getNoDrawerToolbarSetting();
        break;
      case NONE:
        break;
      default:
        break;

    }
//    initView(savedInstanceState);
  }
  @Override
  protected void onDestroy() {
    super.onDestroy();
    dismissLoadView();
  }
  protected Toolbar getToolBarSetting() {
    return toolbar;
  }
  private void getNoDrawerToolbarSetting() {
    toolbar = findViewById(R.id.my_toolbar);
    if (toolbar != null) {
      setSupportActionBar(toolbar);
      ActionBar actionBar = getSupportActionBar();
      // Enable the Up button
      actionBar.setDisplayHomeAsUpEnabled(true);
      //actionBar.setTitle(R.string.activate);
      getSupportActionBar().setDisplayShowTitleEnabled(false);
      getSupportActionBar().setHomeAsUpIndicator(R.drawable.all_btn_a_back_0);
      toolbar.setNavigationOnClickListener(new View.OnClickListener() {
        @Override
        public void onClick(View v) {
          onBackPressed();
        }
      });
    }
  }
  private void getDrawerToolBarSetting() {
    toolbar = (Toolbar) findViewById(R.id.toolbar);
    setSupportActionBar(toolbar);
    //toolbar.setTitleTextColor(Color.parseColor("#ffffff"));

    DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
    ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
        this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
    drawer.addDrawerListener(toggle);
    toggle.syncState();
    // 在Toolbar做最左边加上导航按钮
    getSupportActionBar().setTitle("");
    getSupportActionBar().setDisplayHomeAsUpEnabled(true);
    getSupportActionBar().setHomeAsUpIndicator(R.drawable.homefirewall_image_android_b_menu);
    getSupportActionBar().setHomeButtonEnabled(true);
    drawer.setLayoutDirection(View.LAYOUT_DIRECTION_LTR);
  }
  private void getMenuList() {
    ListView mListView = findViewById(R.id.menu_list);
    String[] menuArray = getResources().getStringArray(R.array.menuArray);
    int[] resIdArray = {R.drawable.g1_logo_a_help_0, R.drawable.icon_forum, R.drawable.g1_logo_a_feedback_0, R.drawable.icon_notification, R.drawable.g1_logo_a_faq_0};
    mListView.setAdapter(new MenuAdapter(this, menuArray, resIdArray));
    HttpApi httpApi = new HttpApi(mContextWeakReference.get());
    mListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
      @Override
      public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        if (getActivityContext() != null) {
          switch (position) {
            case 0:
              Intent FAQActivityIntent = new Intent(getActivityContext(), FAQActivity.class);
              startActivity(FAQActivityIntent);
              finish();
              break;
            case 1:
              Intent ForumActivityIntent = new Intent(getActivityContext(), ForumActivity.class);
              startActivity(ForumActivityIntent);
              finish();
              break;
            case 2://send feedback
              LogUtil.d(TAG,"here....1");
              mSendFeedBackPresenter.getDownloadURL_XMPP_APP_LogFile();
              break;
            case 3:
              //取得license過期的狀態
              SettingRepo settingRepo = new SettingRepo();
              String status = settingRepo.getSetting(SecurityConstant.IS_Expire);
              LogUtil.d(TAG, "expired status:" + status);
              if (status != null) {
                ExpireStatus expireStatus = ExpireStatus.fromStr(status);
                //過期後，點擊直接導 到noLicenseActivity
                if (expireStatus == ExpireStatus.YES) {
                } else {
                  Intent NotificationIntent = new Intent(getActivityContext(), NotificationSettingActivity.class);
                  startActivity(NotificationIntent);
                  finish();
                }
              }
              break;
            case 4:
              // get a list of running processes and iterate through them
              ActivityManager am = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
              // get the info from the currently running task
              List<ActivityManager.RunningTaskInfo> taskInfo = am.getRunningTasks(1);
              LogUtil.d(TAG, "CURRENT Activity ::" + taskInfo.get(0).topActivity.getClassName());
              Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://www.zyxel.com/AiShieldDeploy/"));
              startActivity(browserIntent);
              break;
          }
        } else {
          LogUtil.d(TAG, "onItemClick: getActivityContext() is null");
        }
      }
    });
    //下方menui設定
    BottomMenuSetting();
  }
  protected void BottomMenuSetting() {
    menu_home_btn = findViewById(R.id.menu_home_btn);
    if (menu_home_btn != null) {
      menu_home_btn.setOnClickListener(view -> {
        ActivityManager am = (ActivityManager) getApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
        ComponentName cn = am.getRunningTasks(1).get(0).topActivity;
        LogUtil.d(TAG, "current activity = " + cn.getClassName());
        if (cn.getClassName().equalsIgnoreCase("zyxel.security.MainActivity")) {
        } else {
          Intent intent0 = new Intent(getActivityContext(), MainActivity.class);
          startActivity(intent0);
          finish();
        }
      });
    }
    menu_security_btn = findViewById(R.id.menu_security_btn);
    if (menu_security_btn != null) {
      menu_security_btn.setOnClickListener(view -> {
        if (getActivityContext() instanceof TimeChartActivity) {
          //如果目前的activity是timechartactivity，就不再導入timechart activity
        } else {
          Intent intent0 = new Intent(getActivityContext(), TimeChartActivity.class);
          startActivity(intent0);
          finish();
        }
      });
    }
    menu_profile_btn = findViewById(R.id.menu_profile_btn);
    if (menu_profile_btn != null) {
      menu_profile_btn.setOnClickListener(view -> {
        ActivityManager am = (ActivityManager) getApplicationContext().getSystemService(Context.ACTIVITY_SERVICE);
        ComponentName cn = am.getRunningTasks(1).get(0).topActivity;
        LogUtil.d(TAG, "current activity = " + cn.getClassName());
        if (cn.getClassName().equalsIgnoreCase("zyxel.security.AccessControlActivity")) {
        } else {
          Intent intent0 = new Intent(getActivityContext(), AccessControlActivity.class);
          startActivity(intent0);
          finish();
        }
      });
    }
    menu_dev_btn = findViewById(R.id.menu_dev_btn);
    if (menu_dev_btn != null) {
      menu_dev_btn.setOnClickListener(view -> {
        if (getActivityContext() instanceof DeviceListActivity) {
          //如果目前的activity是DeviceListActivity，就不再導入DeviceListActivity
        } else {
          Intent intent0 = new Intent(getActivityContext(), DeviceListActivity.class);
          startActivity(intent0);
          finish();
        }
      });
    }
    if (getActivityContext() instanceof MainActivity) {
      menu_home_btn.setImageResource(R.drawable.homefirewall_image_android_b_dashboard_select);
    } else if (getActivityContext() instanceof TimeChartActivity) {
      menu_security_btn.setImageResource(R.drawable.homefirewall_image_android_b_secutity_select);
    } else if (getActivityContext() instanceof DeviceListActivity) {
      menu_dev_btn.setImageResource(R.drawable.homefirewall_image_android_b_devicelist_select);
    } else if (getActivityContext() instanceof AccessControlActivity) {
      menu_profile_btn.setImageResource(R.drawable.homefirewall_image_android_b_accesscontrol_select);
    }
    //取得license過期的狀態
    SettingRepo settingRepo = new SettingRepo();
    String status = settingRepo.getSetting(SecurityConstant.IS_Expire);
    LogUtil.d(TAG, "expired status:" + status);
    if (status != null) {
      ExpireStatus expireStatus = ExpireStatus.fromStr(status);
      //過期後，點擊直接導 到noLicenseActivity
      if (expireStatus == ExpireStatus.YES) {
        if (menu_home_btn != null) {
          menu_home_btn.setOnClickListener(view -> {
//            if (getActivityContext() instanceof NoLicense) {
//
//            } else {
//              Intent intent0 = new Intent(getActivityContext(), NoLicense.class);
//              startActivity(intent0);
//              finish();
//            }
            Intent intent0 = new Intent(getActivityContext(), MainActivity.class);
            startActivity(intent0);
            finish();
          });
        }
        //過期後，點擊直接導 到OopsActivity
        if (menu_profile_btn != null) {
          menu_profile_btn.setOnClickListener(view -> {
            Intent intent0 = new Intent(getActivityContext(), OopsActivity.class);
            intent0.putExtra("from", AccessControlActivity.class.getSimpleName());
            startActivity(intent0);
            finish();
          });
        }
        //過期後，點擊直接導 到OopsActivity
        if (menu_dev_btn != null) {
          menu_dev_btn.setOnClickListener(view -> {
            Intent intent0 = new Intent(getActivityContext(), OopsActivity.class);
            intent0.putExtra("from", DeviceListActivity.class.getSimpleName());
            startActivity(intent0);
            finish();
          });
        }
        //menu下方四個按鈕的圖片顯示被選取
        if (getActivityContext() instanceof NoLicense) {
          if (menu_home_btn != null)
            menu_home_btn.setImageResource(R.drawable.homefirewall_image_android_b_dashboard_select);
        } else if (getActivityContext() instanceof TimeChartActivity) {
          if (menu_security_btn != null)
            menu_security_btn.setImageResource(R.drawable.homefirewall_image_android_b_secutity_select);
        } else if (getActivityContext() instanceof OopsActivity) {
          String from = getIntent().getStringExtra("from");
          if (from.equals(AccessControlActivity.class.getSimpleName())) {
            if (menu_profile_btn != null)
              menu_profile_btn.setImageResource(R.drawable.homefirewall_image_android_b_accesscontrol_select);
          } else if (from.equals(DeviceListActivity.class.getSimpleName())) {
            if (menu_dev_btn != null)
              menu_dev_btn.setImageResource(R.drawable.homefirewall_image_android_b_devicelist_select);
          }
        }
        //如果目前頁面是AccessControl,DeviceList,DeviceDetail就導頁到OopsActivity，因為已經過期了，不能瀏覽原本頁面
        if (getActivityContext() instanceof AccessControlActivity) {
          Intent intent0 = new Intent(getActivityContext(), OopsActivity.class);
          intent0.putExtra("from", AccessControlActivity.class.getSimpleName());
          startActivity(intent0);
          finish();
        }
        if (getActivityContext() instanceof DeviceListActivity || getActivityContext() instanceof DeviceDetailActivity) {
          Intent intent0 = new Intent(getActivityContext(), OopsActivity.class);
          intent0.putExtra("from", DeviceListActivity.class.getSimpleName());
          startActivity(intent0);
          finish();
        }
      }
    }
  }
  /**
   * 顯示Load View
   * 因BaseView也有定義showLoadView，都是呼叫BaseActivity的showLoadView()，但Inteface預設定義method是public
   */
  public void showLoadView() {
    View view = getRootView();
    if (progressWindow == null) {
      progressWindow = new ProgressWindow(getActivityContext(), view);
    }
    if (!progressWindow.isShowing())
      view.post(() -> {
        progressWindow.show();
      });
  }
  /**
   * 關閉Load View
   */
  public void dismissLoadView() {
    try {
      if (progressWindow != null && progressWindow.isShowing()) {
        progressWindow.dismissWindow();
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
  public void HttpError(EnumError error_code, String errorMsg) {
    Log.d(TAG, "Error Activity: " + getActivityContext());
    String msg = "";
    try {
      JSONObject jsonObject = new JSONObject(errorMsg);
      msg = jsonObject.getString("message");
    } catch (JSONException e) {
      APPUtils.printStack(e);
      msg = errorMsg;
    }
    LogUtil.d(TAG, "error msg:" + msg);
    LogUtil.d(TAG, "error code:" + error_code);
    Intent intent = new Intent(getActivityContext(), ErrorPageActivity.class);
    intent.putExtra(SecurityConstant.ERR_MSG, msg);
    intent.putExtra(SecurityConstant.ERR_CODE, error_code);
    startActivity(intent);
    finish();
  }
  @Subscribe
  public void receivedXmppEvent(NotifyXmppEvent notifyXmppEvent) {
    LogUtil.getmInstance(getActivityContext()).d(TAG, "Bass Otto Event xmpp event = " + notifyXmppEvent.getRequestType() + " --> " + notifyXmppEvent.getResponseCode());
    switch (notifyXmppEvent.getRequestType()) {
      case CONNECTED_TO_XMPP_SERVER:
        break;
      case DISCONNECTED_FROM_XMPP_SERVER:
        LogUtil.d(TAG, "receivedXmppEvent: disconnect");
      case TIMEOUT:
        LogUtil.d(TAG, "xmpp timeout");
      case ERROR:
        dismissLoadView();
        try {
          String errorType = (String) notifyXmppEvent.responseData;
          LogUtil.d(TAG, "XMPP ERROR Type = " + errorType);
          LogUtil.d(TAG, "xmpp error");
          if (errorType.equals("wait")) {
            goToErrorPage(EnumError.MULTY_OFFLINE, "xmpp error");
          } else {
            goToErrorPage(EnumError.SERVER_ERROR, "xmpp error");
          }
        } catch (Exception e) {
          e.printStackTrace();
          goToErrorPage(EnumError.SERVER_ERROR, "xmpp error");
        }
        break;
      case CONNECTION_ERROR:
        myHandler.postDelayed(reconnectingRunnable, 1000);
        break;
    }
  }
  Runnable reconnectingRunnable = new Runnable() {
    @Override
    public void run() {
      LogUtil.d(TAG, "reconnectingRunnable !!");
      LogUtil.d(TAG, "is login = " + AppConfigs.isLogin);
      if (APPUtils.checkConnectionType(getApplicationContext()) != 0) {
        mXmppConnectionPresenter.connectWithSSO();
      } else {
        if (isConnectInternetDialogShow == false) {
          isConnectInternetDialogShow = true;
          AlertDialog alertDialog = alertWithCallback(R.string.alert_network).setNegativeButton(R.string.alert_confirm, (dialog, which) -> {
            isConnectInternetDialogShow = false;
            myHandler.postDelayed(reconnectingRunnable, 3000);
          }).create();
          alertDialog.show();
        }
      }
    }
  };
}
{% endhighlight %}

ShareData

Gradle
{% highlight groovy linenos %}
buildConfigField "String", "MULTY_CONTENT_PROVIDER", '"content://com.zyxel.multyx.provider/aishield"'
{% endhighlight %}

{% highlight java linenos %}
public class MultyContentProvider {
  private static final String TAG = "MultyContentProvider";
  private Context context;
  private ContentResolver resolver;
  private Uri uri = Uri.parse(BuildConfig.MULTY_CONTENT_PROVIDER);
  public MultyContentProvider(Context context) {
    this.context = context;
    resolver = context.getContentResolver();
  }
  public Map<String,String> Query() {
    try {
      String[] fields = new String[]{"_id", "mac", "model_name", "access_token", "refresh_token", "expired_timestamp"};//sql select 欄位
      Cursor cursor = resolver.query(uri, fields, null, null, null);
      if (cursor != null) {
        Map<String, String> rtnMap = new HashMap<>();
        cursor.moveToFirst();
        String id = null;
        for (int i = 0; i < cursor.getCount(); i++) {
          id = cursor.getString(0);
          LogUtil.d(TAG, "shared data id = " + cursor.getString(0));
          LogUtil.d(TAG, "shared data mac = " + cursor.getString(1));
          LogUtil.d(TAG, "model name = " + cursor.getString(2));
          LogUtil.d(TAG, "shared data access token = " + cursor.getString(3));
          LogUtil.d(TAG, "shared data refresh token = " + cursor.getString(4));
          LogUtil.d(TAG, "shared data expired timestamp = " + cursor.getString(5));
          rtnMap.put(SecurityConstant.MULTY_ID, cursor.getString(0));
          rtnMap.put(SecurityConstant.FOCUS_MAC, cursor.getString(1));
          rtnMap.put(SecurityConstant.MULTY_MODEL, cursor.getString(2));
          rtnMap.put(SecurityConstant.ACCESS_TOKEN, cursor.getString(3));
          rtnMap.put(SecurityConstant.REFRESH_TOKEN, cursor.getString(4));
          rtnMap.put(SecurityConstant.ACCESS_TIMESTAMP, cursor.getString(5));
//          AppData.setData(SecurityConstant.MULTY_ID,cursor.getString(0));
//          AppData.setData(SecurityConstant.FOCUS_MAC,cursor.getString(1));
//          AppData.setData(SecurityConstant.MULTY_MODEL,cursor.getString(2));
//
//          AppData.setData(SecurityConstant.MULTY_ACCESS_TOKEN,cursor.getString(3));
//          AppData.setData(SecurityConstant.MULTY_REFRESH_TOKEN,cursor.getString(4));
//          AppData.setData(SecurityConstant.MULTY_ACCESS_TIMESTAMP,cursor.getString(5));
          //cursor.moveToNext();
        }
        cursor.close();
        cursor.setNotificationUri(context.getContentResolver(), uri);
        return rtnMap;
      }
    } catch (Exception e) {
      APPUtils.printStack(e);
    }
    return null;
  }
  public void Update(String id,String access_token,String refresh_token,String expired_timestamp) {
    try {
      if (APPUtils.ISNULL(id) && APPUtils.ISNULL(id) && APPUtils.ISNULL(id) && APPUtils.ISNULL(id)) {
        LogUtil.d(TAG,"id/access_token/refresh_token/expired_timestamp is null.please check it out.");
      }else{
        ContentValues newRow = new ContentValues();
        newRow.put("access_token", access_token);
        newRow.put("refresh_token", refresh_token);
        newRow.put("expired_timestamp", expired_timestamp);
        StringBuffer where = new StringBuffer("_id= ? ");
        String[] whereArg = {id};
        resolver.update(uri, newRow, where.toString(), whereArg);
      }
    } catch (Exception e) {
      APPUtils.printStack(e);
    }
    //resolver.insert(uri, newRow);
    //
  }
}
{% endhighlight %}

Open Store Front End  
Activity:DeepLinkActivity.java  

ObjectStorage  
Step1:取得Site Name(從ObjectStorage)，若沒有site name用預設  

Xmpp  
Step2:取得xmpp連線(若已經連過，就不用連)  
Step3:取得network id(若已經取得過，就不用再取)  
Setp4:取得Store Access Token  

Cloud  
Step5:將取得Store Access Token及Site name帶入，並判斷型號 

WSQ50  
store_url = BuildConfig.STORE_BASE_URL +"x/licenses?redirect_uri=aishieldxx://aihost/login&access_token=" + storeAccessToken + "&locale="+ Locale.getDefault().getLanguage()
+"&site_name="+site_name;  

WSQ60  
store_url = BuildConfig.STORE_BASE_URL + "plus/licenses?redirect_uri=aishieldxx://aihost/login&access_token=" + storeAccessToken + "&locale="+ Locale.getDefault().getLanguage()" +"&site_name="+site_name;
Step6:url encoding  
Step7:打開網頁  
{% highlight java linenos %}
CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();  
CustomTabsIntent customTabsIntent = builder.build();  
customTabsIntent.intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);  
if (cnt == 0) {
  customTabsIntent.launchUrl(this, Uri.parse(store_url));
}
{% endhighlight %}

Xmpp
Step8:觸發Smart Polling

購買完，按下x的按鈕或WebStroe “Done”的按鈕。
到TransActivity
Step9:觸發Smart Polling
Step10:清掉cache，導到License處理中的Activity

License Process Activity
Step11:判斷是否有處理中的License(Processing=True), 若有的話，五秒後再問一遍，直到沒有處理中的Lincese
{% highlight java linenos %}
new Handler().postDelayed(() -> httpApi.getExpirationStatus(AppData.getData(SecurityConstant.STORE_ACCESS_TOKEN)), 5000);
{% endhighlight %}

Xmpp
Step12:若沒有處理中的License(Processing==False),觸發Once Polling
Step13:判斷ExpirationStatus的api中，若expire_date是null或空的，但process是false代表，已經處理完但Portal過期，接下來問Device有沒有過期
若Device回過期，就導致NoLicese的頁面,
若Device回沒過期，就5秒後繼續問expirationStatus的api(回到Step11)

Step14:若expire_date有值且大於今天代表potal沒過期，詢問device有沒有過期。若expire_date是小於今天，代表potal過期，回到Step13的步驟。
若Device回過期，就5秒後繼續問expirationStatus的api(回到Step11)
若Device回沒過期，就導到MainPage

以下是完整的Code
{% highlight java linenos %}
@Override
void initView(Bundle savedInstanceState) {
  httpApi.getExpirationStatus(AppData.getData(SecurityConstant.STORE_ACCESS_TOKEN));
}
@Override
public void eventNotify(Context activity, IEvent eventType, String eventMsg) {
  if (!LicenseProcessActivity.this.isFinishing()) {//若activity沒有被finish才做
    super.eventNotify(activity, eventType, eventMsg);
    if (activity != this) { // 不相等就不做事
      return;
    }
    if (eventType instanceof HttpEvent) {
      HttpEvent event = (HttpEvent) eventType;
      switch (event) {
        case GET_EXPIRE_STATUS:
          try {
            JSONObject json = new JSONObject(eventMsg);
            expire_date_str = json.getString("expired_at");
            processing = json.getBoolean("processing");
          } catch (JSONException e) {
            e.printStackTrace();
          }
          LogUtil.d(TAG, "processing:" + processing);
          LogUtil.d(TAG, "expire_date_str:" + expire_date_str);
          if (processing) {//有正在處理中，5秒後再來問
            new Handler().postDelayed(() ->   httpApi.getExpirationStatus(AppData.getData(SecurityConstant.STORE_ACCESS_TOKEN)), 5000);
          } else {
            mXmppController.setStoreOncePolling();
          }
          break;
      }
    }
  }
}
@Subscribe
public void receivedXmppEvent(NotifyXmppEvent notifyXmppEvent) {
  if (!LicenseProcessActivity.this.isFinishing()) {//若activity沒有被finish才做
    super.receivedXmppEvent(notifyXmppEvent);
    dismissLoadView();
    LogUtil.d(TAG, "Otto Event xmpp event = " + notifyXmppEvent.getRequestType() + " --> " + notifyXmppEvent.getResponseCode());
    try {
      switch (notifyXmppEvent.getRequestType()) {
        case SET_STORE_ONCE_POLLING:
          //null就是potal過期了
          if (expire_date_str.equals("null") || "".equals(expire_date_str)) {
            isPortalLicenseExpired = true;//Portal過期了
            mXmppController.getCyberSecurityInfo(false);//判斷device有沒有過期,用false是因為不要再讀cache
          } else {
            Date expire_date = APPUtils.fromISO8601UTCSSS(expire_date_str);
            TimeZone tz = TimeZone.getTimeZone("UTC");
            Calendar cal = Calendar.getInstance(tz);
            long utc_now = cal.getTimeInMillis() / 1000L;
            if ((expire_date.getTime() / 1000) <= utc_now) {
              //過期了
               isPortalLicenseExpired = true;//Portal過期了
               mXmppController.getCyberSecurityInfo(false);//判斷device有沒有過期,用false是因為不要再讀cache
            } else {
              //沒過期
              isPortalLicenseExpired = false;//Portal沒過期
              mXmppController.getCyberSecurityInfo(false);//判斷device有沒有過期,用false是因為不要再讀cache
            }
          }
          break;
        case GET_CYBER_SECURITY_INFO:
          StructCyberSecurity structCyberSecurity = (StructCyberSecurity) notifyXmppEvent.getresponseData();
          if (!structCyberSecurity.getStatus().equals(EnumSecurityFeatureStatus.ENUM_ENABLED)) {//device過期
            LogUtil.d(TAG, "device過期:");
            if (isPortalLicenseExpired) {//portal過期
              LogUtil.d(TAG, "portal過期:");
              settingRepo.insertUpdateSetting(SecurityConstant.IS_Expire, ExpireStatus.YES.value());
              Intent intent = new Intent(this, NoLicense.class);
              startActivity(intent);
              finish();
            } else {
              LogUtil.d(TAG, "portal沒過過期:");
              //portal沒過期
              new Handler().postDelayed(() -> httpApi.getExpirationStatus(AppData.getData(SecurityConstant.STORE_ACCESS_TOKEN)), 5000);//五秒後再次重新判斷
            }
          } else {//device沒過期
            LogUtil.d(TAG, "device沒過期:");
            //potal過期,device沒過期,視同沒過期
            //potal沒過期，device沒過期，視同沒過期
            settingRepo.insertUpdateSetting(SecurityConstant.IS_Expire, ExpireStatus.NO.value());
            Intent intent = new Intent(this, MainActivity.class);
            startActivity(intent);
            finish();
          }
          break;
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
{% endhighlight %}


MainActivity(判斷Licnese)

Xmpp
Step1:GET_CyberSecurityInfo詢問Device有沒有過期。並把Device過期的結果存在手機的資料庫中。  
{% highlight java linenos %}
if (!structCyberSecurity.getStatus().equals(EnumSecurityFeatureStatus.ENUM_ENABLED)) {
  settingRepo.insertUpdateSetting(SecurityConstant.IS_Expire, ExpireStatus.YES.value());
} else {
  settingRepo.insertUpdateSetting(SecurityConstant.IS_Expire, ExpireStatus.NO.value());
}
{% endhighlight %}
Step2:GET_NETWORK_ID(並且存入multy50/60型號(若呼叫過，則不call  zap)  
Step3:GET_STORE_ACCESS_TOKEN,若Store Access Token是空的，要導到error page  
Step4:get Credentilas  
Step5:GET_DEV_UUID  
若是取不到的話，就用舊的(ps:之前有針對這個做判斷，若取不到就error page，經討論後，取不到就是用之前舊的dev uuid，最糟的狀況就是取不到就是空)  

Cloud
Step6:若Device過期就導到No License，沒過期才做以下步驟  
Step7:先判斷License有沒有在處理中(Processing == True  or False)  
True處理中：將頁面導回License處理中的Actvity  
False處理完：呼叫v1/licenses/expiration_date  

Step8:
請參考
<https://docs.google.com/document/d/1F4onqD-4eiooJ0U7xyqVK2jC51l2jgmC-XNUN8c8ku8/edit#>


登入
1. 判斷有沒有Multy，
    - 若有multy判斷Multy的Token有沒有以及Focus site
    - 若沒有，Aishield就自已開瀏覽器登入
2. 取得user info
3. 取得PCloud paired Device
4. Multy存在
    - 判斷Pcloud paired Device的Mac跟focus Mac是否一樣
    - 型號是否相同
5. 若Step4沒有找到的話
    找出Pcolud Paired的Device,型號為WSQ50/60，並且數量只有一台，就以用xmpp連到這個device
    Paired Device數量超過2台(含)以上，就跳出error(no support model),以前是直接導到下載multy
6. 若Pcloud沒任何Paired過的device就跳出請安裝Multy的頁面。


GetEndDeviceListPrecenter.java

