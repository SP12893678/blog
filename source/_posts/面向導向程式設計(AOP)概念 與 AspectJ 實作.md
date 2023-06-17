title: 面向導向程式設計(AOP)概念 與 AspectJ 實作
description: 

categories:
  - AOP
tags:
  - AOP
  - AspectJ
  - Maven

keywords: AOP, AspectJ, Maven
date: 2023-6-17 12:00:00
copyright_info: 此文章版權歸JUN-HONG所有，如有轉載，請註明來自原作者

cover: https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/banner_gitlab-server-runner-docker.jpg
---

## 前言
在物件導向程式設計（OOP）中，系統的功能被分散到多個類別或物件中，例如日誌記錄、權限驗證、安全性等方面的程式碼會散佈在不同的類和方法中，導致程式碼的重複性和難以維護性增加。 AOP的目標是通過提取這些橫切關注點，並將它們模組化，從而提高程式碼的可讀性、可維護性和可重用性。

## AOP介紹

### AOP概念

簡單來說，面向導向程式設計(Aspect-oriented programming, AOP)是**根據專案程式中想要介入的地方進行行為操作**。

如下圖範例，想對Method A B C執行前都先進行權限驗證行為，執行後都進行日誌紀錄行為。而原本寫法上要到每個函式宣告的地方插入撰寫的內容。AOP則改為在單個面向程式碼中寫這幾個Method是切入點，要在執行前加入這項功能行為。來達成統一管理以及模組化的效用

換個情境思考，若原先的寫法上因為驗證相關的類別與方法有更新，而導致每個引用的部分皆須微調修正，那是不是會頭痛呢
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/aop-1.jpg)
### AOP術語

在AOP中有以下常用的術語：

- 面向連結點 (joinpoint)
    連結點為在面向中需要關注的點，如以下：
    1. 呼叫方法或建構子 (A method or constructor call)
    2. 方法與建構子的執行 (The execution of a method or constructor)
    3. 變數欄位的訪問或更新 (The accessing or updating of a field)
    4. 異常處理 (The handling of an exception)
    5. 類別與物件的初始化 (The initialization of a class or object)
    
    具題撰寫格式如下：
    
    ```bash
    call ( void Foo.m(int) )
    call ( Foo.new(..) )
    execution ( * Foo.*(..) throws IOException )
    execution ( !public Foo.new(..) )
    initialization ( Foo.new(int) )
    within ( com.bigboxco.* )
    args ( *, int )
    ```
    
    {% note info flat %}
    💡可以發現call、execution、initialization等為不同的連接方法 
    括弧裡面格式通常為 (回傳型別 類別方法(參數))
    上述範例中*星字號代表不限制，亦即皆可
    ..符號則表示不管內容為何皆可
    {% endnote %}
    
    因此，上述範例的joinpoint可以為
    
    ```
    call(void Foo.MethodA())
    call(int Bar.MethodB())
    call(void Bear.MethodC(int))
    ```
    
- 面向切入點 (pointcut)
    
    選擇面向連結點的方式/規則，代表該邏輯面向為一種切入點，可以當作切入點是一個該面向切入的稱呼
    
    例如上述中我們可以定義權限驗證的切入點為以下：
    
    ```bash
    pointcut auth():
    call(void Foo.MethodA()) ||
    call(int Bar.MethodB())  ||
    call(void Bear.MethodC(int))
    ```
    
    可以看到我們將切入點取名為auth，其規則為任一執行指定類別方法即符合條件，其中採用 || 或者的符號處理
    
- 面向切入行為 (advice)
    
    希望在切入點進行的操作方式，例如在切入點前後增加功能，或者改寫切入點的內容
    
    1. Before：於指定切入點前加入行為
    2. After：於指定切入點後加入行為
    3. Around：於指定切入點覆寫行為
    
- 面向編織器 (aspect weaver)
    
    負責在編譯時期將面向程式碼所定義之內容併入系統中，因此編譯後的byte code中會將切入行為注入至切入點中。若我們透過反編譯方式查看程式碼，是可以很明顯地看到。
    

### AOP特性與優點

