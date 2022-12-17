title: 使用 Docker Compose 一次建立 Nginx 伺服器 & Cerbot(SSL自動憑證)
description: 網路發展迅速，人們使用網際網路於網頁上獲取新知，網站之間傳輸需經由安全加密以避免有心人士從中做壞，因此SSL（Secure Sockets Layer）憑證是一種用於網站的安全證書，它可以保證在傳送數據時保持安全性。通常SSL憑證來源可以由SSL憑證供應商取得，不過可能需要付出一定非用。當然也有免費的來源，而免費的憑證服務有效期限為90天，一段時間就得重複同樣操作其實浪費時間與心力，若有自動化的方式何不為樂呢。因此這次帶來容器化方式一次將所有服務設置完成。

categories:
  - web伺服器
tags:
  - ssl
  - dns
  - certbot
  - cloudflare
  - google cloud
  - docker
  - docker compose
keywords: ssl,dns,certbot,docker,docker compose
date: 2022-09-06 12:00:00
copyright_info: 此文章版權歸JUN-HONG所有，如有轉載，請註明來自原作者

cover: https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/banner_ssl-certbot-nginx-dockercompose.png
---

## 前言
網路發展迅速，人們使用網際網路於網頁上獲取新知，網站之間傳輸需經由安全加密以避免有心人士從中做壞，因此SSL（Secure Sockets Layer）憑證是一種用於網站的安全證書，它可以保證在傳送數據時保持安全性。通常SSL憑證來源可以由SSL憑證供應商取得，不過可能需要付出一定非用。當然也有免費的來源，而免費的憑證服務有效期限為90天，一段時間就得重複同樣操作其實浪費時間與心力，若有自動化的方式何不為樂呢。因此這次帶來容器化方式一次將所有服務設置完成。

### 什麼是Docker & Docker Compose?

Docker 將軟體封裝到名為容器的標準化單位，容器是在作業系統層上虛擬化，並將容器獨立環境且直接使用系統OS資源，無須安裝/虛擬化作業系統。透過Docker可以最小化方式建立微服務且能快速啟動、停止、刪除等操作。其中Jekins與SonarQube都有各自的image提供在Docker hub上。

Docker Compose是為了協助定義和運行多容器應用程式而開發的工具，利用 YAML 檔案來配置需要的服務以及服務的環境設定。

### 什麼是Nginx?

Nginx是非同步框架的網頁伺服器，也可以用作反向代理、負載平衡器和HTTP快取。與Apache網頁伺服器都相當知名，Nginx設置簡易，記憶體消耗低，反向代理＆負載平衡功能也很不錯

#### 什麼是SSL憑證?

SSL是Secure Socket Layer的縮寫，是一種資訊傳輸的加密技術，能夠加密兩個網站之間互相傳輸的資料，讓他人無法取得您的網站與客戶之間的隱私訊息。經過SSL憑證加密成功的網站，網址會由http變成https。

### 為什麼需要SSL憑證?

剛剛提到SSL是資料傳輸的加密技術，可以知道當網站與使用者互動時輸入的資料是有被加密過的。那反之，如果沒有SSL不就意謂著你的資料是裸露的，有心人士若攔截封包，就可以輕易取得你的資料，因為沒有加密，不需要解密過程。

## 實作重點

- 環境準備
    - 準備域名
    - 安裝Docker
    - 安裝Docker-Compose
- 服務架設 for 一般域名憑證申請方式
    - 設置docker-compose.yml容器化服務的環境與配置
    - 啟動主要容器服務
    - 設置docker-composeLE.yml，首次憑證申請容器服務
    - 啟動首次憑證申請容器服務，完成SSL憑證申請
    - Nginx SSL設置
    - 切換容器服務啟動自動SSL憑證申請
- 服務架設 for 萬用子域憑證申請方式
    - DNS服務管理權限金鑰申請
    - 設置docker-compose.yml、docker-composeLE.yml容器化服務的環境與配置
    - 啟動主要容器服務
    - 啟動首次憑證申請容器服務，完成SSL憑證申請
    - Nginx SSL設置
    - 切換容器服務啟動自動SSL憑證申請


