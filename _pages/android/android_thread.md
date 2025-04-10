---
title: Android thread
date: 2025-04-07
keywords: Android, handler, thread, Runnable
---
{% highlight java linenos %}
  private Handler handler;
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    handler = new Handler() {
      @Override
      public void handleMessage(@NonNull Message msg) {
        super.handleMessage(msg);
        switch (msg.what) {
          case 1:
            Toast.makeText(MainActivity.this, "test", Toast.LENGTH_SHORT).show();
            Log.e(TAG,"handler test");
            break;
        }
      }
    };
    new Thread() {
      @Override
      public void run() {
        super.run();
        Message message = new Message();
        message.what = 1;
        handler.sendMessage(message);
      }
    }.start();
    new Thread(new Runnable() {
      @Override
      public void run() {
        runOnUiThread(new Runnable() {
          @Override
          public void run() {
            Toast.makeText(MainActivity.this, "ui Test", Toast.LENGTH_SHORT).show();
            Log.e(TAG,"ui Thread Test");
          }
        });
      }
    }).start();
   }
{% endhighlight %}