- 允許不修改原程式碼情況下添增行為
- 提高模組化程度與維護性
- 效能方面與傳統撰寫方式幾乎相同

## Maven介紹

### Maven概念

Maven是一個基於Java的專案管理工具，可以幫助開發人員自動化建構、發布和管理Java專案。Maven使用一個稱為POM（Project Object Model）的XML檔案來描述專案的結構、相依關係和建構過程。POM檔案包含專案的metadata，例如專案名稱、版本號、作者等，同時也定義了專案的相依關係、建構目標和插件配置等資訊。

以下是一些Maven的重要概念：

1. POM（Project Object Model）：POM是Maven專案的核心檔案，描述了專案的結構、相依關係和建構過程。POM檔案位於專案的根目錄下，使用XML格式進行編寫。
2. 依賴管理：Maven透過POM檔案中的相依配置來管理專案的相依關係。開發人員可以指定專案所依賴的外部函式庫或模組，Maven會自動下載這些相依項目並將其加入專案的建構路徑中。
3. 建構生命週期(Lifecycle)：Maven定義了一組標準的建構生命週期，包括clean、compile、test、package、install和deploy等階段。開發人員可以在POM檔案中配置這些生命週期階段要執行的操作，以實現專案的建構、測試和部署等任務。
4. 插件：Maven支援外掛程式機制，開發人員可以透過外掛程式擴展和客製化專案的建構過程。外掛程式可以在建構生命週期的不同階段執行特定的任務，例如程式碼靜態分析、單元測試、打包等。
5. 倉庫（Repository）：Maven使用倉庫來存儲和管理相依函式庫和建構成果。有兩種類型的倉庫：本地倉庫（Local Repository）和遠端倉庫（Remote Repository）。本地倉庫位於本地開發機器上，用於快取下載的相依項目和建構成果。遠端倉庫是分佈式的，可以是公共的中央倉庫或私有的自訂倉庫，用於分享和獲取相依項目。

透過使用Maven，開發人員可以簡化專案的建構過程，自動管理相依關係，提高專案的可維護性和可重複使用性。此外，Maven還提供了許多其他功能，例如專案報告、程式碼檢查、文件生成等，進一步提升開發效率和專案品質。

### Maven專案結構

以下為專案的結構

1. 在專案資料夾根目錄必定要有pom.xml檔案
2. src為撰寫原始碼的目錄
    1. main為主要程式撰寫區域
    2. test為測試案例撰寫的區域
3. target為編譯後產生bytecode與相關報告的位置

```bash
my-app
|-- pom.xml
`-- src
|   |-- main
|   |   `-- java
|   |       `-- com
|   |           `-- mycompany
|   |               `-- app
|   |                   `-- App.java
|   `-- test
|       `-- java
|           `-- com
|               `-- mycompany
|                   `-- app
|                       `-- AppTest.java
` -- target
```

### Maven POM結構

pom.xml採用標籤形式撰寫，project標籤包含pom整體內容，其內容可劃分幾個區域：

1. 專案資訊
    
    groupId標籤主要是定義該專案所屬的組織，若以後發佈給他人使用，他人在引用宣告時將依循groupId的名稱使用
    
    artifactId為定義專案的ID，就是專案的唯一辨別方法，後續發佈至公開的儲存庫中可以辨別
    
2. 專案屬性
    
    properties標籤區域主要紀錄專案使用的字源編碼與編譯版本
    
    以下範例採用UTF-8以及Java 7版本
    
3. 依賴套件
    
    在dependencies標籤區域內撰寫使用的第三方套件，如以下範例採用了junit單元測試套件
    
    其中每個依賴套件需要以dependency標籤宣告，groupId、artifactId、version則是定義專案需要的套件為何與版本
    
    {% note info flat %}
    💡一般引用第三方套件可於mvn repository網站找到需要的套件，其中引用的內容資訊也會提供
    {% endnote %}
    
4. 建構資訊 & 插件管理
    
    build標籤區域主要為有關專案建構的資訊，也就是跟生命週期相關的內容
    
    其中透過pluginManagement可以擴充以及控制生命週期指令需進行的事項
    
    添增插件方法與依賴套件概念相似，於plugins標籤區域添加plugin標籤
    

```xml
<?xml version="1.0" encoding="UTF-8"?>