## 環境準備
環境只要安裝Docker跟Docker-Compose而已，可以知道接下來的設置都會在容器中，大幅降低環境汙染

### 準備域名

域名就跟車牌一樣有貴的有便宜的，而免費也有。freenom提供許多免費一年的域名供使用者申請。

輸入你想要的域名，從圖中可以看到freenom給予一些選擇, 有些可以使用有些已經被使用過了
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/freenom-1.jpg)


接著選擇使用期限，一年之前都是免費的。如果一年到期的話其實還可以繼續申請同一個，也還是免費。而且在過期前一個月就可以先續約，相當於優先權。
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/freenom-2.jpg)


申請完畢後，前往我的域名以管理域名
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/freenom-3.jpg)


在域名這邊我們可以設定該域名指向的IP位置，我的域名是指到github page的服務上，若自己有虛擬機也可以指向自己的公開IP上
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/freenom-4.jpg)


### 安裝Docker
Docker安裝指令如下：

```bash
#  移除舊版本的docker
sudo apt-get remove docker docker-engine docker.io containerd runc

sudo apt-get update

sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

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
### 安裝Docker-Compose
Docker Compose安裝指令如下：

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

# 測試是否安裝成功
docker-compose --version
```

## 服務架設 for 一般域名憑證申請方式

一般域名在憑證申請上只要證明該域名是你的即可，通常只要依照規定在伺服器內設置路由，憑證機器人會在該路由處產生一個token檔，讓它驗證是否能夠順利訪問，若訪問成功憑證機器人就認可該域名是你擁有的。

### 設置docker-compose.yml容器化服務的環境與配置

我們的docker-compose.yml總共會有3個角色

1. 網頁伺服器: Nginx
2. 開發的服務: 前端、後端等等
3. 證書機器人: Cerbot

至少會有3個容器服務，這次開發的服務我使用Jenkins作為範例，以下是我的docker-compose.yml：

```yaml
version: '3.1'

services:
   nginx:
    image: nginx:latest
    container_name: nginx
    restart: always
    environment:
      - TZ=Asia/Taipei
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./logs:/var/log/nginx
      - ./nginx:/etc/nginx/conf.d    
      - ./nginx/certbot/conf:/etc/nginx/ssl
      - ./nginx/certbot/data:/var/www/certbot
    command: "/bin/sh -c 'while :; do sleep 6h & wait $${!}; nginx -s reload; done & nginx -g \"daemon off;\"'"
    networks:
      - nginx

 jenkins:
    image: jenkins/jenkins:lts
    container_name: 'jenkins'
    ports:
      - "8080:8080"
      - "50000:50000"
		mem_limit: 1024m
    volumes:
      - ./jenkins:/var/jenkins_home
    expose:
        - 9000
		networks:
      - nginx
  
  certbot:
    image: certbot/certbot
    container_name: certbot
    volumes:
      - ./nginx/certbot/conf:/etc/letsencrypt
      - ./nginx/certbot/logs:/var/log/letsencrypt
      - ./nginx/certbot/data:/var/www/certbot
      - ./nginx/ssl:/secrets
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

networks:
  nginx:
```

{% note info flat no-icon %}
💡 在docker-compose.yml設定檔中可以看到每個容器的volumes都有設置映射的目標，這邊分別介紹一下
1. ./logs:/var/log/nginx：伺服器日誌
2. ./nginx:/etc/nginx/conf.d：伺服器設定檔
3. ./nginx/certbot/conf:/etc/nginx/ssl：伺服器憑證 (這邊與cerbot串聯)
4. ./nginx/certbot/data:/var/www/certbot：憑證機器人資料 (機器人產生的加密驗證檔會存與此)
{% endnote %}

### 設置Nginx伺服器設定檔
從docker-compose.yml設定檔中可以得知，檔案需撰寫於nginx目錄下，在首次服務運行時我們會做首次憑證申請，因此這邊的設定只為了第一次的憑證訪問

```bash
server {
     listen [::]:80;
     listen 80;

     server_name your_domain.com;

     location ~ /.well-known/acme-challenge {
         allow all; 
         root /var/www/certbot;
     }
}
```

