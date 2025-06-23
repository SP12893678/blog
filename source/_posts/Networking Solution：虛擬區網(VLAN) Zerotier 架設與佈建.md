title: Networking Solution：虛擬區網(VLAN) Zerotier 架設與佈建
description: 

categories:
  - Network

tags:
  - Network
  - VLAN
  - Zerotier

keywords: Network, VLAN, Zerotier
date: 2024-9-5 12:00:00
copyright_info: 此文章版權歸JUN-HONG所有，如有轉載，請註明來自原作者

cover: https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/banner_zerotier-server.png
---

## 前言

在現代網路環境中，伺服器通常具有公開 IP，允許來自全球的裝置進行存取。然而，家用電腦或小型辦公室的設備通常沒有固定 IP，且基於安全考量，不會直接對外開放。這使得遠端存取變得困難，尤其是當我們希望在不同地點的設備之間建立安全且穩定的連線時。

區域網路（LAN）提供了一個封閉、安全的內部網路環境，讓同一網段的設備能夠直接互通，但它的範圍僅限於物理位置。一旦設備處於不同的網路（如家用網路與公司網路），就需要透過 VPN、NAT 穿透或其他技術來建立連接。

虛擬區域網路（VLAN）和軟體定義網路（SDN）技術應運而生，讓我們能夠在不同的網路環境中模擬 LAN。ZeroTier 作為一種軟體定義網路解決方案，允許使用者輕鬆建立自己的虛擬網路，無需傳統 VPN 的複雜設定，並提供類似 LAN 的體驗。

過去架設Minecraft伺服器邀請與朋友遊玩時，也是運用了虛擬區域網路的方式，讓朋友可以透過虛擬IP訪問到Server。

## 章節重點

- 環境準備
    - 2台設備 + 虛擬機VM (私人中繼器方案)
    - Docker安裝
    - Zerotier安裝
- Zerotier概念介紹
- Zerotier雲服務建構虛擬區域網路
- 私人Zerotier中繼器 - 架構說明
- 私人Zerotier中繼器 - Server架設
- 私人Zerotier中繼器 - Client連線方法
- 私人Zerotier中繼器 - 其他常用API操作

## 環境準備

### 安裝Docker

Ubuntu Docker安裝指令如下： 

```bash
#  移除舊版本的docker
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
sudo apt-get update

sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 測試是否安裝成功
docker -v
```

給予使用者Docker權限

```bash
# 將$USER加入docker群組
sudo usermod -aG docker $USER

# 切換群組
newgrp docker
```

### Zerotier安裝

https://www.zerotier.com/download/

安裝完畢後，在常駐區域可以看到相關狀態

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/zerotier-server/image.png)

## Zerotier概念介紹

ZeroTier 是一款功能強大的虛擬網路解決方案，透過軟體定義網路（SDN）技術與點對點加密連線，讓分散於不同網路環境中的裝置，就像處於同一個區域網路中一樣互相連結，達成安全又方便的遠端存取與網路管理

## Zerotier雲服務建構虛擬區域網路

前往 [https://my.zerotier.com/](https://my.zerotier.com/) 登入

選Login In/Sign Up

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/zerotier-server/image%201.png)

### 建立虛擬區域網路

選Create A Network

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/zerotier-server/image%202.png)

建立成功後，就會多一筆Network ID

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/zerotier-server/image%203.png)

### 選擇區域網路區段CIDR

可以選擇自己偏好的虛擬網路區段，以避免撞到

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/zerotier-server/image%204.png)

### 加入虛擬區域網路

我們可以複製剛才的Network ID，來加入虛擬區網

在常駐程式右鍵選擇Join network就可以輸入Network ID

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/zerotier-server/image%205.png)

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/zerotier-server/image%206.png)

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/zerotier-server/image%207.png)

### 授權裝置加入

加入成功後，到管理頁面點那筆區域網路

可以看到有一筆裝置要加入，但尚未授權

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/zerotier-server/image%208.png)

勾選這筆成員，做授權行為

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/zerotier-server/image%209.png)

授權成功會呈現綠色勾勾

此時這筆裝置就成功加入虛擬區網，並擁有權限可以訪問該區網內的服務

並且每台裝置會被分配到特定的IP，可見圖中Managed IPs欄位

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/zerotier-server/image%2010.png)

