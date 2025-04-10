---
title: Google Sign-In
date: 2023-05-29
keywords: Android, Google Sign-In
---
建立設定
1.先至Google APIS 新增專案。  
![img]({{site.imgurl}}/android/old/google_sign_in1.png)

2.先進入此網址  
[https://developers.google.com/identity/sign-in/android/start-integrating](https://developers.google.com/identity/sign-in/android/start-integrating)  

點擊Configure a project  
![img]({{site.imgurl}}/android/old/google_sign_in2.png)

3.選擇你剛才建的專案  
![img]({{site.imgurl}}/android/old/google_sign_in3.png)

4.選擇Android  
![img]({{site.imgurl}}/android/old/google_sign_in4.png)

5.輸入你的keystore的sha-1以及package Name  
![img]({{site.imgurl}}/android/old/google_sign_in5.png)

![img]({{site.imgurl}}/android/old/google_sign_in6.png)

6.把credentials.json下載下來，放置在你的project_folder/app目錄下  
![img]({{site.imgurl}}/android/old/google_sign_in7.png)

7.Gradle加上以下內容  
{% highlight groovy linenos %}
apply plugin: 'com.android.application'
    ...

    dependencies {
        implementation 'com.google.android.gms:play-services-auth:17.0.0'
    }
{% endhighlight %}

8.KeyStore的資訊也要加進Gradle(十分重要，不要run的時候會有Error)
{% highlight java linenos %}
android {
    signingConfigs {
        signed {
            storeFile file("/Users/cici/android-release.keystore")
            storePassword 'zyxelzyxel'
            keyAlias 'android-app'
            keyPassword 'zyxelzyxel'
        }
    }
    buildTypes {
        release {
            debuggable true
            minifyEnabled false
            signingConfig signingConfigs.signed
        }
        debug {
            signingConfig signingConfigs.signed
            debuggable true
        }
    }
}
{% endhighlight %}

進入整合Google Sign IN

1.在OnCreate加上以下這段
{% highlight java linenos %}
public class MainActivity extends AppCompatActivity {

    GoogleSignInClient mGoogleSignInClient;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestEmail()
                .build();
        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);
    }
}
{% endhighlight %}

2.建一個Sign In button以及Logout button
{% highlight html linenos %}
<com.google.android.gms.common.SignInButton
 android:id="@+id/sign_in_button"
 android:layout_width="wrap_content"
 android:layout_height="wrap_content" />
 <Button
    android:id="@+id/logout"
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text=“Logout”>
 {% endhighlight %}

Code裡面增加
{% highlight java linenos %}
SignInButton signInButton = findViewById(R.id.sign_in_button);
signInButton.setSize(SignInButton.SIZE_STANDARD);
findViewById(R.id.sign_in_button).setOnClickListener(this);
logoutBtn = findViewById(R.id.logout);
logoutBtn.setOnClickListener(this);
{% endhighlight %}

{% highlight java linenos %}
@Override
public void onClick(View v) {
    switch (v.getId()) {
        case R.id.sign_in_button:
            signIn();//登入
            break;
        case R.id.logout:
            LogOut();//登出
            break;
    }
}
{% endhighlight %}

3.Sign In
{% highlight java linenos %}
int  RC_SIGN_IN = 8989;
private void signIn() {
    Intent signInIntent = mGoogleSignInClient.getSignInIntent();
    startActivityForResult(signInIntent, RC_SIGN_IN);
}
{% endhighlight %}

(1)After the user signs in, you can get a GoogleSignInAccount object for the user in the activity's onActivityResult method.
登入後，透過OnActivityResult()可以取得GoogleSignInAccount物件
{% highlight java linenos %}
@Override
public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    // Result returned from launching the Intent from GoogleSignInClient.getSignInIntent(...);
    if (requestCode == RC_SIGN_IN) {
        // The Task returned from this call is always completed, no need to attach
        // a listener.
        Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
        handleSignInResult(task);
    }
}
{% endhighlight %}
(2)The GoogleSignInAccount object contains information about the signed-in user, such as the user's name.
GoogleSignInAccount物件包含登入過後的使用者資訊
{% highlight java linenos %}
private void handleSignInResult(Task<GoogleSignInAccount> completedTask) {
    try {
        GoogleSignInAccount account = completedTask.getResult(ApiException.class);
        String idToken = account.getIdToken();
        Log.d(TAG, "handleSignInResult: idToken:"+idToken);
        // Signed in successfully, show authenticated UI.
        updateUI(account);
    } catch (ApiException e) {
        // The ApiException status code indicates the detailed failure reason.
        // Please refer to the GoogleSignInStatusCodes class reference for more information.
        Log.w(TAG, "signInResult:failed code=" + e.getStatusCode());
        updateUI(null);
    }
}
{% endhighlight %}

(3)取得使用者資訊在UI上呈現
{% highlight java linenos %}
private void updateUI(GoogleSignInAccount account){
    Log.d(TAG,"account:"+account.toString());
    GoogleSignInAccount acct = GoogleSignIn.getLastSignedInAccount(this);
    if (acct != null) {
        String personName = acct.getDisplayName();
        String personGivenName = acct.getGivenName();
        String personFamilyName = acct.getFamilyName();
        String personEmail = acct.getEmail();
        String personId = acct.getId();
        Uri personPhoto = acct.getPhotoUrl();
        Log.d(TAG, "updateUI: personName:"+personName+"/personGivenName:"+personGivenName+"/personEmail:"+personEmail);
    }
}
{% endhighlight %}

4.Logout
{% highlight java linenos %}
private void LogOut() {
    mGoogleSignInClient.signOut()
            .addOnCompleteListener(this, new OnCompleteListener<Void>() {
                @Override
                public void onComplete(@NonNull Task<Void> task) {
                    // ...
                    Log.d(TAG, "onComplete: logout");
                }
            });
}
{% endhighlight %}

5.OnStart()
透過onStart()，可以檢查user是否登入，若登入過，就把GoogleSignInAccount的物件傳到UI呈現。
{% highlight java linenos %}
    @Override
    protected void onStart() {
        super.onStart();
// Check for existing Google Sign In account, if the user is already signed in
// the GoogleSignInAccount will be non-null.
        GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
        updateUI(account);
    }
{% endhighlight %}

6.使用Web Client ID(不使用credentials.json的狀況)
![img]({{site.imgurl}}/android/old/google_sign_in8.png)

GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
        .requestIdToken("558740131695-mpgk6rctv01ve056neruglk2anl3vb5k.apps.googleusercontent.com")
        .requestEmail()
        .build();

參考文件：  
<https://developers.google.com/identity/sign-in/android/start-integrating>  
<https://developers.google.com/identity/sign-in/android/sign-in>  
<https://medium.com/@alif.valutac/how-to-fix-error-10-google-sign-in-problem-410cba2a9735>  