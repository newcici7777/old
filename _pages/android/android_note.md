---
title: Android note
date: 2025-04-06
keywords: Android,
---

取得TAG
MainActivity.class.getSimpleName()

alt+F7 Find usage
shit二次尋找

網路測試
{% highlight java linenos %}
private class NetworkTestTask extends AsyncTask<Void, Void, Boolean> {
    @Override
    protected Boolean doInBackground(Void... voids) {
        try (Socket socket = new Socket("localhost", 8555)) {
            Log.d("NETWORK", "模拟器网络正常");
            return true;
        } catch (IOException e) {
            Log.e("NETWORK", "模拟器无法访问RTSP端口: " + e.getMessage());
            return false;
        }
    }

    @Override
    protected void onPostExecute(Boolean success) {
        if (success) {
            Toast.makeText(MainActivity.this, "网络测试通过", Toast.LENGTH_SHORT).show();
        } else {
            Toast.makeText(MainActivity.this, "网络测试失败", Toast.LENGTH_SHORT).show();
        }
    }
}
{% endhighlight %}

// 在 onCreate() 中调用
new NetworkTestTask().execute();


{% highlight java linenos %}
new Thread(() -> {
    try (Socket socket = new Socket("localhost", 8555)) {
        Log.d("NETWORK", "模拟器网络正常");
        runOnUiThread(() -> Toast.makeText(MainActivity.this, "网络正常", Toast.LENGTH_SHORT).show());
    } catch (IOException e) {
        Log.e("NETWORK", "模拟器无法访问RTSP端口: " + e.getMessage());
        runOnUiThread(() -> Toast.makeText(MainActivity.this, "网络失败: " + e.getMessage(), Toast.LENGTH_SHORT).show());
    }
}).start();
{% endhighlight %}

// 1. 添加依赖（build.gradle）
implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.6.4"

// 2. 在 Activity 中使用
{% highlight java linenos %}
lifecycleScope.launch(Dispatchers.IO) {
    try {
        Socket("localhost", 8555).use { socket ->
            withContext(Dispatchers.Main) {
                Toast.makeText(this@MainActivity, "网络正常", Toast.LENGTH_SHORT).show()
            }
        }
    } catch (e: IOException) {
        withContext(Dispatchers.Main) {
            Toast.makeText(this@MainActivity, "网络失败: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }
}
{% endhighlight %}

與 Native (C/C++) 互動時

在 NDK 開發中，當 C/C++ 需要通知 Java 層更新 UI，通常會透過 JNI 呼叫 Java 方法，而 Handler 可以幫助你在 UI Thread 上執行更新。

Looper 和 MessageQueue 的運作機制

如果你的應用程式中有 長時間運行的 Thread，例如 自訂的背景執行緒，你可能需要讓該執行緒擁有自己的 Looper 來處理訊息，這時候 Handler 就很有用。

HandlerThread

如果你想要在單獨的背景執行緒處理特定的工作，但不想要每次都創建新執行緒，HandlerThread 是很好的選擇。這在影像處理、音訊處理或某些與 NDK 相關的計算 時可能會派上用場。

不過，如果你的目標是寫現代化的 Android 應用程式，而不是處理 NDK 或特殊場景，那麼建議你 優先學習 Kotlin Coroutines，因為它的可讀性更高，而且能更簡潔地處理異步操作。


runOnUiThread() 與 new Handler().post() 的區別
這兩種方法都是在 Android 中將代碼切換到主線程(UI 線程)執行的方法，但它們有一些重要區別：

主要區別
所屬類別不同

runOnUiThread() 是 Activity 類的方法

new Handler().post() 是 Handler 類的方法

當前線程檢查

runOnUiThread() 會先檢查當前是否已在 UI 線程，如果是則直接執行，否則通過 Handler 發送到 UI 線程

new Handler().post() 總是將 Runnable 發送到消息隊列，即使當前已在 UI 線程

使用場景

runOnUiThread() 通常在 Activity 或 Fragment 中使用更方便

new Handler().post() 可以在任何有 Context 的地方使用

性能考量
如果已經在 UI 線程，runOnUiThread() 會直接執行而不通過消息隊列，效率更高

new Handler().post() 總是通過消息隊列，即使已在 UI 線程

示例代碼
java
复制
// runOnUiThread() 用法
runOnUiThread(new Runnable() {
    @Override
    public void run() {
        // 更新 UI
    }
});

// Handler.post() 用法
new Handler(Looper.getMainLooper()).post(new Runnable() {
    @Override
    public void run() {
        // 更新 UI
    }
});
選擇建議
在 Activity 或 Fragment 中優先使用 runOnUiThread()，因為更簡潔且可能更高效

在非 Activity 類中或需要更精確控制時使用 Handler.post()

如果代碼可能在 UI 線程或非 UI 線程運行，runOnUiThread() 是更好的選擇