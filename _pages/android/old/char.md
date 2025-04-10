---
title: Security圖表存取資料庫的方式
date: 2023-05-29
keywords: Android, char
---
程式碼1  
![img]({{site.imgurl}}/android/old/char1.png)

若沒有insert過，就預設找出前30天的資料。  
程式碼1#235，代入localtime的11/2號的00:00:00與現在時間  
圖1  
![img]({{site.imgurl}}/android/old/char2.png)

Json資料如下：  
![img]({{site.imgurl}}/android/old/char3.png)

![img]({{site.imgurl}}/android/old/char4.png)

資料表Event Log
![img]({{site.imgurl}}/android/old/char5.png)

{% highlight java linenos %}
/**
 * 演算法：先移到這個禮拜的最後一天，取得這個禮拜的最後一天的日期，再往前減七天，就可以取得這個禮拜的第一天
 * 再往前減一天，就取得上一個禮拜的最後一天，再往前減6天，就取得上一個禮拜的第1天。
 * 再往前減一天，就取得上上一個禮拜的最後一天，再往前減6天，就取得上上一個禮拜的第1天。以此往下類推。
 * 
 * 回傳Array的格式為
 * [0][0]=這個禮拜的第一天   [0][1]=這個禮拜的最後一天
 * [1][0]=上禮拜的第一天     [1][1]=上禮拜的最後一天
 * [2][0]=上上禮拜的第一天   [2][1]=上上禮拜的最後一天
 * [3][0]=上上上禮拜的第一天 [3][1]=上上上禮拜的最後一天
 * [4][0]=上上上上禮拜的第一天 [4][1]=上上上上禮拜的最後一天
 * 
 * 顯示前30天的周區間
 * 假設今天是台灣時間2019/01/14，星期是日一二三四五六排序*
 * 回傳的week array如下
 * [0]=Start Time     [1]=End Time
 * [0][0]=2019/1/13   [0][1]=2019/1/19
 * [1][0]=2019/1/06   [1][1]=2019/1/12
 * [2][0]=2018/12/30  [2][1]=2019/1/05
 * [3][0]=2018/12/23  [3][1]=2018/12/29
 * [4][0]=2018/12/16  [4][1]=2018/12/22
 *
 * @return
 */
public static long[][] get4WeekStartEnd() {
    long[][] weekArr = null;
    int weekCnt = 5;//只抓五周
    Locale locale = Locale.getDefault();
    TimeZone default_tz = TimeZone.getDefault();
    Calendar c = Calendar.getInstance(default_tz, locale);

    c.set(Calendar.HOUR_OF_DAY, 23);
    c.set(Calendar.MINUTE, 59);
    c.set(Calendar.SECOND, 59);

    int day_of_thisWeek = c.get(Calendar.DAY_OF_WEEK);//取出今天是一個禮拜的第幾天
    //參考資料http://chartsbin.com/view/41671
    int first_of_thisWeek = c.getFirstDayOfWeek();//取得一個禮拜的第一天是禮拜幾(英國第一天是禮拜一，台灣第一天是禮拜天，阿富汗的第一天是禮拜六)
    //禮拜天->1，禮拜一->2，禮拜二->3，禮拜三->4，禮拜四->5，禮拜五->6，禮拜六->7
    int between_days = SecurityConstant.WEEK_DAYS - day_of_thisWeek;//這是假設first day of week是禮拜天，若今天是禮拜二，day會回傳3   7-3=4，也就是禮拜二到禮拜六之間有四天
    if (first_of_thisWeek == SecurityConstant.WEEK_DAYS) {//first day of week是禮拜六，回7
        between_days -= 1;
    } else if (first_of_thisWeek == 2) {//first day of week是禮拜一，回2
        between_days += 1;
    }
    if (between_days >= 5)//若這周只過完剩下6天或7天，就顯示
        weekCnt = 6;//抓六周資料

    weekArr = new long[weekCnt][2];
    c.add(Calendar.DAY_OF_MONTH, between_days + 1);///移到這個禮拜的最後一天再加1天(請對映演算法說明)
    for (int i = weekCnt - 1; i >= 0; i--) {//只抓五周
        c.add(Calendar.DAY_OF_MONTH, -1);//再往前減一天，就取得這個禮拜的最後一天(請對映演算法說明)
        weekArr[i][1] = c.getTimeInMillis() / 1000;//endtime
        c.set(Calendar.HOUR_OF_DAY, 0);
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        c.add(Calendar.DAY_OF_MONTH, -6);//再往前減6天，就取得這禮拜的第1天。(請對映演算法說明)

        weekArr[i][0] = c.getTimeInMillis() / 1000;//start time
        LogUtil.d(TAG, APPUtils.timestampToYMMMD(weekArr[i][1]) + "-" + APPUtils.timestampToYMMMD(weekArr[i][0]));
    }
    return weekArr;
}
{% endhighlight %}

排名次的圖表
String json = "{\"start_time\":1527951600,\"end_time\":1528023600,\"query\":{\"dev-uuid\":\"550e8400-e29b-41d4-a716-446655440000\"},\"terms\":[\"client-mac\",\"event-class\"],\"ranking_size\": 10}”;