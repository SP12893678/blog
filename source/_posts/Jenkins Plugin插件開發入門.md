title: Jenkins Plugin插件開發入門
description: 

categories:
  - DevOps
tags:
  - CI/CD
  - jenkins
  - jenkins plugin

keywords: CI/CD,jenkins,jenkins plugin
date: 2022-12-18 12:00:00
copyright_info: 此文章版權歸JUN-HONG所有，如有轉載，請註明來自原作者

cover: https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/banner_jenkins-plugin.png
---

## 前言
DevOps是一種軟體開發方法論，旨在加速軟體生命週期，從設計到交付，並透過持續集成、持續交付、持續監控來提高軟體質量。透過持續集成和持續交付實現快速、可靠地將軟體部署到生產環境。

而Jenkins 是一種用於自動化構建和測試的軟件工具。它通常用於持續集成和持續交付流程中，可以自動執行程序構建、測試和部署任務。使用 Jenkins 可以減少人為干預，提高應用程序的品質和可用性。它還可以通過監控項目的構建狀態，提供即時反饋和報告。

Jenkins提供Jenkins Plugin的方式使開發者可以開發需要的程式以擴充至建置流程中，滿足團隊專案在持續整合期間的需求。

{% note info flat %}
由於當初在找Jenkins Plugin教學時，發現官方資料非常稀少，後來得知官方教學的網域有改，之前的文章都無法Acess了
像遇到此種情況，當時很機靈的拿去網站時光機試試看，沒想到還真有資料。不過網站時光機訪問時有些緩慢就是了，這是一個小缺點
{% endnote %}


## 實作重點

- 環境準備
    - 安裝Java JDK 8
    - 安裝Maven
    - 設定環境變數
- 使用插件範本建立專案、測試運行與發佈打包
    - 使用樣本插件原型建立專案結構
    - 確認可以建構專案
    - 運行插件
    - 在Jenkins上測試範本插件
    - 發佈打包插件
- Plugin結構與Java與Jelly的關聯說明
    - 空白插件專案結構
    - Jenkins 通過固定的命名方式，來確定對應的檔案
    - 撰寫java與jelly溝通變數(物件帶有Descriptors)
- Jenkins BuildStep功能
    - 表單驗證機制
    - 撰寫執行內容 & 取得Workspace(讀檔、寫檔)
- 了解Jelly Tags
    - Jelly namespace
    - 一般文字(國際化與在地化)
    - 幫助說明(國際化與在地化)
    - 預設數值(Default value)
    - Jelly 中使用變數資料
    - 全域環境變數設置
- 建置報告獨立頁面
    - 建立HelloWorldAction.java以實作RunAction2
    - 獨立頁面UI設置
    - 在Builder執行Action以觸發頁面生成


## 環境準備

### 安裝Java JDK 8
Jenkins是基於Java建構的，因此我們需要先安裝Java 開發套件(JDK)

{% note info flat %}
若有額外需求可查看Jenkins對各個Java版本支援：
https://www.jenkins.io/doc/administration/requirements/java/
{% endnote %}


### 安裝Maven
Jenkins插件主要使用Maven建置
版本注意，請確保提供最近版本的 Maven 3，最好是 3.3.9 或較新版本


### 設定環境變數
1. PATH：
    1. C:\Program Files\Java\jdk1.8.0_202\bin
    2. C:\apache-maven-3.8.3\bin
2. JAVA_HOME：C:\Program Files\Java\jdk1.8.0_202


## 使用插件範本建立專案、測試運行與發佈打包
### 使用樣本插件原型建立專案結構
在我們的workspace打開terminal執行以下指令
```bash
mvn -U archetype:generate -Dfilter="io.jenkins.archetypes:"
```
透過上述指令會列出符合條件的幾個遠端repo讓我們選擇，接著可以選擇插件版本、artifactId等專案屬性

{% note info flat %}
💡 參數介紹
**`-U,--update-snapshots` 強制檢查與遠端存儲庫的缺失版本和更新快照
`archetype:generate` 從原型生成一個新的專案，如果使用部分原型，則更新當前專案。
`-D,--define` 定義系統屬性
`-filter` 設定過濾**
{% endnote %}


