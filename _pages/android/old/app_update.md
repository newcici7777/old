---
title: app update
date: 2023-05-17
keywords: android, app update
---
![img]({{site.imgurl}}/android/old/app_update1.png)
![img]({{site.imgurl}}/android/old/app_update2.png)
更新的過程
下載
![img]({{site.imgurl}}/android/old/app_update3.png)
安裝
![img]({{site.imgurl}}/android/old/app_update4.png)
![img]({{site.imgurl}}/android/old/app_update5.png)
![img]({{site.imgurl}}/android/old/app_update6.png)

在Gradle放上
```
// in app update
implementation 'com.google.android.play:core:1.6.3’
```
1.使用AppUpdateManager檢查是否有新版本可以更新
{% highlight java linenos %}
private AppUpdateManager appUpdateManager;
private Task<AppUpdateInfo> appUpdateInfoTask;
private static final int REQUEST_APP_UPDATE = 1234;
{% endhighlight %}


2.如果有更新的版本，會回傳一個AppUpdateInfo

![img]({{site.imgurl}}/android/old/app_update7.png)

3.檢查完能否更新後，使用AppUpdateManager.startUpdateFlowForResult()啟動update，有二種啟動更新的方式，分別為AppUpdateType.FLEXIBLE與AppUpdateType.IMMEDIATE
{% highlight java linenos %}
private void checkAppUpdate() {
  // Creates instance of the manager.
  appUpdateManager = AppUpdateManagerFactory.create(this);
  appUpdateManager.registerListener(installStateUpdatedListener);
  // Returns an intent object that you use to check for an update.
  appUpdateInfoTask = appUpdateManager.getAppUpdateInfo();
  // Checks that the platform will allow the specified type of update.
  appUpdateInfoTask.addOnSuccessListener(appUpdateInfo -> {
    int isAvailable = appUpdateInfo.updateAvailability();
    int avalible_version_code = appUpdateInfo.availableVersionCode();
    if(appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE
       && appUpdateInfo.isUpdateTypeAllowed(IMMEDIATE)) {//更新
      try {
        // Or 'AppUpdateType.FLEXIBLE' for flexible updates.
        appUpdateManager.startUpdateFlowForResult(
          appUpdateInfo, AppUpdateType.IMMEDIATE, this, REQUEST_APP_UPDATE);
      } catch (IntentSender.SendIntentException e) {
        e.printStackTrace();
      }
    } else{
      //不需要更新
      checkPopupAd();
    }
  });
 }
{% endhighlight %}

![img]({{site.imgurl}}/android/old/app_update8.png)

Flexible: A user experience that provides background download of the update and at the same time no interruption on seamless use of the app. Flexible update is most useful when you integrated a new feature which is not core to your app. 

Immediate: This is the flow where a blocking UI is prompted by google until the update is download and installed. Immediate update is most useful when there is bug in the production version. 

However Android allows you to handle any of the two update types for every version of your app, so it’s up to you how to handle. 

4.appUpdateInfo.updateAvailability()會回傳四種狀態
- UNKNOWN
- UPDATE_AVAILABLE
- UPDATE_NOT_AVAILABLE
- DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS

5.處理Fail或取消更新(在AppUpdateType.FLEXIBLE的情況下)
{% highlight java linenos %}
@Override
protected void onActivityResult(int requestCode, int resultCode, Intent data) {
  if(requestCode == REQUEST_APP_UPDATE){
    if(resultCode != RESULT_OK){
      if(resultCode == RESULT_CANCELED){//取消更新
        checkPopupAd();
      }else if(resultCode == ActivityResult.RESULT_IN_APP_UPDATE_FAILED){//更新失敗
        checkAppUpdate();
      }

    }
  }
}
{% endhighlight %}
6.處理下載到一半以及更新到一半，使用者關掉或滑掉重啟。
若更新的狀態為UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS，則重新啟動AppUpdateManager.startUpdateFlowForResult()，但參數一定要代AppUpdateType.IMMEDIATE，代表先前使用者是按下要更新，讓更新的程式繼續下去。
{% highlight java linenos %}
@Override
protected void onResume() {
  super.onResume();
  if (BuildConfig.IN_APP_UPDATE) {
    appUpdateInfoTask.addOnSuccessListener(appUpdateInfo -> {
      if (appUpdateInfo.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {//之前沒更新到一半就關掉了
        try {
          appUpdateManager.startUpdateFlowForResult(
              appUpdateInfo,
              IMMEDIATE,
              this,
              REQUEST_APP_UPDATE);
        } catch (IntentSender.SendIntentException e) {
          e.printStackTrace();
        }
      } else if (appUpdateInfo.installStatus() == InstallStatus.DOWNLOADED) {//確認已經完成更新
        popRestartAppDialog();
      }
    });
  }
}
{% endhighlight %}

![img]({{site.imgurl}}/android/old/app_update9.png)

7.關於Immediate Update
針對AppUpdateType.FLEXIBLE，若下載完檔案，跳出一個Dialog告知使用者更新完成後會重新啟動APP
{% highlight java linenos %}
InstallStateUpdatedListener installStateUpdatedListener = new
    InstallStateUpdatedListener() {
      @Override
      public void onStateUpdate(InstallState state) {

        if (state.installStatus() == InstallStatus.DOWNLOADED){
          popRestartAppDialog();
        } else if (state.installStatus() == InstallStatus.INSTALLED){
          if (appUpdateManager != null){
            appUpdateManager.unregisterListener(installStateUpdatedListener);
          }
        } else {
          Log.i(TAG, "InstallStateUpdatedListener: state: " + state.installStatus());
        }
      }
};
private void popRestartAppDialog(){
  AlertDialog alertDialog = new AlertDialog.Builder(this, R.style.MyAlertDialogStyle)
      .setCancelable(false)
      .setMessage("Installation is ready and confirmation to restart the app.")
      .setPositiveButton(R.string.alert_yes, (DialogInterface dialogInterface, int i) -> {
        appUpdateManager.completeUpdate();//重新啟動app
      }).create();
  alertDialog.show();
}
{% endhighlight %}

8.測試時，必須先去Google Play Store下載APK(Production)，然後修改Gradle的Version Code比Google Play Store還舊，再安裝至手機中。  

In-app updates are available only to user accounts that own the app. So, make sure the account you’re using has downloaded your app from Google Play at least once before using the account to test in-app updates.
Make sure that the app that you are testing in-app updates with has the same application ID and is signed with the same signing key as the one available from Google Play.
Because Google Play can only update an app to a higher version code, make sure the app you are testing as a lower version code than the update version code.  

參考資料：  
[https://developer.android.com/guide/app-bundle/in-app-updates](https://developer.android.com/guide/app-bundle/in-app-updates)

[https://medium.com/android-dev-hacks/in-app-updates-api-by-google-for-android-why-and-when-its-going-to-be-useful-how-to-properly-4578df9e9b3](https://medium.com/android-dev-hacks/in-app-updates-api-by-google-for-android-why-and-when-its-going-to-be-useful-how-to-properly-4578df9e9b3)