### 啟動主要容器服務
我們已經建立好需要的服務在docker-compose.yml上了，接著只要使用docker-compose的指令就可以一次建立好容器。

通常單一域名的憑證申請會須要驗證特定目錄是否能正常訪問且含有服務建立好的標誌，因此先啟動容器服務讓瀏覽器輸入域名可以正常訪問

在docker-compose.yml檔案的目錄下執行建置指令：

```bash
# 執行已寫好的docker-compose.yml
docker-compose up
```

{% note info flat no-icon %}
💡 執行過程中一開始local端尚未擁有nginx、jenkins、cerbot的images，因此一開始會先進行pull下載
{% endnote %}


### 設置docker-composeLE.yml，首次憑證申請容器服務

1. 撰寫docker-composeLE.yml

    ```yaml
    version: '3.1'

    services:
    certbot:
        image: certbot/certbot
        command: certonly --webroot --webroot-path /var/www/certbot/ -d ${HOST_DOMAIN} --email ${HOST_EMAIL} --agree-tos 
        volumes:
        - ./nginx/certbot/www/:/var/www/certbot/:rw 
        - ./nginx/certbot/conf/:/etc/letsencrypt/:rw
    ```

    {% note info flat no-icon %}
    💡 參數介紹
    webroot：通過將文件檔放在網頁跟目錄中以驗證憑證的方式，如此cerbot透過訪問domain.com/.well-known/acme-challenge來查看是否有該檔案，以驗證該域名的使用者是否屬於你
    d：要申請的域名 ( 若一次要申請多個域名，可以-d abc.domain.com -d xyz.domain.com )
    email： 聯繫或恢復用的信箱
    agree-tos：同意ACME用戶協議，在申請途中會有問答yes/no，而我們使用docker-compose的過程是自動化的，並不能作答，因此這邊可以先設置同意。
    {% endnote %}

2. 撰寫環境變數(.env)
    
    在docker-composeLE.yml的certbot command可以看到有使用到環境變數，而這部分可以設定在.env檔中，讓docker-compose自動讀取
    
    ```
    HOST_DOMAIN=<要註冊的域名>
    HOST_EMAIL=<信箱>
    ```

### 啟動首次憑證申請容器服務，完成SSL憑證申請

指定啟動docker-composeLE.yml的服務，接著會執行cerbot預先寫好的command

```bash
docker-compose -f docker-composeLE.yml up
```

基本上我們在此可看到憑證申請過程，若失敗則會輸出相關錯誤訊息於終端機上

### 將Nginx伺服器設定改為SSL，並重新載入Nginx
完成後訪問自己的域名看看有沒有成功開啟SSL憑證吧

### 更新憑證容器，完成自動化更新SSL憑證
還記得docker-compose.yml上有撰寫cerbot容器嗎，透過再次啟動下方指令，將首次申請用的容器替代即可

```bash
docker-compose up -d
```


## 服務架設 for 萬用子域憑證申請方式

{% note warning flat no-icon %}
💡 若想要萬用子域驗證的話，需要注意的是你的DNS供應商，不同的供應商需要更改不同的image，因為萬用子域驗證需要經過”DNS挑戰”，DNS挑戰是要證明你擁有該DNS的權限，這樣才敢發萬用子域的憑證給你。

Cerbot已經在各別的image建立好不同供應商的API，對我們使用者來說只要將供應商API的權限金鑰給他即可，當然怕不安全的話，建立金鑰時，可以選擇該金鑰擁有的權限。
{% endnote %}

### DNS服務管理權限金鑰申請

{% tabs DNS服務管理權限金鑰申請 %}
<!-- tab 若dns使用cloudflare -->

首先前往cloudflare網站登入後，點選個人帳戶的API Token(如圖)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-api-token-page.jpg)

接著點選建立Token，會到下圖頁面，我們需要給予DNS編輯權限並且設定區域資源給予我們要使用的網域Domin
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-api-token-edit-page.jpg)

建立完成後我們會獲得一串金鑰token，將這串金鑰token填寫到 `nginx/ssl/cloudflare.ini` ，覆蓋掉"your_token"