![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/jenkins-plugin-1.png)

### 確認可以建構專案

```bash
mv demo demo-plugin 
cd demo-plugin
mvn verify
```

{% note info flat %}
💡 `verify` 驗證檔案package是否正確
在過程中會依照maven的生命週期依序執行，其中會下載許多的dependencies、分析測試，最後驗證，預期結果最後如下圖
{% endnote %}

### 運行插件

**maven-hpi-plugin**幫我們處理建構和打包jenkins plugin，他還提供了便利的方式執行Jenkins instance(含有我們的插件)

```bash
mvn hpi:run
```
當看到💡 `INFO: Jenkins is fully up and running`時表示Jenkins instance成功啟動後，我們就可以打開瀏覽器訪問[http://localhost:8080/jenkins/](http://localhost:8080/jenkins/) 立即測試插件

{% note info flat %}
💡 我們運行的Jenkins instance，jenkins_home則為專案目錄中的work資料夾，因此資料都保留於這
```json
mvn hpi:run -Djetty.port=8090 # 更改port
mvn hpi:run -Dhpi.prefix=/jenkins # Context path (環境路徑)
```
{% endnote %}

#### 關於測試時更改程式碼

根據你的更改，你可以在運行實例中(running instance)看到，而不用重啟整個Maven Process

- **Views**：每當瀏覽器請求頁面時，都會重新編譯(re-compiled) Groovy/Jelly，因此只要重整瀏覽器中的頁面即可
- **Java code**：
    - 當你在debug時，只要不接觸**method signature**，JVM的熱插拔(HotSwap)功能將會幫我們重新載入程式碼
    - 此外，我們可以在Maven Process中按"ENTER"鍵，將會重新載入Jenkins webapp。但通常最好是停止該Process並重新啟動
- **POM**：如果更改 POM，則必須停止並重新啟動 Maven 才能看到更改


### 在Jenkins上測試範本插件

在範例中我們使用hello-world-plugin的範本，因此在專案設置的"建置"流程中可以新增"Say Hello world"選項，並且設置面板，如下圖
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/jenkins-plugin-2.png)

建置後畫面
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/jenkins-plugin-3.png)

### 發佈打包插件

如果想要打包我們的插件，只要執行以下指令，該指令將會在target目錄下產生`*.hpi`檔案。

※其他用戶可以在Jenkins Web UI將此插件檔案上傳使用，或者將檔案放置在`$JENKINS_HOME/plugins`也可

```bash
mvn package
```

## Plugin結構與Java與Jelly的關聯說明

### **空白插件專案結構**

- `src/main/java` ：外掛的 Java 原始檔
- `src/main/resources` ：外掛的 Jelly 檔案(用於UI、Form)、config設定(國際化/在地化)
- `src/main/webapp` ：外掛的靜態資源，如圖片或 HTLM 等

```bash
 ├── .github # 與貢獻至jenkins plugin中相關流程 
 ├── .mvn # 定義專案資訊
 │   ├── extensions.xml
 │   └── maven.config
 ├── src
 │   ├── main
 │   │   ├── java 
 │   │   │   └── io 
 │   │   │       └── jenkins
 │   │   │           └── plugins
 │   │   └── resources 
 │   │       └── index.jelly
 │   └── test 
 │       └── java 
 │           └── io 
 │               └── jenkins
 │                   └── plugins
 ├── Jenkinsfile
 ├── LICENSE.md
 ├── pom.xml
 └── README.md

```

### **Jenkins 通過固定的命名方式，來確定對應的檔案**

Jenkins Plugin中的UI內容都由Jelly來處理，因此我們必須讓Plugin中的java檔與相對應jelly檔互動，在這裡Jenkins透過**固定的命名方式處理，來確定對應的檔案**

在範例中有一個範例元件，也就是我們在前面建置選擇的Say hello world，該元件是由此`java\io\jenkins\plugins\sample\HelloWorldBuilder.java`  擴充的

