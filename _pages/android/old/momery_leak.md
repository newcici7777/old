---
title: Handle Memory Leak
date: 2025-03-24
keywords: android,Handle Memory Leak
---
偵測memory leak的工具  
LeakCanary  
Eclipse MAT  
Android Studio Profiler  

參考以下篇章修改防止momery leak洩漏。  
<https://android.jlelse.eu/9-ways-to-avoid-memory-leaks-in-android-b6d81648e35e>
<https://www.jianshu.com/p/4036a7a84296>
![img]({{site.imgurl}}/android/old/memory_leak1.png)  
![img]({{site.imgurl}}/android/old/memory_leak2.png)  
![img]({{site.imgurl}}/android/old/memory_leak3.png)  
![img]({{site.imgurl}}/android/old/memory_leak4.png)  
![img]({{site.imgurl}}/android/old/memory_leak5.png)  
![img]({{site.imgurl}}/android/old/memory_leak6.png)  
![img]({{site.imgurl}}/android/old/memory_leak7.png)  
![img]({{site.imgurl}}/android/old/memory_leak8.png)  
![img]({{site.imgurl}}/android/old/memory_leak9.png)  
![img]({{site.imgurl}}/android/old/memory_leak10.png)  
Memory leak的觸發點  
![img]({{site.imgurl}}/android/old/memory_leak11.png)  
AiShield ShowLoadingView  
建立一個PopWindowHandler  
![img]({{site.imgurl}}/android/old/memory_leak12.png) 
OnCreate 
![img]({{site.imgurl}}/android/old/memory_leak13.png)  
![img]({{site.imgurl}}/android/old/memory_leak14.png)  
initPopupWindow
![img]({{site.imgurl}}/android/old/memory_leak15.png)  
![img]({{site.imgurl}}/android/old/memory_leak16.png)  
Destroy  
removeCallbacksAndMessages,參考此篇<http://lp43.blogspot.com/2011/11/memory-leak-drawable.html>
![img]({{site.imgurl}}/android/old/memory_leak17.png)  
![img]({{site.imgurl}}/android/old/memory_leak18.png)  
Eclipse MAT
參考文章：<https://blog.csdn.net/CrazyMo_/article/details/80214205>
![img]({{site.imgurl}}/android/old/memory_leak19.png)  
![img]({{site.imgurl}}/android/old/memory_leak20.png)  
![img]({{site.imgurl}}/android/old/memory_leak21.png)  
![img]({{site.imgurl}}/android/old/memory_leak22.png)  
![img]({{site.imgurl}}/android/old/memory_leak23.png)  
![img]({{site.imgurl}}/android/old/memory_leak24.png)  
無法克服的memoryLeak
1.OkHttp(因為用匿名)
![img]({{site.imgurl}}/android/old/memory_leak25.png)  
![img]({{site.imgurl}}/android/old/memory_leak26.png)  
2.Service LocalBinder
<https://stackoverflow.com/questions/6733538/memory-leaks-found-when-local-binder-has-a-reference-to-service>
<https://stackoverflow.com/questions/7976322/binder-preventing-garbage-collection>

3.Singleton 宣告static
![img]({{site.imgurl}}/android/old/memory_leak27.png)  
參考：<http://hant.ask.helplib.com/java/post_5038000>
![img]({{site.imgurl}}/android/old/memory_leak28.png)
目前作法在GetEndDevicePrecenter中增加destroy()
![img]({{site.imgurl}}/android/old/memory_leak29.png)  
其它引用GetEndDevicePrecenter  
記得在onResume   去呼叫建立  
onPause 去呼叫destroy()  
![img]({{site.imgurl}}/android/old/memory_leak30.png)  
參考文章
![img]({{site.imgurl}}/android/old/memory_leak31.png)  
<https://stackoverflow.com/questions/34409549/release-memory-of-particular-activity-when-it-is-destroyed>
![img]({{site.imgurl}}/android/old/memory_leak32.png)  
Bitmap的recycle
![img]({{site.imgurl}}/android/old/memory_leak33.png)  
Android的強迫Garbage Collector方式  
![img]({{site.imgurl}}/android/old/memory_leak34.png)   
![img]({{site.imgurl}}/android/old/memory_leak35.png) 
最後 
![img]({{site.imgurl}}/android/old/memory_leak36.png)  
![img]({{site.imgurl}}/android/old/memory_leak37.png) 
![img]({{site.imgurl}}/android/old/memory_leak38.png) 

其它資料
![img]({{site.imgurl}}/android/old/memory_leak39.png)  
AsyncTask,Handler,Thread,TimerTask,CountDownTimer,  
![img]({{site.imgurl}}/android/old/memory_leak40.png)   
![img]({{site.imgurl}}/android/old/memory_leak41.png)  
<https://www.youtube.com/watch?v=RqyF7qzA4qc&list=LL5DL2LYd3m82-JE01-VhfBw&index=4&t=0s>  
![img]({{site.imgurl}}/android/old/memory_leak42.png)   

參考連結:
<https://www.jianshu.com/p/c5ac51d804fa>
<https://www.jianshu.com/p/63aead89f3b9>
<https://www.jianshu.com/p/ac00e370f83d>
<https://blog.csdn.net/snow4dev/article/details/7555130>
<https://stackoverflow.com/questions/9809336/android-asyntask-use-weak-reference-for-context-to-avoid-device-rotate-screen/9809870>
<http://frankwu-coding.logdown.com/posts/230591-androidhandlermemory-leak>
<https://instabug.com/blog/how-to-fix-android-memory-leaks/>
<https://www.androiddesignpatterns.com/2013/01/inner-class-handler-memory-leak.html>
<https://stackoverflow.com/questions/17778456/static-runnable-in-activity>
<https://stackoverflow.com/questions/13891186/static-singleton-lifetime-in-android/13891253#13891253>
<https://blog.csdn.net/CrazyMo_/article/details/80214205>
<https://www.jianshu.com/p/ea5278f92173>
<https://juejin.im/post/595615d1f265da6c261d3bc1>
<https://juejin.im/post/5955f556f265da6c4e7f5330>