```bash
dns_cloudflare_api_token = your_token
```
<!-- endtab -->

<!-- tab 若dns使用cloudflare -->
前往API和服務→憑證建立服務帳戶
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gcp-dns-auth-key-step1.jpg)

輸入基本資訊
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gcp-dns-auth-key-step2.jpg)

設定將DNS權限給予服務
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gcp-dns-auth-key-step3.jpg)

建立完畢後，選取我們建立好的服務帳戶
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gcp-dns-auth-key-step4.jpg)

前往金鑰選項並新增金鑰
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gcp-dns-auth-key-step5.jpg)

選擇JSON格式，建立完畢後將自動下載金鑰
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gcp-dns-auth-key-step6.jpg)

下載完成後我們將json內容複製填寫到 `nginx/ssl/google.json` ，下方為我們需要看到的格式

```bash
{
  "type": "...",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```
<!-- endtab -->
{% endtabs %}


### 設置docker-compose.yml容器化服務的環境與配置


{% tabs 設置docker-compose.yml容器化服務的環境與配置 %}
<!-- tab 若dns使用cloudflare -->
1. 撰寫docker-composeLE.yml
    因為使用的dns服務商不同，我們的cerbot image和指令也不同，
    因此要檢查 `docker/docker-compose.yml`、`docker/docker-composeLE.yml` 

    必須與下方一致

    `docker/docker-compose.yml` (這裡只列出cerbot服務)

    ```yaml
    certbot:
        image: certbot/dns-cloudflare
        container_name: certbot
        volumes:
        - ../nginx/certbot/conf:/etc/letsencrypt
        - ../nginx/certbot/logs:/var/log/letsencrypt
        - ../nginx/certbot/data:/var/www/certbot
        - ../nginx/ssl:/secrets
        entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    ```

    `docker/docker-composeLE.yml` 

    ```yaml
    version: '3.1'

    services:
        certbot:
            image: certbot/dns-cloudflare
            command: certonly --expand -d ${HOST_DOMAIN} -d ${WILDCARD_DOMAIN} --preferred-challenges dns --dns-cloudflare --dns-cloudflare-credentials /secrets/cloudflare.ini  --email ${HOST_EMAIL} --agree-tos --server https://acme-v02.api.letsencrypt.org/directory
            volumes:
            - ../nginx/certbot/conf:/etc/letsencrypt
            - ../nginx/certbot/logs:/var/log/letsencrypt
            - ../nginx/certbot/data:/var/www/certbot
            - ../nginx/ssl:/secrets
    ```

    {% note info flat no-icon %}
    💡 參數介紹
    --preferred-challenges：指定 Certbot 客戶端應該使用哪種方法來證明您控制請求證書的域名。Certbot 客戶端支援多種不同的挑戰類型，包括 HTTP、DNS 和 TLS-SNI，如果指定 --preferred-challenges dns，Certbot 客戶端將首先嘗試通過將特定的 DNS 記錄添加到您的域名的 DNS 配置中來證明您的域名控制權。
    --dns-cloudflare：允許 Certbot 通過使用 Cloudflare API 創建和修改 DNS 記錄來驗證您對域的所有權。
    --dns-cloudflare-credentials： 指控制DNS服務金鑰的檔案位置
    {% endnote %}

2. 撰寫環境變數(.env)

    在docker-composeLE.yml的certbot command可以看到有使用到環境變數，而這部分可以設定在.env檔中，讓docker-compose自動讀取
    
    ```
    HOST_DOMAIN=<要註冊的域名>
    WILDCARD_DOMAIN=<要註冊的萬用域名>
    HOST_EMAIL=<信箱>
    ```
<!-- endtab -->