## 私人Zerotier中繼器 - 架構說明

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/zerotier-server/image%2011.png)

## 私人Zerotier中繼器 - Server架設

首先我們在私人的Server安裝Zerotier後

{% note info flat no-icon %}
私人Zerotier中繼器必須是可以所有裝置皆可以連到的網路環境
{% endnote %}

### 初始化設定moon世界定義

透過zerotier-idtool初始化設定moon世界定義(world definition)的檔案 (`identity.public`為辨識用的金鑰)

```shell
zerotier-idtool initmoon /var/lib/zerotier-one/identity.public >> moon.json
```

### 編輯moon.json

在roots找到屬於該root server該筆資料，可用`identity.public`(通常只有一筆)

編輯`stableEndpoints`，填入ip:port，表示該root server的連線方式

如以下：

```json
{
 "id": "4de710377a",
 "objtype": "world",
 "roots": [
  {
   "identity": "4de710377a:0:636fcd4ae5e3283ea33977005ef09e04e725fc0544b2796d20f1ce4cafcb4031477715427e12eb061e4f14fdd2b4fdd7dc8c91f03577e141218d854bc1b571b3",
   "stableEndpoints": ["172.207.27.6/9993"]
  }
 ],
 "signingKey": "...xxxxxx",
 "signingKey_SECRET": "...xxxxxx",
 "updatesMustBeSignedBy": "...xxxxxx",
 "worldType": "moon"
}
```

### 產生已簽證的真實世界

將會產生一個000000<node-id>.moon檔案，不包含金鑰，但由moon.json的金鑰做簽署

```shell
zerotier-idtool genmoon moon.json
```

### 將簽證好的moon設定檔放入根節點紀錄區

該設定檔用來了解root server的資訊(連線ip等等)

**其他要加入虛擬網路的節點都需要將該檔案放到此路徑下，這樣才知道要找根節點溝通**

```shell
mkdir /var/lib/zerotier-one/moons.d
cp 000000<node-id>.moon /var/lib/zerotier-one/moons.d
```

