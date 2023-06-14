title: 運用Docker建置GitLab Server與GitLab CI Runner
description: 

categories:
  - DevOps
tags:
  - Docker
  - CI/CD
  - DevOps

keywords: Docker, CI/CD, DevOps, GitLab
date: 2023-6-14 12:00:00
copyright_info: 此文章版權歸JUN-HONG所有，如有轉載，請註明來自原作者

cover: https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/banner_gitlab-server-runner-docker.jpg
---

## 前言
GitLab提供self-managed GitLab伺服器架設方式，讓企業或團隊可以在自己的基礎設施(infrastructure)中運行GitLab Server。私人的GitLab Server使得專案機密資料不會因第三方因素而暴露，導致企業研發之專利技術內容公開而失去價值。

GitLab CI Runner為提供GitLab 運行CI/CD作業的應用程式

## 實作重點

- 環境準備
    - 安裝Docker
- 建置GitLab Server
    - 撰寫Docker Compose.yml設置運行容器服務
    - 申請Gmail應用程式密碼
    - 撰寫.env環境變數
    - 運行GitLab Server容器
    - 寄送測試信件確認SMTP功能
    - 使用者註冊設置
- 建置GitLab CI Runner
    - 於GitLab專案Repo上新增CI/CD Runner
    - 撰寫Docker Compose.yml設置運行容器服務
    - 運行GitLab CI Runner容器
    - 註冊GitLab CI Runner
    - 查看該Project的Runner是否成功註冊
- 測試GitLab CI Runner
    - 於Repo中建立.gitlab-ci.yml持續整合設定檔
    - 觸發CI/CD機制
    - 查看GitLab CI/CD Pipelines狀態
    - .gitlab-ci.yml設置Docker指令


## 環境準備
範例中的作業系統採用Ubuntu 22.04版本，環境只要安裝Docker

### 安裝Docker

#### 安裝指令
```bash
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 測試是否安裝成功
docker -v
```

#### 給予使用者Docker權限

```bash
# 將$USER加入docker群組
sudo usermod -aG docker $USER

# 切換群組
newgrp docker
```

## 建置GitLab Server
### 撰寫Docker Compose.yml設置運行容器服務
gitlab server有許多的環境配置可以設定，其中本篇以SSL憑證設置與SMTP寄信設定做為分享內容

{% tabs GitLab Server Docker Compose.yml設置 %}
<!-- tab 自備SSL憑證 & Gmail SMTP設定 -->
```bash
version: '2'
services:
  web:
    image: 'gitlab/gitlab-ee:latest'
    container_name: gitlab
    restart: always
    hostname: 'your_domain'
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'https://your_domain'
        letsencrypt['enable'] = false
        gitlab_rails['smtp_enable'] = true
        gitlab_rails['smtp_address'] = "smtp.gmail.com"
        gitlab_rails['smtp_port'] = 587
        gitlab_rails['smtp_user_name'] = "${SMTP_EMAIL}"
        gitlab_rails['smtp_password'] = "${SMTP_PASSWORD}"
        gitlab_rails['smtp_domain'] = "smtp.gmail.com"
        gitlab_rails['smtp_authentication'] = "login"
        gitlab_rails['smtp_enable_starttls_auto'] = true
        gitlab_rails['smtp_tls'] = false
        gitlab_rails['smtp_openssl_verify_mode'] = 'peer'
      GITLAB_ROOT_PASSWORD: ${GITLAB_ROOT_PASSWORD}
    ports:
      - '80:80'
      - '443:443'
      - '22:22'
    volumes:
      - './config:/etc/gitlab'
      - './ssl:/etc/gitlab/ssl'
      - './logs:/var/log/gitlab'
      - './data:/var/opt/gitlab'
    privileged: true
    shm_size: '256m'
    deploy:
      resources:
        limits:
          cpus: '3'
```

<!-- endtab -->

<!-- tab 自動letsencrypt SSL憑證 & Gmail SMTP設定 -->


<!-- endtab -->
{% endtabs %}


{% note info flat %}
💡有關詳細的SMTP設定可以查看GitLab官方文件
https://docs.gitlab.com/omnibus/settings/smtp.html
{% endnote %}

