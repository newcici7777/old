---
title: Theme Change
date: 2023-05-29
keywords: Android, Theme Change
---

參考教學網頁
<https://blog.xujiaji.com/post/android-skin>
<https://github.com/burgessjp/ThemeSkinning>

1.匯入skinlibrary
```
implementation 'com.solid.skin:skinlibrary:2.0.0'
```

2.讓你的 Application 繼承於 SkinBaseApplication
```
import solid.ren.skinlibrary.SkinConfig;
import solid.ren.skinlibrary.base.SkinBaseApplication;
```
{% highlight java linenos %}
public class App extends SkinBaseApplication {
    private static Context context;
    @Override
    public void onCreate() {
        super.onCreate();
        SkinConfig.setCanChangeStatusColor(true);
        SkinConfig.setCanChangeFont(true);
        SkinConfig.setDebug(true);
//        SkinConfig.addSupportAttr("tabLayoutIndicator", new TabLayoutIndicatorAttr());
//        SkinConfig.addSupportAttr("button", new RadioButtonAttr());
//        SkinConfig.addSupportAttr("itemIconTint", new NavigationViewArr());
//        SkinConfig.addSupportAttr("tl_textSelectColor", new CommonTabLayoutArr());
//        SkinConfig.addSupportAttr("tl_textUnselectColor", new CommonTabLayoutArr());
//        SkinConfig.addSupportAttr("tl_mipmaps_select", new CommonTabLayoutArr());
//        SkinConfig.addSupportAttr("tl_mipmaps_unselect", new CommonTabLayoutArr());
       SkinConfig.enableGlobalSkinApply();
//        LeakCanary.install(this);
        context = getApplicationContext();
    }
    public static Context getAppContext() {
        return App.context;
    }
}
{% endhighlight %}

3.讓你的 Activity 繼承於 SkinBaseActivity，如果使用了 Fragment 則繼承於 SkinBaseFragment
{% highlight java linenos %}
public abstract class BaseActivity extends SkinBaseActivity {
}
public abstract class BaseFragment extends SkinBaseFragment {
}
{% endhighlight %}

4.繼承的SkinBaseFragment是support.v4
import android.support.v4.app.Fragment;

所以在BaseActivity中fragmentManager要支援 supportFragmentManager();
//fragmentManager = getFragmentManager();
fragmentManager = getSupportFragmentManager();

5.在需要換膚的根佈局上添加 xmlns:skin="http://schemas.android.com/android/skin" ，然後在需要換膚的View上加上 skin:enable="true"


6.新建一個項目模組（只包含有資源文件,例如本項目的 skinpackage 模組），其中包含的資源文件的 name 一定要和原項目中有換膚需求的 View 所使用的資源name一致。

7.拿到上一步生成的文件( ×××.apk )，改名為 ×××.skin，放入 assets 中的 skin 目錄下（ skin 目錄是自己新建的）

8.調用換膚
{% highlight java linenos %}
SkinManager.getInstance().loadSkin("pink0730.skin",
        new SkinLoaderListener() {
            @Override
            public void onStart() {
                Log.i("SkinLoaderListener", "正在切换中");
                //dialog.show();
            }

            @Override
            public void onSuccess() {
                Log.i("SkinLoaderListener", "切换成功");
                initView();
            }

            @Override
            public void onFailed(String errMsg) {
                Log.i("SkinLoaderListener", "切换失败:" + errMsg);
            }

            @Override
            public void onProgress(int progress) {
                Log.i("SkinLoaderListener", "皮肤文件下载中:" + progress);
            }
        }
);
{% endhighlight %}

9.回到預設skin
{% highlight java linenos %}
SkinManager.getInstance().restoreDefaultTheme();
{% endhighlight %}

10.ImageView注意事項
{% highlight html linenos %}
<ImageView
    android:id="@+id/imageView"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:layout_marginStart="8dp"
    android:layout_marginTop="8dp"
    android:layout_marginEnd="8dp"
    android:src="@drawable/house"
    />
{% endhighlight %}
不支援
app:srcCompat="@drawable/house"

11.程式中動態換skin
目前支援三種
{% highlight java linenos %}
public interface ThemeAttr {
    String background = "background";
    String textColor = "textColor";
    String src = "src";
}
{% endhighlight %}
例如：dynamicAddView(mDiagnoseText, ThemeAttr.textColor, R.color.color_b2b2b2);

12.若是Adapter，需把activity的Context代入，才能程式中換skin
{% highlight java linenos %}
((SkinBaseActivity) context).dynamicAddView(textView, ThemeAttr.textColor, R.color.default_text_description_color);
{% endhighlight %}

13.遇到的問題Glide
{% highlight java linenos %}
    /**
     * 使用glide加載圖片,For Change Theme
     *
     * @param rid  drawable resource id
     * @param view imageview
     */
    public static void loadToImageViewWithTheme(int rid, ImageView view) {
        Glide.with(Utils.getContext()).load(getImgByteArr(rid)).into(new GlideDrawableImageViewTarget(view));
    }
    public static byte[] getImgByteArr(int rid){
        SkinManager skinManager = SkinManager.getInstance();
        String resName = Utils.getContext().getResources().getResourceEntryName(rid);
        int theme_res_id = skinManager.getResources().getIdentifier(resName,"drawable",skinManager.getCurSkinPackageName());
        Bitmap bmp = BitmapFactory.decodeResource(skinManager.getResources(), theme_res_id);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        bmp.compress(Bitmap.CompressFormat.PNG, 100, baos);
        return baos.toByteArray();
    }
{% endhighlight %}

14.目前無法Change的項目
{% highlight java linenos %}
public class MultyDeviceAdapter extends PagerAdapter {}
{% endhighlight %}