---
title: Thread Warning list
date: 2023-05-03
keywords: Android, 
---
DB TABLE:
1. SECURITY_INFO :記錄所有log
2. SECURITY_SEARCH :記錄搜尋log的時間

```
SECURITY_INFO TABLE的欄位
Id主鍵
TIMESTAMP
DEV_UUID
PROFILE_ID
CLIENT_MAC
CLIENT_IP
EVENT_CLASS
EVENT_TYPE
AGGREGATE_COUNT
DIR
REMOTE_IP
CATEGORY_INDEX
REMOTE_URL
COUNTRY_CODE
REMOTE_URL_SCHEME
REMOTE_URL_HOST
REMOTE_URL_PORT
REMOTE_URL_PATH
REMOTE_URL_QUERY
FILE_NAME
MD5
MALWARE_GROUP
SID
READ
SEARCH_TYPE
```

詳情請見eventLog.pptx  
<https://drive.google.com/file/d/1UgQo1pkz947q0hhc1F1yA5OvAA6zNHAr/view?usp=sharing>
參見EXAMPLE5  
<https://drive.google.com/file/d/1mJC0xgmwtUAl0BwdnUnUgmqkEVoJ43EF/view>  

Cloud API:  
參考EXAMPLE5  
<https://drive.google.com/file/d/1mJC0xgmwtUAl0BwdnUnUgmqkEVoJ43EF/viewLOG_SEARCH_URL = "https://api-alpha.mas.zyxelonline.com/v1/devices/logs/search";>
```
String json = "{\"start_time\":1526860801,\"end_time\":1526947199,\"query\":{\"dev-uuid\":\"550e8400-e29b-41d4-a716-446655440000\",\"event-class\": [\"threat\"]}, \"size\": 100}";
```

Search_after意指下次搜尋的timestamp  
排序方式由Timestamp數字大到數字小  
圖1
![img]({{site.imgurl}}/android/old/paging1.png)  
圖2
![img]({{site.imgurl}}/android/old/paging2.png) 
SECURITY_SEARH(DB_TABLE1)  
主要記錄搜尋的Timestatmp  
圖3  
![img]({{site.imgurl}}/android/old/paging3.png)  
將小的Timestamp(圖2的3)放入”Start”欄位，大的Timestamp+1(圖1的2)放入”END”欄位  
START=小  
END=大  
{% highlight java linenos %}
/**
 * @param eventMsg json的資料
 * @param mac  針對Threat&Warning List的功能，mac只要帶null就好。給Mac的功能是給針對某個Device撈出此Device的Threat&Warning
 * @param isAfter 若使用者有下滑，參數才會帶true,不然一開始進去Threat&Warning List的頁面，是帶false
 * @return
 */
private List<IType> getGroupList(String eventMsg,String mac, boolean isAfter) {
}
{% endhighlight %}

尋找json中的SearchAfter的值(圖1的1)，若找不到就回-1代表沒下一頁資料
{% highlight java linenos %}
private long getSearchAfter(String eventMsg) {}
{% endhighlight %}

SecuritySearchRepo.java
{% highlight java linenos %}
/**
 * 檢查是否有搜尋過
 * @param searchAfter
 * @return
 */
public SecuritySearch checkIsExistPre(long searchAfter){}
{% endhighlight %}

撈資料前會代入SearchAfter的值(圖1的1)，檢查SECURITY_SEARH(DB_TABLE1)是否之前已經搜尋過
{% highlight sql linenos %}
where type=? and  start <= ? and end > ? and dev_uuid = ? order by start desc
{% endhighlight %}
第一個參數可以代threat/warning  
第二個參數及第三個參數代入SearchAfter的值(圖1的1) 

HistoryPresenter.java主要程式碼說明