<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.mycompany.app</groupId>
  <artifactId>my-app</artifactId>
  <version>1.0-SNAPSHOT</version>

  <name>my-app</name>
  <!-- FIXME change it to the project's website -->
  <url>http://www.example.com</url>

  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.source>1.7</maven.compiler.source>
    <maven.compiler.target>1.7</maven.compiler.target>
  </properties>

  <dependencies>
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>4.11</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <pluginManagement>
      <plugins>
        <plugin>
          <artifactId>maven-clean-plugin</artifactId>
          <version>3.1.0</version>
        </plugin>
        <plugin>
          <artifactId>maven-compiler-plugin</artifactId>
          <version>3.8.0</version>
        </plugin>
        <plugin>
          <artifactId>maven-jar-plugin</artifactId>
          <version>3.0.2</version>
        </plugin>
      </plugins>
    </pluginManagement>
  </build>
</project>
```
### Maven指令

在上述介紹中提到生命週期的流程，其中常見的指令也與生命週期相關，而這些的指令操作是否可行以及執行內容也與插件有關連性。

- 專案範本 mvn archetype:generate
- 編譯 mvn compile
- 安裝 mvn install
- 執行 mvn exec
- 測試 mvn test
- 打包 mvn package

## 實作重點

- 環境準備
    - Java 11環境安裝
    - Maven安裝
- 建立Maven專案 與 AspectJ套件依賴設置
    - 範本形式建立Maven專案
    - pom.xml 執行指令設置
    - AspectJ - pom.xml設置
- 面向程式碼實作
    - 預備範例切入點對象
    - 面向宣告
    - 切入點宣告與行為撰寫
    - 多個連接點為切入點
- AspectJ支援的相關資訊
    - Pointcut形式
    - Adivce類型
- Around Advice運用方法
    - ProceedingJoinPoint支援取得切入點資訊

## 環境準備

接續實作上採用Windows作業系統、Java 11、Maven為環境

### Java 11環境安裝

到[Java Archive Downloads - Java SE 11 | Oracle 台灣](https://www.oracle.com/tw/java/technologies/javase/jdk11-archive-downloads.html) JAVA JDK 11網站選擇下載

![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/aop-2.jpg)

安裝後，其安裝內容應該會在C:\Program Files\Java\jdk-11.x.x

![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/aop-3.jpg)

- 前往環境變數設置頁面

  ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/aop-4.jpg)

- 設定環境變數

  ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/aop-5.jpg)

- 設定JAVA_HOME環境變數

  ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/aop-6.jpg)

- 測試指令

  ```java
  java -version
  javac -version
  ```

  ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/aop-7.jpg)

### Maven安裝

[Maven – Download Apache Maven](https://maven.apache.org/download.cgi)

- 下載Maven

  ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/aop-8.jpg)

- 解壓縮至C磁碟

- 設定環境變數

  ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/aop-9.jpg)

- 測試指令

  ```java
  mvn -v
  ```

  ![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/aop-10.jpg)

## 建立Maven專案 與 AspectJ套件依賴設置

### 範本形式建立Maven專案

maven提供便捷的指令可以建構專案範本，其中甚至可以指定專案的類型需求

本次實作僅需一般的即可，使用官方建議的快速入門範本

```bash
mvn archetype:generate -DgroupId=com.mycompany.app -DartifactId=my-app -DarchetypeArtifactId=maven-archetype-quickstart -DarchetypeVersion=1.4 -DinteractiveMode=false
```
{% note info flat %}
💡參數說明
-DgroupId：你建立的專案所屬的組織
-DartifactId：你建立的專案ID
-DarchetypeArtifactId：指定的範本ID
-DarchetypeVersion：範本的版本，要看範本支援到哪一版
-DinteractiveMode：是否啟用互動模式
{% endnote %}

### pom.xml 執行指令設置

若於專案中欲執行main函式會發生錯誤，原因為目前的pom尚未設置執行方法的插件

```xml
mvn exec:java
```

在pom.xml插件管理處plugins標籤區內添增以下plugin標籤描述的區塊

其中configuration的mainClass是告訴maven main函式的位置

```xml
<plugins>
	<!-- ... -->
	<plugin>
		<groupId>org.codehaus.mojo</groupId>
    <artifactId>exec-maven-plugin</artifactId>
    <version>3.1.0</version>
    <configuration>
	     <mainClass>com.mycompany.app.App</mainClass>
    </configuration>
  </plugin>
