title: Gitlab + Jenkins 建置CI / CD流程
description: 

categories:
  - DevOps
tags:
  - CI/CD
  - docker
  - docker-compose
  - jenkins
  - sonarqube
  - maven
  - gradle
  - gitlab
keywords: CI/CD,jenkins,sonarqube,docker,docker-compose
date: 2022-03-14 12:00:00
copyright_info: 此文章版權歸JUN-HONG所有，如有轉載，請註明來自原作者

cover: https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/banner_jenkins_CICD.jpg
---

## 前言
在軟體工程中，頻繁的交付新的軟體版本是常見的現象。而 {% label 在軟體版本持續更新的同時，如何保證程式保持一定的品質呢？ %} 若每一次的小部分更動都交由人力來監管品質，則消耗大量人力成本，且耗費時間也將提升。因此在應用程式的提交、建置、測試和部署中實施自動化，透過每次自動化的流程達成持續整合、持續交付與持續佈署。

### 什麼是CI(Continuous Integration, 持續整合)?

持續整合(CI)是開發人員將軟體系統每個變動實行自動化驗證，其中驗證包含：專案建置(build)、測試(test)、程式碼安全分析(analysis)等等，若驗證通過代表此次提交的更動版本對過去設置的標準，可以確定新版程式碼和原有的能否正確地整合在一起。這一系列的驗證會交由自動化工具執行，DevOps人員只需要將工具的觸發、執行等設定完成即可自動化運作。常見的CI工具如下：
* Jenkins
* Drone
* Circle CI
* GitLab CI

### 什麼是CD(Continuous delivery / Continuous deployment, 持續交付/持續佈署)?

持續交付(CD)是在持續整合的基礎上，將整合的專案進一步測試，嘗試將專案佈署至與正式版本環境相似的環境上，並且保持在隨時可以產出的狀況。例如將程式佈署後在測試環境進行動態測試，檢驗實際運行是否流暢。在完成持續交付後可以選擇自動/手動進行接續的自動佈署至正式環境，以啟用新版本內容。

持續佈署(CD)是在完成持續交付後進行自動佈署至生產環境的流程，代表專案的變動將套用至生產環境中，此外也將執行監控系統隨時檢測系統有無異常。

## 實作重點

- 流程分析
- 環境準備
    - Docker & Docker Compose安裝
    - 開源持續整合CI工具「 Jenkins 」安裝
    - 開源程式碼分析系統「 SonarQube 」安裝
- Jenkins環境設置


## 流程分析
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-process.jpg)


## 環境準備
雖然可以使用一般方式安裝Jenkins與SonarQube，但想到繁瑣的安裝步驟、版本更新，就選擇使用Docker與Docker Compose安裝啦
{% note info flat %}
Docker 將軟體封裝到名為容器的標準化單位，容器是在作業系統層上虛擬化，並將容器獨立環境且直接使用系統OS資源，無須安裝/虛擬化作業系統。透過Docker可以最小化方式建立微服務且能快速啟動、停止、刪除等操作。其中Jekins與SonarQube都有各自的image提供在Docker hub上。
{% endnote %}

{% note success flat %}
Docker Compose是為了協助定義和運行多容器應用程式而開發的工具，利用 YAML 檔案來配置需要的服務以及服務的環境設定。在Docker Compose中定義好Jenkins與SonarQube和SonarQube的資料庫服務後，最後只需要執行一行指令即可建置 (超方便！)
{% endnote %}

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

安裝完成後，需要給予使用者Docker權限

```bash
# 將$USER加入docker群組
sudo usermod -aG docker $USER

# 切換群組
newgrp docker
```

### 安裝Docker Compose

Docker Compose安裝指令如下：
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

# 測試是否安裝成功
docker-compose --version
```

### 使用Docker Compose安裝Jenkins & SonarQube
我們在想要存放的docker-compose.yml、jenkins、sonarqube等資料的目錄新增docker-compose.yml，其中docker-compose.yml的內容如下：
```bash
# docker-compose的版本
version: '2'

services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: 'jenkins'
    ports:
      - "8080:8080"
      - "50000:50000"
		mem_limit: 1024m
    volumes:
      - ./jenkins:/var/jenkins_home
		networks:
      - devops
      
  sonarqube:
    image: sonarqube:lts
    container_name: 'sonarqube'
    depends_on:
      - db
    environment:
      SONAR_JDBC_URL: jdbc:postgresql://db:5432/sonar
      SONAR_JDBC_USERNAME: sonar
      SONAR_JDBC_PASSWORD: sonar
    volumes:
      - ./sonarqube/sonarqube_data:/opt/sonarqube/data
      - ./sonarqube/sonarqube_extensions:/opt/sonarqube/extensions
      - ./sonarqube/sonarqube_logs:/opt/sonarqube/logs
    ports:
      - "9000:9000"
		networks:
		      - devops
  db:
    image: postgres:12
    container_name: 'postgres'
    environment:
      POSTGRES_USER: sonar
      POSTGRES_PASSWORD: sonar
    volumes:
      - ./db/postgresql:/var/lib/postgresql
      - ./db/postgresql_data:/var/lib/postgresql/data
		networks:
      - devops

