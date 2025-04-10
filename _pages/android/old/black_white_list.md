---
title: black white list
date: 2023-05-17
keywords: android
---
![img]({{site.imgurl}}/android/old/black_white_list.png)

增加黑白名單
HistoryDetailActivity.java

{% highlight java linenos %}
@OnClick({R.id.backbtn, R.id.forbiden_btn, R.id.add_img})
public void onViewClicked(View view) {
  switch (view.getId()) {
    case R.id.backbtn:
      onBackPressed();
      break;
    case R.id.add_img://跟下面是做相同的事情
    case R.id.forbiden_btn:
      showLoadView();
      EventType eventType = EventType.fromStr(securityInfo.getEventType());
      SecurityType securityType = SecurityType.fromStr(securityInfo.getEventClass());
      if (securityType == SecurityType.THREAT) {
        switch (eventType) {
          case AV:
            mXmppController.setAVWhiteList(securityInfo.getMd5(), securityInfo.getFileName());
            break;
          case IR:
            mXmppController.setIRWhiteList(securityInfo.getRemotIP());
            break;
          case IPS:
            mXmppController.setIPSWhiteList(securityInfo.getSid(), eventlog_category);
            break;
          case WSB:
            mXmppController.setWSBWhiteList(securityInfo.getRemoteURL());
            break;
          default:
        }
      } else if (securityType == SecurityType.WARNING) {
        switch (eventType) {
          case IPS:
            mXmppController.setIPSBlackList(securityInfo.getSid(), eventlog_category);
            break;
          case WSB:
            mXmppController.setWSBBlackList(securityInfo.getRemoteURL());
            break;
          case IR:
            mXmppController.setIRBlackList(securityInfo.getRemotIP());
            break;
          default:
        }
      }
  }
}
{% endhighlight %}

BlackWhiteGroup.java
{% highlight java linenos %}
public class BlackWhiteGroup implements Serializable {
  private String title;
  private boolean isChecked;//是否有checkbox可以按
  private EventType eventType;//屬於av/ips/ir/wsb
  private EnumBlackWhite blackWhiteEnum;//是白名單white還是黑名單black
  private boolean isExpend;//是否展開
  public boolean isExpend() {
    return isExpend;
  }
  public void setExpend(boolean expend) {
    isExpend = expend;
  }
  private List<BlackWhiteItem> list = new ArrayList<>();
  public List<BlackWhiteItem> getList() {
    return list;
  }
  public void addItem(BlackWhiteItem item) {
    list.add(item);
  }
  public void clearList(){
    list.clear();
  }
  public String getTitle() {
    return title;
  }
  public void setTitle(String title) {
    this.title = title;
  }
  public boolean isChecked() {
    return isChecked;
  }
  public void setChecked(boolean checked) {
    isChecked = checked;
  }
  public EventType getEventType() {
    return eventType;
  }
  public void setEventType(EventType eventType) {
    this.eventType = eventType;
  }
  public EnumBlackWhite getBlackWhiteEnum() {
    return blackWhiteEnum;
  }
  public void setBlackWhiteEnum(EnumBlackWhite blackWhiteEnum) {
    this.blackWhiteEnum = blackWhiteEnum;
  }
  public int getSize() {
    return list.size();
  }
}
{% endhighlight %}

BlackWhiteListActivity.java
讀取白名單
{% highlight java linenos %}
mXmppController.getCyberSecurityInfo(true);
{% endhighlight %}

共用的
{% highlight java linenos %}
StructCyberSecurity structCyberSecurity = (StructCyberSecurity) notifyXmppEvent.getresponseData();
{% endhighlight %}