`HelloWorldBuilder.java`會撰寫使用的建置擴充點以及運行的相關程式邏輯

而若要撰寫UI方面的內容則需：

1. 那我們必須在`resources`目錄下建立相應的路徑的資料夾 `resources\io\jenkins\plugins\sample\HelloWorldBuilder`
2. 在該目錄下建立`config.jelly`
    1. `resources\io\jenkins\plugins\sample\HelloWorldBuilder\config.jelly`


{% note info flat %}
💡 通常UI內容可以用來讓使用者輸入一些設定，例如路徑
{% endnote %}

### 撰寫java與jelly溝通變數(物件帶有Descriptors)

在上述我們了解檔案java與jelly對應檔案的規則，那其中的變數欄位如何配對呢?
在這裡我們將說明物件帶有Descriptors情況下，需要實作的內容

{% note info flat %}
💡 Descriptors是我們在Build steps中會需要使用到的
Descriptors在多個實例的某個擴展會被需要
{% endnote %}

1. Java
    1. 定義不可變類別(immutable class)
    2. 將 `@DataBoundConstructor` 放在constructor上，它將告訴 Jenkins 如何實例化它
    3. 為需要設定的欄位定義getters，或是將欄位設置為`public final` ，這樣將允許Jenkins讀取數值以填置設定頁面(連到jelly)
    
    ```java
    public class HelloWorldBuilder extends Builder implements SimpleBuildStep {
    
        private final String name;
        private boolean useFrench;
    
        @DataBoundConstructor
        public HelloWorldBuilder(String name) {
            this.name = name;
        }
    
        public String getName() {
            return name;
        }
    }
    ```
    
2. Jelly
    1. 撰寫Jelly片段程式碼(通常命名為 config.jelly)
    2. @field為屬性的名稱(對應constructor parameter name)...這樣jenkins才知道要將資料map到該欄位
    
    ```html
    <?jelly escape-by-default='true'?>
    <j:jelly 
        xmlns:j="jelly:core" 
        xmlns:st="jelly:stapler" 
        xmlns:d="jelly:define" 
        xmlns:l="/lib/layout" 
        xmlns:t="/lib/hudson" 
        xmlns:f="/lib/form"
    >
        <f:entry title="${%Name}" field="name">
            <f:textbox />
        </f:entry>
    </j:jelly>
    ```

## Jenkins BuildStep功能

### **表單驗證機制**

若想要為我們的UI表單增加驗證功能也是可以的

在`HelloWorldBuilder.java`的descriptor中我們可以依照規則增加method，讓jenkins知道該欄位需要經過該method驗證

**規則：**method名稱須為 **doCheck"FieldName"** ⇒ `doCheckName` 且回傳型態為FormValidation，

```java
@Symbol("greet")
@Extension
    public static final class DescriptorImpl extends BuildStepDescriptor<Builder> {

        public FormValidation doCheckName(@QueryParameter String value, @QueryParameter boolean useFrench)
                throws IOException, ServletException {
            if (value.length() == 0)
                return FormValidation.error(Messages.HelloWorldBuilder_DescriptorImpl_errors_missingName());
            if (value.length() < 4)
                return FormValidation.warning(Messages.HelloWorldBuilder_DescriptorImpl_warnings_tooShort());
            if (!useFrench && value.matches(".*[éáàç].*")) {
                return FormValidation.warning(Messages.HelloWorldBuilder_DescriptorImpl_warnings_reallyFrench());
            }
            return FormValidation.ok();
        }
}
```


#### FormValidation提供我們簡單易懂的功能：

```java
FormValidation.error(String message)

FormValidation.warning(String message)

FormValidation.ok()
```

{% note info flat %}
💡 我們還可以用@QueryParameter定義其他欄位的參數，如果我們這段method還需要其他參數，這將會非常有用
**使用方式：**增加參數時，參數名稱為field名稱
{% endnote %}


{% note warning flat %}
💡 Jenkins使用Localizer生成Messages Class，能夠以類型安全的方式訪問Message資源。
所以src/main/resources/**/Messages.properties匹配的所以文件都會生成一個對應的Messages類別
因此程式碼中調用FormValidation.error()方法的參數內容就是如此取得
透過該方法可以獲取當地語系化的消息
{% endnote %}