{% note info flat no-icon %}
Reference: [https://docs.zerotier.com/roots/](https://docs.zerotier.com/roots/)
{% endnote %}


### 重啟Zerotier

Linux

```shell
# stop
systemctl stop zerotier-one

# start
systemctl start zerotier-one
```

MacOS

```shell
# stop
sudo launchctl unload /Library/LaunchDaemons/com.zerotier.one.plist

# start
sudo launchctl load /Library/LaunchDaemons/com.zerotier.one.plist
```

{% note info flat no-icon %}
Reference: [https://docs.zerotier.com/controller#clean-up-networks](https://docs.zerotier.com/controller#clean-up-networks)
{% endnote %}

**網路控制器**

資料儲存在controller.d目錄下

{% note info flat no-icon %}
Zerotier建議根伺服器不要充當網路控制器、加入網路或執行任何其他重疊功能
它們需要良好可靠的網路連接，但需要很少的 RAM、儲存或 CPU
因此該網路控制器可設定在根節點上，也可找另一台虛擬機來管理網路設定相關任務
若為別的虛擬機也一樣要把client端 根節點設定上去
{% endnote %}


## 私人Zerotier中繼器 - 建立虛擬區域網路

這邊我們將透過Zerotier Restful API來在我們的Zerotier中繼器執行虛擬區網管理的事情

{% note info flat no-icon %}
Zerotier Restful API
[https://docs.zerotier.com/service/v1#tag/Controller/operation/network_postNetwork](https://docs.zerotier.com/service/v1#tag/Controller/operation/network_postNetwork)
{% endnote %}


### 前置環境變數設定

官方文件提供curl或cli方式來進行網路設定操作

curl有部分需要設定環境變數

TOKEN設定：`TOKEN=$(sudo cat /var/lib/zerotier-one/authtoken.secret)`

NODEID設定：`NODEID=$(sudo zerotier-cli info | cut -d " " -f 3)`

### 新增虛擬網路設定

```shell
curl -X POST "http://localhost:9993/controller/network/${NODEID}______" -H "X-ZT1-AUTH: ${TOKEN}" -d {}
```

當送出以上api後controller會產生`隨機的Network ID`

回傳是一筆json格式，其中id欄位為network id

NWID設定：`NWID=<your-network-id>`

### 列出虛擬網路清單

新增後，我們可以檢查清單是否有新增的網路id

```shell
curl "http://localhost:9993/controller/network" -H "X-ZT1-AUTH: ${TOKEN}"
```

### 取得特定虛擬網路資訊

若想要看詳細資訊，可以執行這段指令

```shell
curl "http://localhost:9993/controller/network/${NWID}" -H "X-ZT1-AUTH: ${TOKEN}"
```

### 更新特定虛擬區域網路資訊

我們可以針對該區域網路更改名稱資訊，以便區隔其他區網

```shell
curl -X POST "http://localhost:9993/controller/network/${NWID}" -H "X-ZT1-AUTH: ${TOKEN}" -d '{"name": "<the-network-name>"}'
```

### 設定特定虛擬網路管理IP區段(CIDR)

設定管理區段，讓加入網路的節點分配到的ip為該ip區段的範圍

ipRangeStart: 192.168.196.1

ipRangeEnd: 192.168.196.254

target: 192.168.196.0/24

```shell
curl -X POST "http://localhost:9993/controller/network/${NWID}" -H "X-ZT1-AUTH: ${TOKEN}" \
    -d '{"ipAssignmentPools": [{"ipRangeStart": "192.168.196.1", "ipRangeEnd": "192.168.196.254"}], "routes": [{"target": "192.168.196.0/24", "via": null}], "v4AssignMode": "zt", "private": true }'
```

此時我們已經設定好基本的區域網路設置了，可以先跳到Client去設置要連私人中繼器，並加入區域網路

### 列出特定虛擬網路成員

透過該API可以知道目前成員有哪些，以及授權狀態

```shell
curl "http://localhost:9993/controller/network/${NWID}/member" -H "X-ZT1-AUTH: ${TOKEN}"
```

### 授權特定網路特定成員

```shell
curl -X POST "http://localhost:9993/controller/network/${NWID}/member/${MEMID}" -H "X-ZT1-AUTH: ${TOKEN}" -d '{"authorized": true}'
```

### 取得特定虛擬網路特定成員資訊

```shell
MEMID=a-member's-node-id
curl "http://localhost:9993/controller/network/${NWID}/member/${MEMID}" -H "X-ZT1-AUTH: ${TOKEN}"
```

## 私人Zerotier中繼器 - Client連線方法

### 取得Root Server簽證的世界定義設定檔

這邊要將簽證的檔案給予client端，並放入根節點紀錄區moons.d

讓client端知道連線虛擬網路要與Root Server溝通

```shell
mkdir /var/lib/zerotier-one/moons.d
cp 000000<node-id>.moon /var/lib/zerotier-one/moons.d
```

### 重啟Zerotier

Linux

```shell
# stop
systemctl stop zerotier-one

# start
systemctl start zerotier-one
```

MacOS

```shell
# stop
sudo launchctl unload /Library/LaunchDaemons/com.zerotier.one.plist

# start
sudo launchctl load /Library/LaunchDaemons/com.zerotier.one.plist
```

{% note info flat no-icon %}
Reference: [https://docs.zerotier.com/controller#clean-up-networks](https://docs.zerotier.com/controller#clean-up-networks)
{% endnote %}

### 檢查根節點是否加入連結清單

此時會看到其中一個節點為MOON字眼的類別，並且查看ip是否是自架設機器的ip

有出現代表已經設定成功

```shell
zerotier-cli listpeers
```

### 加入網路

```shell
zerotier-cli join <network-id>
```

### 等待授權&檢查是否加入網路

透過以下指令可以看到網路清單，其中可看該network-id狀態是否為OK

OK表示已授權，並且可看到自己被分配的IP

```shell
zerotier-cli listnetworks
```

## 私人Zerotier中繼器 - 其他常用API操作

### 解除授權特定網路特定成員

```shell
curl -X POST "http://localhost:9993/controller/network/${NWID}/member/${MEMID}" -H "X-ZT1-AUTH: ${TOKEN}" -d '{"authorized": false}'
```

### 刪除特定網路特定成員

```shell
curl -X DELETE "http://localhost:9993/controller/network/${NWID}/member/${MEMID}" -H "X-ZT1-AUTH: ${TOKEN}
```

## 結語

Zeortier是一個網路面向的解決方案，雖然沒有提供CLI以及UI可以方便管理，但開源專案也有可以整合過，可參考使用的UI介面