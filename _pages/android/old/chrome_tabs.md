---
title: Chrome Custom Tabs
date: 2023-05-29
keywords: Android, Chrome Custom Tabs
---

Android In-App Web Browser --Chrome Custom Tabs
Android ChromeCustom Tabs與IOS 比較

相同點：
1. 都有網址列
2. 都有返回App的按鈕，Android是X，IOS是”完成”
3. Android in-App browser也有像google chrome”加入最愛、下載、歷史…”等等相關功能
4. 不用再打開外部瀏覽器

Custom Tabs優點
- ActionBar（也就是最上面的 Toolbar，網址一欄）的顏色
- Custom Tab 的進入和退出過場動畫
- 在Custom Tab 的 ActionBar 上添加自定義圖標和菜單
- 自定義返回圖標
- Custom Tab 可以通過回調接口來通知應用網頁導航的情況
- 性能更好，使用 Custom Tab 來打開網頁的時候，還可以預先加載網頁內容，這樣當打開的時候，用戶感覺非常快。
- 生命週期管理，使用 Custom tab 可以和您的應用綁定一起，當用戶在瀏覽網頁的時候，您的應用也被認為是互動的程序，不會被系統殺死。
- 可以共享 Chrome 瀏覽器的 Cookie ，這樣用戶就不用再登錄一遍網站了。
- 如果用戶開啟了 Chrome 的數據壓縮功能，則一樣可以使用(???)
- 和 Chrome 一樣的自動補全功能(???)
- 只需點擊左上角的返回按鈕一次就可以返回您的應用中了
- 每次用的都是最新版本的 Chrome(會隨著 Chrome 更新)

Custom Tab缺點
這個組件解決了 Webview 的很多問題，但它有一個關鍵的限制，就是會在頂部有個地址欄顯示 。為什麼要這麼做呢？因為 Chrome Custom Tabs 可能打開任何 Web 頁面，如果全屏顯示，會給用戶錯覺認為 Chrome Custom Tabs 打開的 Web 頁面是當前 Native App 提供的，造成安全問題。地址欄提示了用戶當前是像瀏覽器中一樣在瀏覽一個頁面。

解決Custom Tabs缺點

Trusted Web Activity(2019/02發佈)

更接近 Native App 的使用體驗，而 Chrome Custom Tabs 雖然避免了 Webview 的缺點，但是由於有地址欄，還是一個瀏覽器形式的體驗。這時候就需要用到 Trusted Web Activity了。 TWA(Trusted Web Activity) 是在 Chrome Custom Tabs 的基礎上，使用Digital AssetLinks來對 Web 內容進行鑑權，限制 TWA 中展示的 Web 內容與 Native App 為相同的作者，保證了安全性。它的優點：

- 基於 Custom Tabs，會隨 Chrome 自動更新
- 全屏幕，不會顯示地址欄。

Getting Started with Trusted Web Activities
<https://codelabs.developers.google.com/codelabs/getting-started-with-twas/index.html?index=..%2F..index#0>

![img]({{site.imgurl}}/android/old/chrome_tabs1.png)
![img]({{site.imgurl}}/android/old/chrome_tabs2.png)
![img]({{site.imgurl}}/android/old/chrome_tabs3.png)
![img]({{site.imgurl}}/android/old/chrome_tabs4.png)
![img]({{site.imgurl}}/android/old/chrome_tabs5.gif)

Chrome Custom Tabs

官方提供的Sample Code
<https://github.com/GoogleChrome/custom-tabs-client>

首先在gradle的dependencies加上
```
implementation 'com.android.support:customtabs:28.0.0'
```

啟動Chrome Custom Tabs
{% highlight java linenos %}
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        CustomTabsIntent.Builder intentBuilder = new CustomTabsIntent.Builder();
        intentBuilder.build().launchUrl(this, Uri.parse("https://paul.kinlan.me/"));
    }
}
{% endhighlight %}

Toolbar增加顏色
{% highlight java linenos %}
CustomTabsIntent.Builder intentBuilder = new CustomTabsIntent.Builder();
intentBuilder.setToolbarColor(Color.parseColor("#980e03"));
intentBuilder.build().launchUrl(this, Uri.parse("https://paul.kinlan.me/"));
{% endhighlight %}

Toolbar Close Button換圖
{% highlight java linenos %}
CustomTabsIntent.Builder intentBuilder = new CustomTabsIntent.Builder();
intentBuilder.setToolbarColor(Color.parseColor("#980e03"));
intentBuilder.setCloseButtonIcon(
        BitmapFactory.decodeResource(getResources(), R.drawable.ic_arrow_back));
intentBuilder.build().launchUrl(this, Uri.parse("https://paul.kinlan.me/"));
{% endhighlight %}

增加一個Send Mail的Action Button
{% highlight java linenos %}
CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
Intent actionIntent = new Intent(Intent.ACTION_SEND);
actionIntent.setType("*/*");
actionIntent.putExtra(Intent.EXTRA_EMAIL, "example@example.com");
actionIntent.putExtra(Intent.EXTRA_SUBJECT, "example");
PendingIntent pi = PendingIntent.getActivity(this, 0, actionIntent, 0);
Bitmap icon = BitmapFactory.decodeResource(getResources(), android.R.drawable.ic_dialog_email);
builder.setActionButton(icon, "send email", pi, true);
{% endhighlight %}

增加Menu
{% highlight java linenos %}
CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
Intent menuIntent = new Intent();
menuIntent.setClass(getApplicationContext(), Main2Activity.class);
PendingIntent pi2 = PendingIntent.getActivity(getApplicationContext(), 0, menuIntent, 0);
builder.addMenuItem("Menu entry 2", pi2);
builder.addMenuItem("Menu entry 3", pi2);
builder.addMenuItem("Menu entry 4", pi2);
{% endhighlight %}

進階功能(目前沒用過)  
參考Demo<https://github.com/GoogleChrome/custom-tabs-client>  
ServiceConnectionActivity.java  

CustomTabsClient.bindCustomTabsService（Context context，String packageName，CustomTabsServiceConnection connection）函數來綁定到CustomTabsService，綁定成功後，在通過CustomTabsClient.warmup（long flags）函數來預加載Chrome，這些Chrome會加載一些基本控件，這樣當 打開的時候速度就會比較快;還可以通過CustomTabsClient.newSession（CustomTabsCallback回調）函數來獲取一個自定義標籤的回話，在Callback中可以監聽該回話的導航操作，比如導航是失敗了還是成功了。