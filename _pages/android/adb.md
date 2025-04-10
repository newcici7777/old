---
title: ADB
date: 2023-05-30
keywords: Android, kotlin, ADB
---
在終端機輸入以下  
```
cd ~/
touch .bash_profile
open .bash_profile
```
打開Android Studio->File->Preferences中，搜尋輸入sdk，點選Android SDK  
把`/Users/cici/Library/Android/sdk`  
這段複製起來  
![img]({{site.imgurl}}/android/adb2.png)
在.bash_profile輸入以下，記得export要小寫  
```
export ANDROID_HOME=/Users/cici/Library/Android/sdk
export PATH=${PATH}:${ANDROID_HOME}/tools
export PATH=${PATH}:${ANDROID_HOME}/platform-tools
```
![img]({{site.imgurl}}/android/adb3.png)
上一張圖儲存後，輸入`source .bash_profile`  
輸入`adb`  
如下圖  
![img]({{site.imgurl}}/android/adb4.png)
打開AndroidStudio  
按Build->Build Bundle->Build APKs  
![img]({{site.imgurl}}/android/adb5.png)
點擊locate  
![img]({{site.imgurl}}/android/adb6.png)
產生的位置如下，也可以選取app-debug.apk，按option鍵，拷貝位置  
`/Users/cici/AndroidStudioProjects/MyApplication2/app/build/outputs/apk/debug/app-debug.apk`

打開終端機  
`cd /Users/cici/AndroidStudioProjects/MyApplication2/app/build/outputs/apk/debug/`
![img]({{site.imgurl}}/android/adb7.png)
再來adb install -g app-debug.apk  
用-g是官方說，這樣可以使用permission
![img]({{site.imgurl}}/android/adb8.png)