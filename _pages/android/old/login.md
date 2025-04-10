---
title: login
date: 2023-05-17
keywords: android
---
只裝Multy，就用multy的share data  
只裝Armor，就用Armor的share data  
若二個App同時都有裝  
先判斷Armor/Multy誰的Expired_timestamp最接近現在日期，就讀取及寫入那個app的share data  

判斷要用那個Presenter  
{% highlight java linenos %}
public void setListener(WeakReference<Context> mWeakContext) {
    isMultyAppExist = APPUtils.isAppExist(mWeakContext, BuildConfig.MULTY_PACKAGE);
    isArmorAppExist = APPUtils.isAppExist(mWeakContext, BuildConfig.ARMOR_PACKAGE);
    shareDataContentProvider = ShareDataContentProvider.getmInstance();
    if (isMultyAppExist && isArmorAppExist) {//armor與multy同時存在
      long armor_accesstoken_expire_value = 0l;
      long multy_accesstoken_expire_value = 0l;
      Map<String, String> multy_sharedata = shareDataContentProvider.Query(BuildConfig.MULTY_CONTENT_PROVIDER);
      if (multy_sharedata != null && multy_sharedata.size() > 0) {
        multy_accesstoken_expire_value = TextUtils.isEmpty(multy_sharedata.get(ACCESS_TIMESTAMP)) ? 0l : Long.valueOf(multy_sharedata.get(ACCESS_TIMESTAMP));
      }
      Map<String, String> armor_sharedata = shareDataContentProvider.Query(BuildConfig.ARMOR_CONTENT_PROVIDER);
      if (armor_sharedata != null && armor_sharedata.size() > 0) {
        armor_accesstoken_expire_value = TextUtils.isEmpty(armor_sharedata.get(ACCESS_TIMESTAMP)) ? 0l : Long.valueOf(armor_sharedata.get(ACCESS_TIMESTAMP));
      }
      //如果先裝Armor，再裝Multy，在下一個refresh token過期之前，二個expire time都會是一樣的，目前先預設都一樣就打開multy
      if (armor_accesstoken_expire_value > multy_accesstoken_expire_value) {
        lastOpenApp = SecurityConstant.SupportApp.Armor;
        AppData.setData(SecurityConstant.SHARE_DATA_URI, BuildConfig.ARMOR_CONTENT_PROVIDER);
      } else if (armor_accesstoken_expire_value == multy_accesstoken_expire_value) {//二個expire time相等
        lastOpenApp = SecurityConstant.SupportApp.Multy;
        AppData.setData(SecurityConstant.SHARE_DATA_URI, BuildConfig.MULTY_CONTENT_PROVIDER);
      } else {
        lastOpenApp = SecurityConstant.SupportApp.Multy;
        AppData.setData(SecurityConstant.SHARE_DATA_URI, BuildConfig.MULTY_CONTENT_PROVIDER);
      }
    } else if (isMultyAppExist && !isArmorAppExist) {
      lastOpenApp = SecurityConstant.SupportApp.Multy;
      AppData.setData(SecurityConstant.SHARE_DATA_URI, BuildConfig.MULTY_CONTENT_PROVIDER);

    } else if (!isMultyAppExist && isArmorAppExist) {
      lastOpenApp = SecurityConstant.SupportApp.Armor;
      AppData.setData(SecurityConstant.SHARE_DATA_URI, BuildConfig.ARMOR_CONTENT_PROVIDER);
    } else {
      //multy跟armor都沒裝
    }
  }
{% endhighlight %}