</plugins>
```

### AspectJ - pom.xml設置

在設置上包含依賴與插件設置，依賴設置主要使得在程式碼中可以使用aspectj語法(joinpoint、pointcut、advice)，插件設置則為生命週期中編譯時期需要進行編織動作，因此需要設置插件。

- 依賴設置
    
    ```xml
    <dependencies>
    	<dependency>
    	  <groupId>org.aspectj</groupId>
        <artifactId>aspectjweaver</artifactId>
        <version>1.9.7</version>
        <scope>runtime</scope>
      </dependency>
        
      <dependency>
        <groupId>org.aspectj</groupId>
        <artifactId>aspectjrt</artifactId>
    	  <version>1.9.7</version>
      </dependency>
    </dependencies>
    ```
    

- 插件設置
    
    ```xml
    <plugins>
    	<plugin>
    		<groupId>org.codehaus.mojo</groupId>
    		<artifactId>aspectj-maven-plugin</artifactId>
    		<version>1.14.0</version>
    		<configuration>
    	    <complianceLevel>1.8</complianceLevel>
        </configuration>
    		<executions>
    			<execution>
    				<goals>
    					<goal>compile</goal>    
    					<goal>test-compile</goal> 
    				</goals>
    			</execution>
    		</executions>
    	</plugin>
    </plugins>
    ```
    

## 面向程式碼實作

### 預備範例切入點對象

首先面向程式碼功用為於切入點進行行為操作，因此在專案中我們先宣告一個函式作為切入點

將App.java更改為以下內容，其中程式一執行就會執行App.greet()函式，輸出Hello World!字串

待會我們的切入點就是App.greet()函式

```java
package com.mycompany.app;

/**
 * Hello world!
 *
 */
public class App 
{
    public static void main( String[] args )
    {
        App app = new App();
        app.greet();
    }

    public void greet(){
        System.out.println( "Hello World!" );
    }
}
```

### 面向宣告

使用@Aspect於指定的類別面向宣告，告訴AspectJ Weaver編譯時需進行面向相關操作

```java
package com.mycompany.app;

import org.aspectj.lang.annotation.Aspect;