networks:
  devops:
```

{% note info flat %}
在docker-compose.yml中設置了jenkins、sonarqube、database(sonarqube用的)服務，設定中每個服務包含了映像檔(image)、開放的port、需要映射到主機的資料(volumes)等，之後只要在docker-compose.yml就可以知道當初的設定，後續的更改或是擴充都很方便
{% endnote %}


### 建置服務 & 注意事項
在docker-compose.yml的目錄下執行建置指令：
```bash
# 執行已寫好的docker-compose.yml
docker-compose up
```

{% note warning flat %}
在建置過程可能會發現容器中途失敗退出的問題，原因有很多種，大部分在建置過程的紀錄都會顯示原因
{% endnote %}


#### sonarqube虛擬記憶體設定
由於SonarQube 使用 an embedded Elasticsearch (全文檢索引擎)，所以虛擬機的配置要符合 Elasticsearch production mode要求和File Descriptors配置，因此虛擬記憶體需要達到他的需求
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-sonarqube-memory-problem.jpg)


```bash
# 永久更改的話，需在/etc/sysctl.conf設定

sudo sysctl -w vm.max_map_count=262144
sudo sysctl -w fs.file-max=65536
```

#### Jenkins權限處理

![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-problem.jpg)
```bash
# uid 1000 為 jenkins用戶 (jenkins image's Dockerfile 設定的)
# 由於我們在volumes的路徑是./jenkins，所以是對該目錄進行權限設定，/var/jenkins_home是預設目錄
sudo mkdir ./jenkins
sudo chown -R 1000:1000 ./jenkins
```

服務建置成功後我們可以透過docker ps指令查看目前容器運行狀態
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-docker-ps.jpg)
圖中可看到Jenkins開放的port是8080，sonarqube則是9000
因此在瀏覽器中打開對應的port可以看到服務的頁面

- jenkins：localhost:8080
- sonarqube: localhost:9000

{% note info flat %}
**Sonarqube預設帳號密碼**
default account: admin
default password: admin
{% endnote %}

### Jenkins環境設置

#### 初始化
進入jenkins頁面中會發現jenkins要求我們輸入初始的管理員密碼以解鎖jenkins，密碼我們可以在映射到local端的jenkins目錄可以找到(./jenkins/secrets/initialAdminPassword)

將檔案裡的密碼貼上後就進入到下個頁面啦
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-unlock.jpg)
Jenkins提供2種方式客製化自己的Jenkins，分別是”安裝建議的插件”和”自己選擇插件安裝"，兩者看個人喜好選擇，之後都可以再安裝或刪除個別插件
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-install-suggest.jpg)
這邊我選擇安裝建議的插件，在下圖可以看到它幫我們先安裝Git、Github、Gradle、Pipleline、Mailer等插件
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-install-suggest-ing.jpg)
**設定第一個管理員使用者**
安裝插件完成後會要求我們設定管理員的帳戶資訊，也就是之後登入jenkins的帳戶
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-setting-admin.jpg)

**設定Jenkins server的網址**
jenkins以及插件可能會需要用到，提供給使用者正確的網址路徑
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-setting-url.jpg)

設定完畢後，就進入到Jenkins主頁面啦
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-setting-first.jpg)

#### 安裝插件
在jenkins左側選單中有Mange Jenkins的選項，其中包含Jenkins的相關設定以及各插件設定
這裡將預先安裝以下插件，在接續的實作過程中會使用到
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-manage-jenkins.jpg)
1. 在進入管理插件頁面後，需要注意的是要點選Available選項才能找到尚未安裝的插件
2. 在使用右上的搜尋欄找到所需的插件吧


{% tabs Jenkins 各插件安裝 %}
<!-- tab GitLab -->
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-plugin-install-gitlab.jpg)
<!-- endtab -->

<!-- tab SonarQube -->
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-plugin-install-sonarqub.jpg)
<!-- endtab -->

<!-- tab Jacoco -->
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-plugin-install-jacoco.jpg)
<!-- endtab -->

<!-- tab OWASP Dependency Check -->
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-plugin-install-dependency-check.jpg)
<!-- endtab -->

<!-- tab Slack -->
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-plugin-install-slack.jpg)
<!-- endtab -->
{% endtabs %}


#### 插件設定
有些插件在Jenkins系統設定頁面會提供插件的全域設定，例如sonarqube的伺服器位置、權限、版本或是slack的工作區、權限，這些共用性的設定無需在專案流程中每次特別設置

{% tabs Jenkins 各插件設定 %}
<!-- tab SonarQube -->
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-plugin-install-slack.jpg)
<!-- endtab -->

<!-- tab OWASP Dependency Check -->

<!-- endtab -->

<!-- tab Slack -->

<!-- endtab -->
{% endtabs %}


### 建立專案建置流程
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-homepage-click-new-item.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-add-new-item.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-setting-1.jpg)
#### 設置程式碼管理(SCM)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-setting-scm.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-setting-scm-credentials.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-setting-scm-full.jpg)
#### 設定建置觸發程序
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-setting-build-gradle.jpg)
#### 設定建置流程
在建置流程中我希望依序執行 build → Jacoco(unit test、coverage rate) → Deoendency check → sonarqube
這裡我使用java gradle專案，選擇呼叫gradle script(在先前初始化時選擇的建議安裝內有包含gradle插件)


設置Gradle
{% note info flat %}
在gradle build生命週期中test也包含在內(test將執行jacoco的單元測試與覆蓋率)
{% endnote %}

![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-setting-build-sonarqube-scanner.jpg)

{% note info flat %}
使用maven也有相應的插件，其他語言的專案也可以直接選擇使用Execute shell方式輸入指令方式
{% endnote %}

設置SonarQube Scanner
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-setting-build-sonarqube-scanner-properties.jpg)

設置Dependency-Check
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-setting-build-dependency-check.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-setting-build-dependency-check-setting.jpg)

#### 設置建置後動作
在完成建置後，我們可以在建置後動作產生一些報告或者通知
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-setting-after-build-jacoco.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-setting-after-build-jacoco-setting.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-setting-after-build-dependency-check.jpg)

![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-setting-after-build-dependency-check-setting.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-setting-after-build-slack.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-setting-after-build-slack-setting.jpg)


### 執行建置專案
完成專案建置設定後，我們目前有2種方式可以觸發專案建置

1. 手動執行
2. 透過專案設置的觸發器條件執行，先前設置是當gitlab有push event時

為了確保建置設定沒有出錯，可以先使用手動方式執行

執行後在左下可以看到此次建置的資訊(目前進度以及編號(第幾次執行)等)，若建置完畢後出現紅燈代表失敗；橘燈代表不穩定；綠燈代表成功。
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-run-status.jpg)

在完成建置後可以點擊建置編號查看此次建置的詳細內容

另外在建置的開始與結束我們應該會在Slack收到Jenkins bot的消息，其中Jenkins會通知此次建置的狀態、時間，另外也附上此次專案建置的連結 (或許會有多個專案執行)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-run-notify-slack.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-run-record.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-run-record-jacoco.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-run-record-dependency-check.jpg)

sonarqube則需在專案流程主頁點擊，且詳細內容需至sonarqube伺服器網頁上查看
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-run-record-sonarqube.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-free-style-project-run-record-sonarqube-server.jpg)


如果手動建置有成功的話，可以試試看透過Gitalb webhook觸發

GitLab webhook設定

![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-gitlab-jenkins-webhook.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-gitlab-jenkins-webhook-setting.jpg)

若使用Gitlab webhook發送的方式觸發的話，可以在該次建置的觸發者，Slack上也可以看到
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-gitlab-jenkins-run-status.jpg)

### Pipeline形式專案建置流程
剛才我們使用Free-Style的形式建置專案流程，其中可以透過在Jenkins上UI點選輸入形式自定義內容。那Pipeline形式有何不同呢? Pipeline有2個不錯的特點

1. 程式碼形式簡潔易讀的設定內容
2. 配置檔整合至git專案上，供開發人員在開發專案時即可了解建置流程
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-pipeline-add.jpg)


新增後進入設定頁面，會發現Jenkins有提供部分UI設定，主要是給將Pipeline寫在Jenkins上的人使用的，若選擇pipeline配置檔在Git專案上則需要切換選項
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-pipeline-setting-1.jpg)


這邊只需要設置Git專案的資訊即可
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-pipeline-setting-scm.jpg)

#### 撰寫Jenkins pipeline配置檔
首先Jenkins pipeline配置檔預設是專案根目錄的Jenkinsfile檔案，如果想更換位置可以在Jenkins的UI上設定
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-pipeline-jenkinsfile-setting.jpg)

撰寫方法如下：

agent是指定執行時的節點...其實Jenkins擁有分散式建構和佈署功能，將任務派發給其他節點工作

stages是設置階段執行內容與環境，我們可以為stage有個暱稱，執行時在Jenkins上可以更直觀看出現在的進度

post是建置後需要執行的步驟，這邊我們可以做報告產出、通知等，另外post提供各種狀態可以附加的動作**always、changed、fixed、regression、aborted、failure、success、unstable、unsuccessful 和 cleanup**


```bash
pipeline {
    agent any
    stages {
        stage('Checkout SCM') {
            steps {
                echo 'Checkout SCM'
                git url: 'https://gitlab-se.ntcu.edu.tw/ntcu-acs106103/shape-by-gradle.git', branch: 'master', credentialsId: 'gitlab-user'   
            }
        }
        stage('Build') {
            steps {
                echo 'Building'
                sh 'chmod +x ./gradlew'
                sh './gradlew clean build'	
            }
        }
        stage('Analyze') {
            environment {
                scannerHome = tool 'SonarQube 4.6.2' // SonarQube Scanner 該版本Name
            }
            steps {
                echo 'Analyzing'
                withSonarQubeEnv('sonarqube') { // SonarQube servers Name
                    sh "${scannerHome}/bin/sonar-scanner " +
                    "-Dsonar.projectKey=spring-first-project " +
                    "-Dsonar.projectName=spring-first-project " +
                    "-Dsonar.sources=./src " +
                    "-Dsonar.java.binaries=./build/classes/java "
                }
            }
        }
    }
    post {
        always {
            junit 'build/test-results/**/*.xml'
            jacoco()
        }
    }
}
```

{% note info flat %}
Checkout SCM是可以省略的，因為在Jenkins上我們已經設置了Git專案
若將pipeline設置在Jenkins上則需要撰寫
{% endnote %}
設定完成後push至gitlab上，我們一樣先進行手動建置
若要Gitlab webwook觸發則須在Jenkins UI設定trigger，畢竟Jenkinsfile在Git上

### Jenkins分散式建構與佈署

Jenkins提供新增節點功能，使Jenkins可以將任務派發給其他節點，加快作業執行以及減少Jenkins主機工作負載量(workload)，以確保 Jenkins 可以保持在最佳的運作狀態下。

另外我們也可以在指定節點執行專案內容達到佈署效果

#### 節點環境準備

我們需要為另一台server準備jenkins的使用者、工作區以及Java8環境

新增使用者
```bash
# 新增使用者
sudo adduser jenkins