LoginPresenter.java
解釋getMultySite這個function在做什麼
{% highlight java linenos %}
private PairedDeviceInfo getMultySite(List<PairedDeviceInfo> pairedDeviceInfoArrayList) {
  LogUtil.d(TAG, "paired list size:" + pairedDeviceInfoArrayList.size() + "/paired list:" + pairedDeviceInfoArrayList.toString());
  PairedDeviceInfo pairedDeviceInfo = null;
  if (isMultyAppExist || isArmorAppExist) {//先判斷Multy或Armor是否有存在
    LogUtil.d(TAG, "1.multy is exist");
    String focusMac = AppData.getData(SecurityConstant.FOCUS_MAC);//判斷是否有FocusMac(由multy或armor的share Data取出)
    LogUtil.d(TAG, "1.1FOCUS_MAC:" + focusMac);
    if (!APPUtils.ISNULL(focusMac)) {
      if (pairedDeviceInfoArrayList != null && pairedDeviceInfoArrayList.size() > 0) {
        for (PairedDeviceInfo info : pairedDeviceInfoArrayList) {//繞行Cloud的paired Device
          //檢查paired 的Mac跟focus Mac是相同，且型號是50/60/7815/6818
          if (info.getMacAddress().equals(focusMac) && APPUtils.ISCorrectModel(info.getModelName())) {
            LogUtil.d(TAG, "1.2有找到paired DeviceInfo:" + info);
            pairedDeviceInfo = info;
            break;//找到 跳出
          }
        }
      } else {
        //multy db 有，但pcloud沒有
      }
    } else {
      //有裝multy 但沒有focus site
    }
  }
  if (pairedDeviceInfo == null) {//找不到的話，代表可能有裝multy或armor但沒有paired過
    LogUtil.d(TAG, "4.0沒裝multy/armor跑以下");
    LogUtil.d(TAG, "4.1有裝 multy但 focus site不是wsq50或wsq60也會跑下面這一段");
    LogUtil.d(TAG, "4.1有裝 armor但 focus site不是nbg6818或nbg7815也會跑下面這一段");
    if (pairedDeviceInfoArrayList != null && pairedDeviceInfoArrayList.size() > 0) {
      for (PairedDeviceInfo info : pairedDeviceInfoArrayList) {//繞行paired的device
        LogUtil.d(TAG,"4.1.1 get model:"+info.getModelName());
        if(lastOpenApp !=null) {//最後一次打開的app若是null就代表沒裝multy跟armor
          if (lastOpenApp == SecurityConstant.SupportApp.Multy) {//最後一次打開的是multy
            if (APPUtils.ISMultyModel(info.getModelName())) {//cloud paired device是否為multy
              AppData.setData(SecurityConstant.FOCUS_MAC, info.getMacAddress());
              LogUtil.d(TAG, "4.1.2 multy getMultySite:" + info);
              pairedDeviceInfo = info;//若有抓到一台，就直接用第0台
              break;
            }
          } else if (lastOpenApp == SecurityConstant.SupportApp.Armor) {//最後一次打開的是armor
            if (APPUtils.ISArmorModel(info.getModelName())) {//cloud paired device是否為armor
              AppData.setData(SecurityConstant.FOCUS_MAC, info.getMacAddress());
              LogUtil.d(TAG, "4.1.2 armor getMultySite:" + info);
              pairedDeviceInfo = info;//若有抓到一台，就直接用第0台
              break;
            }
          }
        }else{
          //multy 跟armor 二個app都沒有裝
          if (APPUtils.ISCorrectModel(info.getModelName())) {
            AppData.setData(SecurityConstant.FOCUS_MAC, info.getMacAddress());
            LogUtil.d(TAG, "4.1.2getMultySite:" + info);
            pairedDeviceInfo = info;//若有抓到一台，就直接用第0台
            break;
          }
        }
      }
    }
    if (pairedDeviceInfo == null) {
      LogUtil.d(TAG, "pcloud也沒multy50/60/6818/7815 site，去買 multy");
      loginView.dismissLoadView();
      loginView.goToBuyMultyPage();
    }
  }
  return pairedDeviceInfo;
}
{% endhighlight %}

BaseActivity.java
判斷是否換Site重連
{% highlight java linenos %}
@Override
protected void onResume() {
  super.onResume();
  /**
   * determine what is the current activity in the foreground
   */
  long startTime = Calendar.getInstance().getTimeInMillis();
  LogUtil.d(TAG, "on resume base activity = " + getLocalClassName());
  mXmppController.clearXmppRequestQueueFlag();
  mXmppController.clearXmppRequestSession();
  if (!(getActivityContext() instanceof SSOActivity)) {
    //檢查multy/armor是否有換site或者換user帳號
    if (shareDataContentProvider != null) {
      //判斷有沒有裝multy/armor 且有focus_mac,若都沒裝，就代表讀的access token/refresh token都是aishield自己的，而不是從share data來的。
      if (!APPUtils.ISNULL(AppData.getData(SecurityConstant.FOCUS_MAC))) {
        //SHARE_DATA_URI之前已經在LoginPresenter.java 存過是要用Armor或Multy的SHARE_DATA_URI
        Map<String, String> rtnMap = shareDataContentProvider.Query(AppData.getData(SHARE_DATA_URI));
        if (rtnMap != null && rtnMap.size() > 0) {
          if (rtnMap.containsKey(SecurityConstant.FOCUS_MAC) && APPUtils.ISCorrectModel(rtnMap.get(SecurityConstant.MODEL_NAME))) {
            String focusMac = AppData.getData(SecurityConstant.FOCUS_MAC);
            LogUtil.d(TAG, "AppData FocusMac:" + focusMac + "/multy or armor foucusMac:" + rtnMap.get(SecurityConstant.FOCUS_MAC));
            //比對app先前存的focus_mac跟share data中的Focus_mac是否相同，若相同代表Multy Armor沒換site或換帳號登入
            if (rtnMap.get(SecurityConstant.FOCUS_MAC).equals(AppData.getData(SecurityConstant.FOCUS_MAC))) {
              //沒換site
              LogUtil.d(TAG, "沒有換site");
              initView(savedInstanceState);
            } else {
              //有換site
              //重連
              LogUtil.d(TAG, "換site重連");
              AppData.setData(SecurityConstant.CHECK_LICENSE, "");
              //APPUtils.clearNetworkId_DevUUID_StoreAccessToken();//清掉資料
              if (mXmppController != null) {
                mXmppController.clearXmppRequestQueueFlag();
                mXmppController.clearXmppRequestTimer();
              } else {
                LogUtil.d(TAG, "mXmppController is null");
              }
              loginPresenter = LoginPresenter.getmInstance(mWeakContext);
              loginPresenter.checkAccessTokenExpire();
            }
          } else {
            //multy或armor沒focus site,一律用aishield自己的access token/refresh token
            initView(savedInstanceState);
          }
        } else {
          //multy或armor沒focus site,一律用aishield自己的access token/refresh token
          initView(savedInstanceState);
        }
      } else {
        //multy或armor沒focus site,一律用aishield自己的access token/refresh token
        initView(savedInstanceState);
      }
    } else {
      //multy或armor沒focus site,一律用aishield自己的access token/refresh token
      initView(savedInstanceState);
    }
  }
  long endTime = Calendar.getInstance().getTimeInMillis();
  LogUtil.d(TAG, "onResume time = " + (endTime - startTime));
}
{% endhighlight %}