### 申請Gmail應用程式密碼
若想要使用Gmail SMTP服務，讓你的軟體可以用指定的gmail發信，但又不想要在系統/軟體輸入自己的gmail密碼。如此可於google帳戶中申請應用程式密碼

- 前往Google帳戶管理頁面
    如圖點擊紅框處的按鈕
        
    ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-1.jpg)


- 到安全性頁面點擊兩步驟驗證，並進行相關設定

    {% note info flat %}
    💡透過兩步驟驗證使得之後不小心外洩密碼，google發現是異地登入時會需要手機驗證
    增加帳戶的安全性
    {% endnote %}
    ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-2.jpg)


- 下拉到下方內容點擊紅框，前往應用程式密碼頁面
    ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-3.jpg)

- 選擇所需的產生密碼的應用程式與裝置
    - 我們的需求是SMTP也就郵件應用程式
    - 裝置可以自訂名稱。如GitLab server
    - 按產生按鈕就會顯示密碼拉
    ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-4.jpg)

### 撰寫.env環境變數
從docker-compose.yml中可以看到有被${}符號標記的為使用環境變數，SMTP_PASSWORD的值就是填寫剛才申請的應用程式密碼拉

```bash
GITLAB_ROOT_PASSWORD=
SMTP_EMAIL=
SMTP_PASSWORD=
```

### 運行GitLab Server容器
GitLab Server初始運行時會需要跑好一陣子，直到gitlab頁面可以訪問了就成功了

```bash
docker compose up
```

### 寄送測試信件確認SMTP功能
雖然上述有設定完畢SMTP功能了，但還是要確定能否正常上傳

輸入以下指令進入gitlab容器內

```bash
docker exec -it gitlab bash
```

gitlab應用程式是由Ruby on Rails framework建構的，其中rails console提供互動command line可以與gitlab實體互動，因此透過輸入以下指令可以發送測試信件至指定的email

```bash
gitlab-rails console

Notify.test_email('your_email', 'title', 'content').deliver_now
```

### 使用者註冊設置

使用者註冊時GitLab就會發送註冊確認信件給予使用者，如此一來可以再次檢驗信件功能有無正常

在使用者註冊上，GitLab有提供許多的設置選項，讓團隊可以根據需求設定

- 以root身分登入並前往admin頁面
    ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-5.jpg)

- 在側邊選單點擊Settings→General
    ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-6.jpg)

- 下拉至Sign-up restrictions

    這邊是註冊的限制相關設定，如：

    1. 否允許註冊
    2. 是否需要管理者同意新註冊用戶
    3. 信件確認設定 (不強制使用者信件確認、可立即登入，但三天內需信件確認、登入前必須完成信件確認)
    4. 密碼最低長度
    5. 允許或拒絕來自哪些domain的註冊
    6. 設定註冊信箱必須符合設置的regex格式
    ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-7.jpg)


    完成設定後，就可以去嘗試使用者註冊啦



## 建置GitLab CI Runner

### 於GitLab專案Repo上新增CI/CD Runner
每個專案repo都可以設定runner，GitLab會給予註冊runner的token，讓他知道你的專案要與這個runner做連結

如下圖步驟到專案CI/CD設置頁面的Runner區域新增Runner
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-8.jpg)


根據需求選擇，其中Tags為必填選項，他會影響到後續ci設置時指定呼叫的runner
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-9.jpg)


在紅框處可以看到GitLab server要求我們到runner中執行該指令
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-10.jpg)



### 撰寫Docker Compose.yml設置運行容器服務
環境的部分可以先設定CI_SERVER_URL讓ruuner知道server的網址，後續註冊時無須再次輸入網址

volumes中第一個設定為使其可在CI/CD流程運行docker相關指令
第二個則為將設定檔映射出來方便管理
```bash
version: '2'
services:
  gitlab-runner:
    image: gitlab/gitlab-runner:latest
    container_name: "gitlab_runner"
    environment:
      - CI_SERVER_URL=https://your_domain
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./config:/etc/gitlab-runner
    privileged: true
    restart: always
```