### 撰寫執行內容 & 取得Workspace(讀檔、寫檔)

在Class 中我們 implements `jenkins.tasks.SimpleBuildStep` 這個Interface Class, 
其中我們必須實作 `perform` 函式，該函式會為我們 "Run this step." 在該步驟執行我們的plugin想做的事

{% note info flat %}
💡 `perform` 函式中有提供許多參數，`FilePath workspace` 可以讓我們取得Workspace的路徑，有了路徑後我們就能讀檔、寫檔啦
`listener.getLogger().println()` 可以將內容在jenkins console面板印出
**以下程式碼實作讀檔、走訪目錄所有檔案、寫檔**
{% endnote %}

```java
@Override
    public void perform(Run<?, ?> run, FilePath workspace, EnvVars env, Launcher launcher, TaskListener listener) throws InterruptedException, IOException {

        listener.getLogger().println("workspace path:" + workspace.getRemote());
        
        String filePath = workspace.getRemote() + "\\Triangle.java";
        
        // read file and for loop print line
        try (Stream<String> stream = Files.lines(Paths.get(filePath))) {
        	stream.forEach(line -> listener.getLogger().println(line));
	    }
        
        // walk for the directory all file 
        try (Stream<Path> paths = Files.walk(Paths.get(workspace.getRemote()))) {
        	paths
            .filter(Files::isRegularFile)
            .forEach(item -> listener.getLogger().println(item));
        } 
        
        // write file
        Path path = Paths.get(workspace.getRemote() + "\\plugin-generate.txt");
        boolean doesFileExist = Files.exists(path, new LinkOption[]{ LinkOption.NOFOLLOW_LINKS });
        if(!doesFileExist) {
        	listener.getLogger().println("before write file.");
            List<String> lines = Arrays.asList("hello", "jenkins");
            Files.write(Paths.get(workspace.getRemote() + "\\plugin-generate.txt"), lines, StandardCharsets.UTF_8);
        }
        
    }
```

## 了解Jelly Tags

 jelly程式檔由許多不同的 jelly 標籤組成。Jenkins 主要是用 Jelly 來進行 UI 管理。而 Jelly UI 技術的主要原理是通過伺服器端的渲染引擎將 Jelly 定義好的 XML 檔案渲染成用戶端需要的 HTML，Javascript 和 Ajax 等。

### Jelly namespace

```html
<?jelly escape-by-default='true'?>
<j:jelly 
    xmlns:j="jelly:core" 
    xmlns:st="jelly:stapler" 
    xmlns:d="jelly:define" 
    xmlns:l="/lib/layout" 
    xmlns:t="/lib/hudson" 
    xmlns:f="/lib/form"
>
    <f:entry title="${%Name}" field="name">
        <f:textbox />
    </f:entry>
    <f:advanced>
        <f:entry title="${%French}" field="useFrench"
                 description="${%FrenchDescr}">
            <f:checkbox />
        </f:entry>
    </f:advanced>
</j:jelly>
```

{% note info flat %}
💡 上述標籤告訴我們可以找到指定 namespace 中的 **jelly 文件來源**和**其他標籤的引入**
xmlns:*namespace_name*="*where to find resources in that namespace*"
{% endnote %}