AV
{% highlight java linenos %}
if (mBlackWhiteEnum == EnumBlackWhite.WHITE) {
  ArrayList<StructMd5WhiteListElement> avBlackWhiteList = structCyberSecurity.mAntiVirus.mMd5WhiteList;
  BlackWhiteGroup avWhiteList = new BlackWhiteGroup();
  avWhiteList.setBlackWhiteEnum(EnumBlackWhite.WHITE);
  avWhiteList.setEventType(EventType.AV);
  for (StructMd5WhiteListElement avElement : avBlackWhiteList) {
    BlackWhiteItem item = new BlackWhiteItem();
    item.setDesc(avElement.getFileDescription());
    item.setItem_name(avElement.getMd5());
    item.setEventType(EventType.AV);
    item.setEnumBlackWhite(EnumBlackWhite.WHITE);
    avWhiteList.addItem(item);
  }
  if (avWhiteList.getSize() > 0)
    mGroupList.add(avWhiteList);
}
{% endhighlight %}

IR
{% highlight java linenos %}
ArrayList<StructIrBlackWhiteListElement> irBlackWhiteList = structCyberSecurity.mIpReputation.mIrBlackWhiteList;
BlackWhiteGroup irWhiteList = new BlackWhiteGroup();
irWhiteList.setBlackWhiteEnum(EnumBlackWhite.WHITE);
irWhiteList.setEventType(EventType.IR);
BlackWhiteGroup irBlackList = new BlackWhiteGroup();
irBlackList.setBlackWhiteEnum(EnumBlackWhite.BLACK);
irBlackList.setEventType(EventType.IR);
for (StructIrBlackWhiteListElement irElement : irBlackWhiteList) {
  BlackWhiteItem item = new BlackWhiteItem();
  item.setItem_name(irElement.getIp());
  item.setEventType(EventType.IR);
  EnumTypeOfSignature type = irElement.getTypeOfIp();
  if (type == EnumTypeOfSignature.ENUM_WHITE_LIST) {
    item.setEnumBlackWhite(EnumBlackWhite.WHITE);
    irWhiteList.addItem(item);
  } else if (type == EnumTypeOfSignature.ENUM_BLACK_LIST) {
    item.setEnumBlackWhite(EnumBlackWhite.BLACK);
    irBlackList.addItem(item);
  }
}
if (irBlackList.getSize() > 0 && mBlackWhiteEnum == EnumBlackWhite.BLACK)
  mGroupList.add(irBlackList);
if (irWhiteList.getSize() > 0 && mBlackWhiteEnum == EnumBlackWhite.WHITE)
  mGroupList.add(irWhiteList);
{% endhighlight %}

IPS
{% highlight java linenos %}
ArrayList<StructIpsBlackWhiteListElement> ipsBlackWhiteList = structCyberSecurity.mIps.mIpsBlackWhiteList;
BlackWhiteGroup ipsBlackList = new BlackWhiteGroup();
ipsBlackList.setBlackWhiteEnum(EnumBlackWhite.BLACK);
ipsBlackList.setEventType(EventType.IPS);
BlackWhiteGroup ipsWhiteList = new BlackWhiteGroup();
ipsWhiteList.setBlackWhiteEnum(EnumBlackWhite.WHITE);
ipsWhiteList.setEventType(EventType.IPS);
for (StructIpsBlackWhiteListElement ipsElement : ipsBlackWhiteList) {
  BlackWhiteItem item = new BlackWhiteItem();
  EnumTypeOfSignature type = ipsElement.getTypeOfSignature();
  item.setEventType(EventType.IPS);
  item.setItem_name(ipsElement.getSignatureId());
  item.setDesc(ipsElement.getSignatureDescription());
  LogUtil.d(TAG, "signatureid:" + ipsElement.getSignatureId() + "/" + ipsElement.getSignatureDescription());
  if (type == EnumTypeOfSignature.ENUM_WHITE_LIST) {
    item.setEnumBlackWhite(EnumBlackWhite.WHITE);
    ipsWhiteList.addItem(item);
  } else if (type == EnumTypeOfSignature.ENUM_BLACK_LIST) {
    item.setEnumBlackWhite(EnumBlackWhite.BLACK);
    ipsBlackList.addItem(item);
  }
}
if (ipsBlackList.getSize() > 0 && mBlackWhiteEnum == EnumBlackWhite.BLACK)
  mGroupList.add(ipsBlackList);
if (ipsWhiteList.getSize() > 0 && mBlackWhiteEnum == EnumBlackWhite.WHITE)
  mGroupList.add(ipsWhiteList);
{% endhighlight %}