# 切換使用者
su jenkins
```
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-node-user-add.jpg)

```bash
cd ~/.ssh
ssh-keygen -f "jenkinsAgent_rsa"
cat jenkinsAgent_rsa.pub >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys ~/.ssh/jenkinsAgent_rsa

cat ~/.ssh/jenkinsAgent_rsa

# 安裝Java 8
sudo apt-get install openjdk-8-jdk
```

#### 新增節點
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-node-add.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-node-new.jpg)

![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-node-new-1.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-node-new-2.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-node-new-3.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-node-new-4.jpg)
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/devops-cicd/devops-cicd-jenkins-node-new-5.jpg)

#### 在pipeline上指定節點執行


```bash
pipeline {
    agent any
    stages {
        stage('Checkout SCM') {
            steps {
                echo 'Checkout SCM'
                git url: 'https://gitlab-se.ntcu.edu.tw/ntcu-acs106103/shape-by-gradle.git', branch: 'master', credentialsId: 'gitlab-user'   
            }
        }
        stage('Build') {
            steps {
                echo 'Building'
                sh 'chmod +x ./gradlew'
                sh './gradlew clean build'	
            }
        }
        stage('Analyze') {
            environment {
                scannerHome = tool 'SonarQube 4.6.2' // SonarQube Scanner 該版本Name
            }
            steps {
                echo 'Analyzing'
                withSonarQubeEnv('sonarqube') { // SonarQube servers Name
                    sh "${scannerHome}/bin/sonar-scanner " +
                    "-Dsonar.projectKey=spring-first-project " +
                    "-Dsonar.projectName=spring-first-project " +
                    "-Dsonar.sources=./src " +
                    "-Dsonar.java.binaries=./build/classes/java "
                }
            }
        }
				stage('PassDeployFile') {
            steps {
                stash includes: 'docker-compose.yml', name: 'docker-compose.yml'
                stash includes: 'Dockerfile', name: 'Dockerfile'
            }
        }
        stage('Deploy') {
            agent { label 'deploy-server' }
            steps {
                unstash 'docker-compose.yml'
                unstash 'Dockerfile'
                sh 'sudo docker-compose up -d'
            }
        }
    }
    post {
        always {
            junit 'build/test-results/**/*.xml'
            jacoco()
        }
    }
}
```

### 補充：Jenkins插件Open Blue Ocean

![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/webpack-image-loader-prod-output.jpg)

## 結語




最後附上本次實作的程式碼
{% link webpack-dev-server-learning, https://github.com/SP12893678/webpack-dev-server-learning, https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/github.svg %}