{% note info flat %}
💡 從上方範例可以看出 `f:entry f:textbox f:advanced f:checkbox` 都是由 `xmlns:f="/lib/form"` 宣告來的
詳細可查看Jenkins中Jelly Tags的原始碼專案
{% link Jenkins中Jelly Tags的原始碼專案, https://github.com/jenkinsci/jenkins/tree/master/core/src/main/resources/lib %}
有關完整taglib來源介紹
可以看此連結
{% link Jenkins - Jelly Taglib references, https://reports.jenkins.io/core-taglib/jelly-taglib-ref.html %}
{% endnote %}

### 一般文字(國際化與在地化)

在jenkins與jelly基本使用的文章中我們知道 欄位與變數 的關係。除欄位外，我們也會擁有一般文字(標題、敘述)需要撰寫在UI上

對此jenkins在jelly支援國際化與在地化，設定上方便簡單

```
下方jelly程式碼我們可以發現title處有個`${%Name}` ，**${%...}這個標記是指定stapler要尋找在地化資源(localized resources)**，找不到就print 該文字
```

```html
<f:entry title="${%Name}" field="name">
	<f:textbox />
</f:entry>
```

**關於在地化資源要在哪裡設定?**

在與`config.jelly`同一個目錄下新增`config.properties` ，設定方式非常簡易(`key=value`)

`config.properties`為基本預設，若要新增其他語系可以新增`config_zone.properties` (ex. `config_zh_CN.properties`)

```html
Name=Name123
French=French
FrenchDescr=Check if we should say hello in French
```
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/jenkins-plugin-4.png)

### 幫助說明(國際化與在地化)

在設定上我們會需要撰寫一些幫助說明，輔助使用者瞭解該欄位需填入的內容 (如下圖?按鈕)
因此這邊會說明如何**增加幫助說明**與**國際化與在地化方式**

> **這裡提供2種形式**
> 
1. 指定檔案 
    
    如下方程式碼，在tag內輸入help屬性並指定html檔案
    
    **國際化與在地化**：在檔名後面按規則增加語系 (如`help_de.html`)
    
    ```html
    <f:entry title="${%title}" help="/plugin/myPlugin/help.html">
    ```
    
2. 以欄位field規則建立
    
    一樣在config.jelly目錄下，我們依照所需的欄位field(這裡以field為name為例)，建立`help-name.html`
    
    **國際化與在地化**：在help-field後按規則增加語系 (如`help-name_zh_CN.html`)
    

關於html內容，我們撰寫html語法的內容即可

```html
<div>
    Your name.
</div>
```

### 預設數值(**Default value)**

如果我們希望輸入框中有預設的數值，只要增加`default`屬性即可

```html
<j:jelly xmlns:j="jelly:core" xmlns:f="/lib/form">
  <f:entry title="${%Port}" field="port">
    <f:textbox default="80" />
  </f:entry>
</j:jelly>
```

### Jelly 中使用變數資料

在上述中我們知道了Jelly 文件與Java Class有直接關聯，這意味著我們可以調用這些class的方法或是變數資料

如何使用? 

- 在Jelly中我們使用"**it**"關鍵字可以調用方法method
- 若要定義變數var則使用${insert code here}
1. 在 `java\io\jenkins\plugins\sample\HelloWorldBuilder.java`  中我們定義了一個method
    
    ```java
    public String getMyString() {
        return "Hello Jenkins!";
    }
    ```
    
2. 在`resources\io\jenkins\plugins\sample\HelloWorldBuilder\config.jelly` 中將 getMyString 調用
    
    ```html
    <j:jelly 
    	xmlns:j="jelly:core" 
    	xmlns:st="jelly:stapler" 
    	xmlns:d="jelly:define" 
    	xmlns:l="/lib/layout" 
    	xmlns:t="/lib/hudson" 
    	xmlns:f="/lib/form"
    >
        ${it.myString}
    </j:jelly>
    ```
    
3. 接著若我們執行可以看到'Hello Jenkins!' 成功出現在UI上啦

{% note info flat %}
💡 注意：'get' 被自動從方法名稱中去除，剩下的method name第一個字母是小寫的。
建議method name都使用駱駝峰式(CamelCase)命名，以便 Jelly 始終可以找到這些方法。

變數只要${it.變數名稱}也可是調用
{% endnote %}

{% note info flat %}
💡 **其他的預定義物件(predefined objects)**

除了it物件，Jenkins 還有定義了以下物件：

- app：the instance of Jenkins (or Hudson)
- instance：Jelly UI 所對應的正在被設定的物件
- descriptor：與 instance 所對應的 Descriptor
- h：an instance of hudson.Functions, with various useful functions
{% endnote %}

### 全域環境變數設置

先前的例子都是以建置元件的設置介紹，若需要全域的環境變數設置也有提供方法

全域的jelly程式檔名會是global.jelly，而路經在元件目錄底下，也就等同是該元件的全域變數

`resources\io\jenkins\plugins\sample\HelloWorldBuilder\global.jelly`

```xml
<?jelly escape-by-default='true'?>
<j:jelly 
  xmlns:j="jelly:core" 
  xmlns:st="jelly:stapler" 
  xmlns:d="jelly:define" 
  xmlns:l="/lib/layout" 
  xmlns:t="/lib/hudson" 
  xmlns:f="/lib/form"
>
  <f:section title="Hello World">
    <f:entry title="Age" field="age"
        description="i am description">
        <f:textbox />
      </f:entry>
  </f:section>
</j:jelly>
```

![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/jenkins-plugin-5.png)

![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/jenkins-plugin-6.png)


## 建置報告獨立頁面

在上述介紹已經了解建置過程可以加入添加元件執行程式，若想要將執行後的報告告訴使用者，除了使用`listener.getLogger().println()`方法輸出至Console Output頁面，也可以透過實作RunAction2來建構獨立頁面。

### 建立HelloWorldAction.java以實作RunAction2

`java\io\jenkins\plugins\sample\`HelloWorldAction.java

```java
package io.jenkins.plugins.sample;

import java.util.Map;

import hudson.model.Run;
import io.jenkins.plugins.sample.template.SimpleIssue;
import jenkins.model.RunAction2;

public class HelloWorldAction implements RunAction2 { 

    private String msg;
    private transient Run<?,?> run; 

    public HelloWorldAction(String  msg) {
        this.msg= msg;
    }

    @Override
    public void onAttached(Run<?, ?> run) {
        this.run = run; 
    }

    @Override
    public void onLoad(Run<?, ?> run) {
        this.run = run; 
    }

    public Run<?,?> getRun() { 
        return run;
    }

    @Override
    public String getIconFileName() {
        return "document.png";
    }

    @Override
    public String getDisplayName() {
        return "Greeting";
    }

    @Override
    public String getUrlName() {
        return "Greeting";
    }
}
```

{% note info flat %}
💡 相關說明：
建構子中可放入參數，將Builder的資料傳到Action，這樣獨立頁面的jelly就可以取得需要顯示的資料
getIconFileName方法可以設置側邊欄項目圖示
getDisplayName方法可以設置側邊欄項目顯示名稱
getUrlName方法可以設置獨立頁面的路徑名稱
{% endnote %}


### 獨立頁面UI設置

獨立頁面的話需要設置index.jelly檔案，範例如下：
`resources\io\jenkins\plugins\sample\HelloWorldAction\index.jelly`

若要使用變數資料一樣${it.變數名稱}透過這樣的格式就可以調用

```java
<?jelly escape-by-default='true'?>
<j:jelly xmlns:j="jelly:core" xmlns:l="/lib/layout" xmlns:st="jelly:stapler">
    <l:layout title="Greeting"> 
        <l:side-panel> 
            <st:include page="sidepanel.jelly" it="${it.run}" optional="true" /> 
        </l:side-panel>
        <l:main-panel> 
				     ${it.msg}
        </l:main-panel>
    </l:layout>
</j:jelly>
```
{% note info flat %}
💡 1.「layout」是 Jenkins 核心定義的可重用標籤，它提供頁面的基本布局，包括標頭、側邊面板、主內容區域和頁腳。
2. 「side-panel」標籤為在側邊面板中顯示
3.「main-panel」標籤可以放入獨立頁面中要顯示的內容。
{% endnote %}

### 在Builder執行Action以觸發頁面生成

```java
@Override
public void perform(Run<?, ?> run, FilePath workspace, EnvVars env, Launcher launcher, TaskListener listener) throws InterruptedException, IOException {
		run.addAction(new HelloWorldAction("Something input"));  
}
```

## 結語
雖然篇幅有些長，不過在這篇章節裡，已經可以了解Jenkins Plugin的基本架構以及關聯邏輯，不過除了建置執行之外還有許多擴展點可以研究。