@Aspect
public class MyAspect {

}
```

### 切入點宣告與行為撰寫

在AOP介紹時，有提到joinpoint或pointcut的寫法格式，這次我們要對App.greet()函式作為切入點，並且是在執行App.greet()函式的時間點

那我們的joinpoint會是`execution(* com.mycompany.app.App.greet())` 

接著根據我們想要介入的時機點進行advice的宣告，如Before、Around、After

範例如下：

- Before advice
    
    ```java
    package com.mycompany.app;
    
    import org.aspectj.lang.annotation.Aspect;
    import org.aspectj.lang.annotation.Before;
    
    @Aspect
    public class MyAspect {
    
        @Before("execution(* com.mycompany.app.App.greet())")
        public void beforeAppGreet() {
            System.out.println("Hello Aspect- Before!");
        }
    
    }
    ```
    
    編織並執行
    
    ```java
    mvn aspectj:compile exec:java
    ```
    
- Around advice
    
    ```java
    package com.mycompany.app;
    
    import org.aspectj.lang.annotation.Around;
    import org.aspectj.lang.annotation.Aspect;
    
    @Aspect
    public class MyAspect {
    
        @Around("execution(* com.mycompany.app.App.greet())")
        public void aroundAppGreet() {
            System.out.println("Hello Aspect - Around!");
        }
    
    }
    ```
    
    編織並執行
    
    ```java
    mvn aspectj:compile exec:java
    ```
    
- after advice
    
    ```java
    package com.mycompany.app;
    
    import org.aspectj.lang.annotation.After;
    import org.aspectj.lang.annotation.Aspect;
    
    @Aspect
    public class MyAspect {
    
        @After("execution(* com.mycompany.app.App.greet())")
        public void afterAppGreet() {
            System.out.println("Hello Aspect - After!");
        }
    
    }
    ```
    
    編織並執行
    
    ```java
    mvn aspectj:compile exec:java
    ```
    

- 切入點管理問題
    
    若三個advice都一同使用的話，如下程式碼
    
    ```java
    package com.mycompany.app;
    
    import org.aspectj.lang.annotation.After;
    import org.aspectj.lang.annotation.Around;
    import org.aspectj.lang.annotation.Aspect;
    import org.aspectj.lang.annotation.Before;
    @Aspect
    public class MyAspect {
    
        @Before("execution(* com.mycompany.app.App.greet())")
        public void beforeAppGreet() {
            System.out.println("Hello Aspect - Before!");
        }
    
        @Around("execution(* com.mycompany.app.App.greet())")
        public void aroundAppGreet() {
            System.out.println("Hello Aspect - Around!");
        }
    
        @After("execution(* com.mycompany.app.App.greet())")
        public void afterAppGreet() {
            System.out.println("Hello Aspect - After!");
        }
    
    }
    ```
    

會發現有一個缺點，其實切入點皆為execution(* com.mycompany.app.App.greet())，那何不統一管理

- 切入點定義
    
    我們將execution(* com.mycompany.app.App.greet())取名為executeAppGreet()切入點，如此在使用時只要輸入executeAppGreet()即可，而切入點有變動時只要修正定義的地方
    
    範例如下：
    
    ```java
    package com.mycompany.app;
    
    import org.aspectj.lang.annotation.Aspect;
    import org.aspectj.lang.annotation.Pointcut;
    
    @Aspect
    public class MyAspect {
    
        @Pointcut("execution(* com.mycompany.app.App.greet())")
        private void executeAppGreet(){
    
        }
    
    }
    ```
    
    完整程式碼：
    
    ```java
    package com.mycompany.app;
    
    import org.aspectj.lang.annotation.After;
    import org.aspectj.lang.annotation.Around;
    import org.aspectj.lang.annotation.Aspect;
    import org.aspectj.lang.annotation.Before;
    @Aspect
    public class MyAspect {
    
        @Before("executeAppGreet()")
        public void beforeAppGreet() {
            System.out.println("Hello Aspect - Before!");
        }
    
        @Around("executeAppGreet()")
        public void aroundAppGreet() {
            System.out.println("Hello Aspect - Around!");
        }
    
        @After("executeAppGreet()")
        public void afterAppGreet() {
            System.out.println("Hello Aspect - After!");
        }
    
    }
    ```
    

### 多個連接點為切入點

在前面AOP介紹時有提到透過規則組合方式定義切入點，其中AspectJ包含以下方法：

- Not規則：!
- OR規則：||
- AND規則：&&
- wildcards規則：*
- wildcards規則：..
- 包含subtype規則：+

以下為採用其中幾種的範例，可以看到

1. * com.mycompany.app.App.greet的*符號代表wildcards容許任何回傳類型
2. com.mycompany.app.App.greet(..)的..符號代表wildcards容許任何參數(不論有無或多少個)
3. !execution(* com.mycompany.app.App.greet())的!符號代表不要對該連接點切入
4. 整體使用 && 串接表示條件都相符才是切入點

總結該切入點是所有不論任何回傳類型與參數多寡的com.mycompany.app.App.greet函式，且不接受沒有參數的

```java
package com.mycompany.app;

import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;

@Aspect
public class MyAspect {
    @Pointcut("execution(* com.mycompany.app.App.greet(..)) && !execution(* com.mycompany.app.App.greet())")
    private void executeAppGreet(){

    }

    @Before("executeAppGreet()")
    public void beforeAppGreet() {
        System.out.println("Hello Aspect - Before!");
    }

    @After("executeAppGreet()")
    public void afterAppGreet() {
        System.out.println("Hello Aspect - After!");
    }
}
```

這次範例的App.java內容如下

```java
package com.mycompany.app;

/**
 * Hello world!
 *
 */
public class App 
{
    
    public static void main( String[] args )
    {
        App app = new App();
        app.greet();
        app.greet("App");
        app.hibernate();
    }