<!-- tab 若dns使用cloudflare -->
1. 撰寫docker-composeLE.yml

    因為使用的dns服務商不同，我們的cerbot image和指令也不同，
    因此要檢查 `docker/docker-compose.yml`、`docker/docker-composeLE.yml` 

    必須與下方一致

    `docker/docker-compose.yml` (這裡只列出cerbot服務)

    ```yaml
    certbot:
        image: certbot/dns-google
        container_name: certbot
        volumes:
        - ./nginx/certbot/conf:/etc/letsencrypt
        - ./nginx/certbot/logs:/var/log/letsencrypt
        - ./nginx/certbot/data:/var/www/certbot
        - ./nginx/ssl:/secrets
        entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    ```

    `docker/docker-composeLE.yml` 

    ```yaml
    version: '3.1'

    services:
        certbot:
            image: certbot/dns-google
            command: certonly --expand -d ${HOST_DOMAIN} -d ${WILDCARD_DOMAIN} --preferred-challenges dns --dns-google --dns-google-credentials /secrets/google.json --email ${HOST_EMAIL} --agree-tos --server https://acme-v02.api.letsencrypt.org/directory --dry-run
            volumes:
            - ./nginx/certbot/conf:/etc/letsencrypt
            - ./nginx/certbot/logs:/var/log/letsencrypt
            - ./nginx/certbot/data:/var/www/certbot
            - ./nginx/ssl:/secrets
    ```

    {% note info flat no-icon %}
    💡 參數介紹
    --preferred-challenges：指定 Certbot 客戶端應該使用哪種方法來證明您控制請求證書的域名。Certbot 客戶端支援多種不同的挑戰類型，包括 HTTP、DNS 和 TLS-SNI，如果指定 --preferred-challenges dns，Certbot 客戶端將首先嘗試通過將特定的 DNS 記錄添加到您的域名的 DNS 配置中來證明您的域名控制權。
    --dns-google：告訴 Certbot 客戶端使用 Google Cloud DNS API 在證書發行過程中添加和刪除用於域名驗證的 DNS 記錄
    --dns-google-credentials： 指控制DNS服務金鑰的檔案位置
    {% endnote %}

2. 撰寫環境變數(.env)

    在docker-composeLE.yml的certbot command可以看到有使用到環境變數，而這部分可以設定在.env檔中，讓docker-compose自動讀取
    
    ```
    HOST_DOMAIN=<要註冊的域名>
    WILDCARD_DOMAIN=<要註冊的萬用域名>
    HOST_EMAIL=<信箱>
    ```

<!-- endtab -->
{% endtabs %}

### 啟動主要容器服務
我們已經建立好需要的服務在docker-compose.yml上了，接著只要使用docker-compose的指令就可以一次建立好容器。

通常單一域名的憑證申請會須要驗證特定目錄是否能正常訪問且含有服務建立好的標誌，因此先啟動容器服務讓瀏覽器輸入域名可以正常訪問

在docker-compose.yml檔案的目錄下執行建置指令：

```bash
# 執行已寫好的docker-compose.yml
docker-compose up
```

{% note info flat no-icon %}
💡 執行過程中一開始local端尚未擁有nginx、jenkins、cerbot的images，因此一開始會先進行pull下載
{% endnote %}


### 啟動首次憑證申請容器服務，完成SSL憑證申請

指定啟動docker-composeLE.yml的服務，接著會執行cerbot預先寫好的command

```bash
docker-compose -f docker-composeLE.yml up
```

基本上我們在此可看到憑證申請過程，若失敗則會輸出相關錯誤訊息於終端機上

### 將Nginx伺服器設定改為SSL，並重新載入Nginx
完成後訪問自己的域名看看有沒有成功開啟SSL憑證吧

### 更新憑證容器，完成自動化更新SSL憑證
還記得docker-compose.yml上有撰寫cerbot容器嗎，透過再次啟動下方指令，將首次申請用的容器替代即可

```bash
docker-compose up -d
```

## 結語
看完可以發現並沒有什麼太複雜的概念，webpack就像一個容器讓我們組裝所需的內容, 而只要知道各個零件的用途與設置就可以添加各個需求。不過webpack依然還有須多可以研究的，例如考量網頁效能與體驗上如何最佳化編譯靜態資源將會是很重要的課題。

最後附上本次實作的程式碼
{% link webpack-dev-server-learning, https://github.com/SP12893678/webpack-dev-server-learning, https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/github.svg %}