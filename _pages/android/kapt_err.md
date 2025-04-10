---
title: kaptGenerateStubsDebugKotlin task (current target is 17) jvm target
date: 2025-04-06
keywords: Android,
---
kaptGenerateStubsDebugKotlin task (current target is 17) jvm target
```
'compileDebugJavaWithJavac' task (current target is 1.8) and 'kaptGenerateStubsDebugKotlin' task (current target is 17) jvm target
```
參考網址
[https://stackoverflow.com/questions/75650195/build-error-kspdebugkotlin-task-current-target-is-17/75916224#75916224](https://stackoverflow.com/questions/75650195/build-error-kspdebugkotlin-task-current-target-is-17/75916224#75916224)

要填上以下的紅色字在
```
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    id 'kotlin-android'
    id 'kotlin-kapt'
}
```
![img]({{site.imgurl}}/android/kapt_err1.png)
```
dependencies {
 //dagger
    var dagger_version = "2.46.1"
    implementation "com.google.dagger:dagger:$dagger_version"
    kapt "com.google.dagger:dagger-compiler:$dagger_version"
}
```
![img]({{site.imgurl}}/android/kapt_err2.png)
把以下這堆全放置在build.gradle(Project:My_Application)
```
allprojects {
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            jvmTarget = "1.8"
        }
    }
}
```
![img]({{site.imgurl}}/android/kapt_err3.png)