    public void greet(){
        System.out.println( "Hello World!" );
    }

    public void greet(String message){
        System.out.println( "Hello" + message +"!" );
    }

    public void hibernate(){
        System.out.println( "App is hibernating" );
    }
}
```

編織並執行

```java
mvn aspectj:compile exec:java
```

執行結果如下，可以發現greet()函式確實沒有被添增行為，而greet("App")函式則前後添增行為

```java
Hello World!
Hello Aspect - Before!
HelloApp!
Hello Aspect - After!
App is hibernating
```

## AspectJ支援的相關資訊

在https://www.eclipse.org/aspectj/doc/released/quick5.pdf這項文件中，整理了AsepctJ的語法

### Pointcut形式

切入點形式如下：

```java
call(MethodPat) 
call(ConstructorPat) 
execution(MethodPat) 
execution(ConstructorPat) 
initialization(ConstructorPat) 
preinitialization(ConstructorPat) 
staticinitialization(TypePat) 
get(FieldPat) 
set(FieldPat) 
handler(TypePat) 
adviceexecution()
within(TypePat) 
withincode(MethodPat) 
withincode(ConstructorPat) 
cflow(Pointcut) 
cflowbelow(Pointcut) 
if(Expression) 
this(Type | Var) 
target(Type | Var) 
args(Type | Var , …) 
@this(Type|Var) 
@target(Type|Var) 
@args(Type|Var, …) 
@within(Type|Var) 
@withincode(Type|Var) 
@annotation(Type|Var)
```

### Adivce類型

```java
@Before
@AfterReturning
@AfterThrowing
@After
@Around
```

## Around Advice運用方法

around advice可以讓我們覆寫原切入點內容，但若是以類別函式為切入點，那如何在面向程式碼中使用類別函式的參數與類別變數呢?

假設App.java如以下內容

```java
package com.mycompany.app;

/**
 * Hello world!
 *
 */
public class App 
{
    public String name = "";

    public App(String name){
        this.name = name;
    }
    
    public static void main( String[] args )
    {
        App app = new App("Bear");
        app.greet();
        app.greet("App");

        app = new App("Cat");
        app.greet();
        app.greet("meow");
    }

    public void greet(){
        System.out.println( "Hello World!" );
    }

    public void greet(String message){
        System.out.println( "Hello" + message +"!" );
    }
}
```

可以看到App類別有name變數，預設為空字串，在物件初始化時進行設定

一般執行結果會是

```java
Hello World!
Hello App!
Hello World!
Hello meow!
```

若我們想達成使用參數與類別變數，光看之前的Around範例是無法達成的

```java
    @Around("executeAppGreet()")
    public void aroundAppGreet() {
        System.out.println("Hello Aspect - Around!");
    }
```

### ProceedingJoinPoint支援取得切入點資訊

ProceedingJoinPoint可以提供切入點相關資訊，因此在使用Around Advice時可以搭配，以取得所需內容與方法

使用方法為在面向函式中加入ProceedingJoinPoint參數即可使用，如下：

```java
package com.mycompany.app;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;

@Aspect
public class MyAspect {
    @Pointcut("execution(* com.mycompany.app.App.greet(String))")
    private void executeAppGreet(){

    }

    @Around("executeAppGreet()")
    public void aroundAppGreet(ProceedingJoinPoint joinPoint) {
        String arg1 = (String) joinPoint.getArgs()[0];
        System.out.println("Hello Aspect - Around! - " + arg1);

        App myAppClass = (App) joinPoint.getTarget();
        System.out.println("My name is " + myAppClass.name);
    }
}
```

可以看到

使用了joinPoint.getArgs()方法取得該切入點所有的參數

使用了joinPoint.getTarget()方法取得當前切入點所屬物件與其變數

編織並執行

```java
mvn aspectj:compile exec:java
```

執行結果如下

```java
Hello World!
Hello Aspect - Around! - App
My name is Bear
Hello World!
Hello Aspect - Around! - meow
My name is Cat
```

<!-- ## 結語
本篇大致敘述AOP、Maven概念以及使用AspectJ實作AOP的內容， -->