### 運行GitLab CI Runner容器
```bash
docker compose up
```

由於尚未註冊，runner中的config.toml沒被建立會一直報錯
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-11.jpg)

### 註冊GitLab CI Runner
- 進入runner容器內

    ```bash
    docker exec -it gitlab_runner bash
    ```

- 設置信任的網站SSL憑證

    若嘗試訪問的網站具有已過期或來自不受信任的頒發機構的 SSL 證書，可能會出現下圖問題
    ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-12.jpg)

    因此註冊前先將gitlab server網站的憑證加入至信任內

    ```yaml
    mkdir /etc/gitlab-runner/certs
    openssl s_client -showcerts -connect your_domain:443 servername your_domain < /dev/null 2>/dev/null | openssl x509 -outform PEM > /etc/gitlab-runner/certs/your_domain.crt
    ```

- 執行runner註冊指令

    ```bash
    gitlab-runner register
    ```
    註冊中會要求輸入：

    1. GitLab server URL：由於docker-compose.yml有先設定了，這邊默認即可
    2. 註冊Runner的token：貼上剛才指令的token
    3. 該Runner的tags：空白即可
    4. 維護的資訊：空白即可
    5. 執行器：docker
    6. 預設docker image：alpine:latest
    ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-13.jpg)
    {% note info flat %}
    💡Docker executor 使用 Docker 引擎創建一個新的容器來執行作業。每個作業都在一個獨立的容器中運行，可以指定不同的容器鏡像和運行環境。這種執行者適用於需要隔離環境或依賴特定容器鏡像的作業。
    {% endnote %}


- 查看設定檔config.toml

    可以看到剛才的註冊資訊寫入至該設定檔中，後續更新與檢查可使用

    ```yaml
    cat config.toml
    ```
    ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-14.jpg)

- 更新config.toml配置檔設定

    config.toml配置檔中volumes部分需更新為以下，如此執行docker相關指令時才可運作

    ```yaml
    volumes = ["/var/run/docker.sock:/var/run/docker.sock", "/cache"]
    ```

### 查看該Project的Runner是否成功註冊
重整頁面，可發現下圖紅框處有可使用的runner
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-15.jpg)

## 測試GitLab CI Runner

上一節建立GitLab CI Runner後，在設置頁面雖然有可使用的Runner，但仍需要檢驗CI/CD流程是否會觸發進行任務需求

### 於Repo中建立.gitlab-ci.yml持續整合設定檔

在個人專案中，建立.gitlab-ci.yml，其中內容如下：

這是簡易的運行範例

```bash
stages:
- build
build:
  stage: build
  tags:
   - master
  script:
    - echo "Hello GitLab Runner"
```
{% note info flat %}
💡tags為指定執行的runner，在最初runner新增設定時有提到
{% endnote %}

### 觸發CI/CD機制

接著就推送版本紀錄即可觸發CI/CD機制

上述版本沒有任何限制，若期望只在master分支或指定分支版本紀錄時觸發也可以額外設置

或者是merge request事件觸發等規則設定

### 查看GitLab CI/CD Pipelines狀態

觸發後在GitLab CI/CD Pipelines可以查看目前的任務

狀態前期會有pending → running

pending代表準備將任務指派給runner

running代表runner已經在執行CI/CD任務了

{% note info flat %}
💡若一直處於pending狀態可點擊前去查看原因，可能是沒有可用的runner
{% endnote %}

![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/gitlab-server-16.jpg)

### .gitlab-ci.yml設置Docker環境

可以看到我的pipeline中有幾次的失敗，其原因為若欲在CI/CD中使用docker指令，需要設置image為docker

```bash
stages:
- build

build:
  stage: build
  image: docker
  tags:
   - master
  script:
    - echo "Hello GitLab Runner2"
    - docker -v
```

## 結語
本篇大致敘述以docker建置GitLab Server與GitLab Runner的方法，並進行了簡易的CI測試Runner運作狀態。透過容器化方式可以使得CI/CD任務需求中更容易達成所需的環境。本篇在gitlab ci設置檔屬於簡易使用，未來可詳細探討設置的細節。
