---
title: In App Purchase Flow
date: 2023-05-29
keywords: Android, In App Purchase Flow
---
1.匯入google billing Lib   
{% highlight java linenos %}
dependencies {
    ...
    implementation 'com.android.billingclient:billing:2.0.3'
}
{% endhighlight %}

2.跟Google Store進行連線  
调用 newBuilder() 以创建 BillingClient 实例。您还必须调用 setListener()
{% highlight java linenos %}
private BillingClient billingClient;
...
billingClient = BillingClient.newBuilder(activity).setListener(this).build();
billingClient.startConnection(new BillingClientStateListener() {
    @Override
    public void onBillingSetupFinished(BillingResult billingResult) {
        if (billingResult.getResponseCode() == BillingResponse.OK) {
            // The BillingClient is ready. You can query purchases here.
        }
    }
    @Override
    public void onBillingServiceDisconnected() {
        // Try to restart the connection on the next request to
        // Google Play by calling the startConnection() method.
    }
});
{% endhighlight %}

3.查詢商品  
Subscription  
{% highlight java linenos %}
List<String> skuList = new ArrayList<>();
//skuList.add(BuildConfig.SUBSCRIPTION_ITEM_1_YEAR_ID);
skuList.add(BuildConfig.WSQ60_SUBSCRIPTION_ITEM_1_MONTH_ID);
SkuDetailsParams.Builder params = SkuDetailsParams.newBuilder();

/**
 * SUBS is subscriptions type
 */
params.setSkusList(skuList).setType(BillingClient.SkuType.SUBS);
billingClient.querySkuDetailsAsync(params.build(),
        new SkuDetailsResponseListener() {
            @Override
            public void onSkuDetailsResponse(BillingResult billingResult, List<SkuDetails> skuDetailsList) {
                querySubscriptionSkuDetailsArrayList = new ArrayList<>();
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                }
        }
});
{% endhighlight %}

Consumable
{% highlight java linenos %}
List<String> skuList = new ArrayList<> ();
skuList.add("com.zyxel.aishield.consumable.wsq50.1year");
skuList.add("com.zyxel.aishield.consumable.wsq50.8days”);
skuList.add("com.zyxel.aishield.consumable.wsq50.1day");
skuList.add("com.zyxel.aishield.consumable.wsq50.2hours”);

SkuDetailsParams.Builder params = SkuDetailsParams.newBuilder();
params.setSkusList(skuList).setType(SkuType.INAPP);
billingClient.querySkuDetailsAsync(params.build(),
    new SkuDetailsResponseListener() {
        @Override
        public void onSkuDetailsResponse(BillingResult billingResult,
                List<SkuDetails> skuDetailsList) {
            // Process the result.
        }
    });
{% endhighlight %}

4.選定要買的商品。購買！
{% highlight java linenos %}
BillingFlowParams flowParams = BillingFlowParams.newBuilder()
        .setSkuDetails(skuDetails)
        .setAccountId("scott")
        .build();
billingClient.launchBillingFlow((Activity) this, flowParams);
{% endhighlight %}

5.付款成功
{% highlight java linenos %}
billingClient = BillingClient.newBuilder(getApplicationContext())
        .enablePendingPurchases()
        .setListener(new PurchasesUpdatedListener() {
            @Override
            public void onPurchasesUpdated(BillingResult billingResult, @Nullable List<Purchase> purchases) {
                LogUtil.d(TAG, "PurchasesUpdatedListener responseCode = " + billingResult.getResponseCode());
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                                            for (Purchase purchase : purchases) {
                                                    handlePurchase(purchase);
                                            }
                                    } else if (billingResult.getResponseCode() == BillingResponse.USER_CANCELED) {
                                            // Handle an error caused by a user cancelling the purchase flow.
                                    } else {
                                            // Handle any other error codes.
                                    }
            }
        
}).build();
{% endhighlight %}
6.確認購買
确认购买交易

如果您使用的是 Google Play 结算库版本 2.0 或更高版本，则必须在三天内确认所有购买交易。如果没能正确确认，将导致系统对相应购买交易按退款处理。
您必须在授予用户权利后尽快确认通过 Google Play 结算库收到的所有处于 SUCCESS 状态的购买交易。如果您在三天内未确认购买交易，则用户会自动收到退款，并且 Google Play 会撤消该购买交易。对于待处理的交易，


您可以使用以下某种方法来确认购买交易： 

- 对于消耗型商品，请使用客户端 API 中的 consumeAsync()。
- 对于非消耗型商品，请使用客户端 API 中的 acknowledgePurchase()。
- 还可以使用服务器 API 中新增的 acknowledge() 方法。

{% highlight java linenos %}
ConsumeParams consumeParams = ConsumeParams.newBuilder()
        .setPurchaseToken(purchase.getPurchaseToken())
        .build();
billingClient.consumeAsync(consumeParams, (billingResult1, purchaseToken) -> {
    //如果消耗型的商品購買成功
    if(billingResult1.getResponseCode() == BillingClient.BillingResponseCode.OK){
    }else{
    }
});
{% endhighlight %}

(2)Subscription
{% highlight java linenos %}
AcknowledgePurchaseParams acknowledgePurchaseParams =
        AcknowledgePurchaseParams.newBuilder()
                .setPurchaseToken(purchase.getPurchaseToken())
                .setDeveloperPayload("scott testing developer payload")
                .build();
billingClient.acknowledgePurchase(acknowledgePurchaseParams, new AcknowledgePurchaseResponseListener() {
    @Override
    public void onAcknowledgePurchaseResponse(BillingResult billingResult) {
        LogUtil.d(TAG, "onAcknowledgePurchaseResponse Subscription getResponseCode = " + billingResult.getResponseCode());
        LogUtil.d(TAG, "onAcknowledgePurchaseResponse Subscription getDebugMessage = " + billingResult.getDebugMessage());
        if(billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK){
        }else{
        }
    }
});
{% endhighlight %}

(3)
{% highlight java linenos %}
BillingClient client = ...
AcknowledgePurchaseResponseListener acknowledgePurchaseResponseListener = ...

void handlePurchase(Purchase purchase) {
    if (purchase.getPurchaseState() == PurchaseState.PURCHASED) {
        // Grant entitlement to the user.
        ...

        // Acknowledge the purchase if it hasn't already been acknowledged.
        if (!purchase.isAcknowledged()) {
            AcknowledgePurchaseParams acknowledgePurchaseParams =
                AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchase.getPurchaseToken())
                    .build();
            client.acknowledgePurchase(acknowledgePurchaseParams, acknowledgePurchaseResponseListener);
        }
    }
}
{% endhighlight %}