CASE1:沒有下一頁,searchAfter是-1  
(1)資料庫有存過此SearchAfter-1(程式碼1#418)  
檢查log中第0筆(最大)資料的timestamp是不是比存在資料庫的End那筆還大(程式碼1#427)  
若是的話，要做二件事  
A.要把END值修正成json的第0筆(程式碼1#437,#439)  
B.並把log中所有大於資料庫的End那筆還大的資料全insert到SECURITY_INFO的TABLE(程式碼1#428~#436)  
C.將A的條件帶進資料庫去搜SECURITY_INFO，並把搜尋到的資料Load到UI呈現(程式碼1#441~#451)  
程式碼1
![img]({{site.imgurl}}/android/old/paging4.png)  

(2)若沒有撈到之前有搜尋過的SearchAfter，就把資料新增至SECURITY_INFO以及把-1塞到Start與第0筆資料timestamp(End)insert至SECURITY_SEARCH(程式碼1#457)(<程式碼2>#489)  
Load資料給UI呈現，從SECURITY_SEARCH中的Start跟End還有DEV_UUID的欄位作為參數去撈取SECURITY_INFO的資料(程式碼2#491~#500)  
程式碼2  
![img]({{site.imgurl}}/android/old/paging5.png) 

CASE2:有下一頁,SearchAfter不是-1  
(1)資料庫有存過此SearchAfter  
檢查log中第0筆(最大)資料的timestamp是不是比存在資料庫的End那筆還大(程式碼3#230~#235)
若是的話，要做三件事  
A.新增一筆資料至SECURITY_SEARCH，START為"存在資料庫的End的欄位",END為log第0筆的timestamp+1(新增前檢查是否資料庫已經存在這筆，沒存在才新增)(程式碼3#247~#248,程式碼3#257)  
B.並把log中所有大於資料庫的End那筆還大的資料全insert到SECURITY_INFO的TABLE(程式碼3#236~#243)  
C.將A的條件帶進資料庫去搜SECURITY_INFO，並把搜尋到的資料Load到UI呈現(程式碼4#289,程式碼5)  
將小於SearchAfter的資料全搜尋出來。(程式碼3#262~#266)  
Load有連續性的資料給UI呈現  
以下的function主要是去Load有連續性的資料給UI作呈現 
{% highlight java linenos %}
public void LoadDB(List<SecuritySearch> searchList) {}
{% endhighlight %} 

程式碼3  
![img]({{site.imgurl}}/android/old/paging6.png)  
程式碼4
![img]({{site.imgurl}}/android/old/paging7.png)  
程式碼5
![img]({{site.imgurl}}/android/old/paging8.png)  
(2)資料庫沒有存過此SearchAfter  
還沒下滑(isAfter=false)  
A.新增一筆資料至SECURITY_SEARCH，START為這一次的SearchAfter,END為Log的第0筆timestamp+1(程式碼2#489)  

已下滑(isAfter=true)  
B.新增一筆資料至SECURITY_SEARCH，START為這一次的SearchAfter,END為前一個的Before SearchAfter(程式碼2#489)  
Load資料給UI呈現，從SECURITY_SEARCH中的Start跟End還有DEV_UUID的欄位作為參數去撈取SECURITY_INFO的資料(程式碼2#491~#500)  

其它程式碼說明  
1、關於LoadDB的Function  
參見程式碼4  
圖4  
![img]({{site.imgurl}}/android/old/paging9.png)  
將以上三筆資料代入程式碼4  
若下一筆資料的END欄位的值與上一筆資料的START欄位的值為相同(程式碼4#283~285)，代表第一筆與第二筆的搜尋資料是連續性的，就繼續跑完整個迴圈(程式碼4#293~#295)  
若下一筆資料的END欄位的值與上一筆資料的START欄位的值不為相同(程式碼4#287~#290)，就直接讀完資料後跳出迴圈，不用去Load不連續的資料。  

2.關於資料的尾巴是要呈現轉圈圈還是”資料已經置底”  
程式碼6
![img]({{site.imgurl}}/android/old/paging10.png)  
(1)若SearchAfter為-1就代表沒下一頁資料(程式碼6#521)，將groupList的資料尾端加上FinishType的物件。知道這是最後一筆  
(2)若SearchAfter不為-1就代表還有下一頁資料，將groupList的尾端塞入LoadingType的物件，知道要顯示轉轉轉的圖示。  

3.
程式碼7 
![img]({{site.imgurl}}/android/old/paging11.png)  
把Log的資料，依據年月日分分類。(程式碼7#334~#341)  
最後再把資料組成一個有日期有Log的List(程式碼7#344~349)  
呈現過後的資料會長的像下面  
![img]({{site.imgurl}}/android/old/paging12.png)  
![img]({{site.imgurl}}/android/old/paging13.png) 

4. 判斷是那種類型
GET_THREAT_WARNING_LIST_AFTER=針對Threat&Waring有下一頁的資料進行處理(程式碼8#149)  
GET_THREAT_WARNING_LIST=針對Threat&Waring沒有下一頁的資料進行處理(程式碼8#153)  
GET_DEVICE_THREAT_WARNING_LIST_AFTER=針對DEVICE Threat&Waring有下一頁的資料進行處理(程式碼8#159)  
GET_DEVICE_THREAT_WARNING_LIST=針對DEVICE Threat&Waring沒有下一頁的資料進行處理(程式碼8#166)  
程式碼8
![img]({{site.imgurl}}/android/old/paging14.png) 

HistoryAdapter.java主要程式碼說明  

取得資料的EVENT-TYPE/CATEGORY_INDEX作為分辯，參考詳情請見eventLog.pptx
<https://drive.google.com/file/d/1UgQo1pkz947q0hhc1F1yA5OvAA6zNHAr/view?usp=sharing>
程式碼9 
![img]({{site.imgurl}}/android/old/paging15.png) 
程式碼10 
![img]({{site.imgurl}}/android/old/paging16.png)  