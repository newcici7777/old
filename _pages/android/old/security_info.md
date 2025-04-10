---
title: GET_CYBER_SECURITY_INFO
date: 2025-03-24
keywords: android
---
此API主要記錄
1. Policy_id
2. Profile_Index
3. 被阻擋的App List
4. 被阻擋的WebCategory List
5. 被阻擋/信任的Domain List
6. 被阻擋的KeyWord List

結構如下：
1.Policy_id與Profile_Index
![img]({{site.imgurl}}/android/old/security_info1.png)  
2.被阻擋的App List
![img]({{site.imgurl}}/android/old/security_info2.png)  
3.被阻擋的WebCategory
![img]({{site.imgurl}}/android/old/security_info3.png)  
4.被阻擋KeyWord，跟(阻檔/信任)的Domain 
![img]({{site.imgurl}}/android/old/security_info4.png) 
WebCategory&APP. ID/High/Low/Mid/Custom對映
1.WebCateogry(圖有錯，應是High/Mid/Low/Custom)
![img]({{site.imgurl}}/android/old/security_info5.png)
2.App
![img]({{site.imgurl}}/android/old/security_info6.png)

WebCategory 翻譯相關的Code  
TableName:WEB_CATEGORY_INFO  
主要記錄那些APP要被BLOCK與WEB Cateogry要被Block  
{% highlight sql linenos %}
select name,name_tw,name_pt,name_fr,name_es,name_it,name_de,name_ru from web_category_info
select description,description_tw,description_pt,description_fr,description_es,description_it,description_de,description_ru from web_category_info
{% endhighlight %}
![img]({{site.imgurl}}/android/old/security_info7.png)
APPUtils.java  
Code的說明  
1.取得language(程式碼1#1778)  
2.判斷language，並塞入相對映的翻譯到TextView  
程式碼1  
![img]({{site.imgurl}}/android/old/security_info8.png) 

GET_SECURITY_STATUS  
此API可以取出APP的Usage:  
1.mDailyUsage提供前31天(含今天)每天的app使用量，mAppId來代表是那個App,mUsed代表使用量(單位:分鐘)。  
![img]({{site.imgurl}}/android/old/security_status1.png)
2.提供31天的資料  
![img]({{site.imgurl}}/android/old/security_status2.png)
3.mWeeklyUsage提供四周的App使用量  
![img]({{site.imgurl}}/android/old/security_status3.png)