title: 使用Webpack & Webpack Dev Server打造前端專案環境
description: 隨著技術演進...前端不再是單純html、css、js，為了符合各種需求，開始開發各種框架、預處理器引進專案內，並使用模組化方式開發專案。然而瀏覽器並無法直接辨識這樣的專案內容，因此需要透過webpack等前端打包工具使用編譯的方式轉換成瀏覽器看得懂的內容。

categories:
  - web前端
tags:
  - 前端打包工具
  - webpack
  - webpack-dev-server
  - npm
date: 2021-09-06 12:00:00
copyright_info: 此文章版權歸JUN-HONG所有，如有轉載，請註明來自原作者

cover: /img/banner_webpack_webpack-dev-server.jpg
---

## 前言

### 什麼是Webpack?

Webpack 是一個前端模組打包(module bundler)工具，提供模組化開發方式。將各種靜態資源視為模組(如不同語言vue、sass、js...)，它會從進入點(entry point)開始分析專案結構，找出每個模組間的依賴關係，並分析其中是否有瀏覽器不能直接使用的語法or檔案。最後將每個模組透過編譯方式，轉換成瀏覽器所支援的檔案(html、 css、 js...)打包至指定的輸出資料夾。

如下圖：

![webpack.jpg](/img/webpack.jpg)

### 為什麼要使用Webpack等前端打包工具?

隨著技術演進...前端不再是單純html、css、js，為了符合各種需求，開始開發各種框架、預處理器引進專案內，並使用模組化方式開發專案。然而瀏覽器並無法直接辨識這樣的專案內容，因此需要透過webpack等前端打包工具使用編譯的方式轉換成瀏覽器看得懂的內容。

#### 選擇webpack的原因

除了webpack當然還有許多打包工具，如gulp、parcel、esbuild等等，每個工具都有它的特點，而webpack是目前筆者在開發上順手的工具。

下圖為 [state of js](https://2020.stateofjs.com/en-US/technologies/build-tools/) 的Build Tools調查，可以看到webpack至今使用率非常高。
![2020-build-tool-rank.jpg](/img/2020-build-tool-rank.jpg)

### 什麼是Webpack Dev Server?

webpack-dev-server是webpack所開發的工具，它提供我們在開發中有一個基本的web server，並且具有  live reloading  功能。因此我們不需要等待每次從頭編譯煩人的時間～

在開發時，webpack只是幫我們做檔案編譯的動作而已，實際上我們還需要開一個web server才能瀏覽編譯後的檔案所渲染的網頁內容。

{% note warning flat %}
**live reloading (即時重載)** ：常見又稱hot reload。主要闡述開發的同時能夠即時載入看到最新畫面
※webpack-dev-server提供 **Hot Module Replacement(HMR)** 模式，透過即時替換、添加或刪除模組來達到無須重新載入頁面即可看到最新畫面。
{% endnote %}

### Webpack —watch 與 Webpack Dev Server差異

先來解釋 `webpack --watch`。我們知道透過 `webpack` 指令會進行編譯動作，而 `webpack --watch` 則是執行編譯動作外，並且要啟用觀察模式；當檔案一有變動時就會立即重新編譯，所以不須每次手動輸入指令。

看到這會想說...欸～跟上面webpack-dev-server的概念好像一樣。沒錯，只不過詳細差別有：

{% note info flat no-icon %}
* webpack-dev-server有提供server
* webpack-dev-server編譯之後不會寫入任何輸出檔案，而是將編譯後檔案存在記憶體內供server運行(畢竟只是當時開發用)
* webpack-dev-server有HMR模式，無須刷新瀏覽器頁面即可看到最新畫面
{% endnote %}

## 實作重點

- 安裝webpack、webpack-cli、webpack-dev-server和webpack-merge
- 使用webpack --config、webpack-merge區分 dev 與 prod 環境設定檔
- 使用html-webpack-plugin自動輸出指定html並引入js
- 配置css、js、image模組編譯規則
    - 使用mini-css-extract-plugin輸出單獨CSS檔，支援CSS和SourceMap需要時載載入
    - 使用css-loader處理在js中引入的css檔
    - 使用optimize-css-assets-webpack-plugin優化、最小化CSS
    - 使用babel-loader處理js語法轉換成能被瀏覽器支援的語法
    - 使用file-loader處理引入的檔案物件、輸出目錄和它的url
    - 使用url-loader將部分檔案轉base64編碼嵌入js中，以減少請求次數
    - 使用image-webpack-loader將圖片壓縮優化
- 安裝Vue(JavaScript Framework)、Tailwind CSS(CSS Framework)


## 建立新專案 & 安裝Webpack相關套件

### 建立新專案

建立我們的專案目錄(webpack-dev-server-learning)，在專案目錄下輸入下方指令：

```bash
# 參數-y為使用預設選項初始化
npm init -y
```

在目錄下會產生package.json檔，內容如下：

```json
{
  "name": "webpack-dev-server-learning",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

{% note info flat %}
**npm(Node Package Manager)是基於Node.js的專案套件管理工具。**
透過npm，我們可以統一專案使用的套件版本以及設定環境，可以前往[npm平台](https://www.npmjs.com/)查看所有提供的套件，其中套件的詳細資訊(Readme、依賴關係、安裝方式、github專案、下載數、各版本資訊)。
不同語言也有製作他們的套件管理工具，如：java的mvn
{% endnote %}

{% note warning flat %}
**在npm的世界我們一定要牢記的事：**
* 有些套件還需要安裝其他依賴的套件才能使用
* 套件之間若有關聯會有版本相容問題
* 安裝前除了看套件的文件外，要去該套件的npm網站看各版本下載數，下載數多的相對較穩定，當然還是要記得**版本相容**
{% endnote %}



### 安裝webpack、webpack-cli、webpack-dev-server和webpack-merge

首先解釋一下沒提到的webpack-cli、webpack-merge：

* **webpack-cli** ：cli(Command-Line Interface)也就是命令列介面，由於webpack把cli部分獨立出來，因此我們需要安裝才能使用webpack的指令。
* **webpack-merge** ：幫助我們可以分別撰寫dev 和 prod 的 webpack設定檔

#### 安裝

我這邊指定安裝webpack v4版本，以及其他下載數高的穩定版

```bash
# --save-dev參數表示：套件關係只有在開發或測試的時候需要
npm install webpack@4.46.0 webpack-dev-server@3.11.2 webpack-cli@3.3.12 webpack-merge@5.7.3 --save-dev
```

安裝成功後，在package.json檔會幫我們新增內容，如下：

```json
{
    "name": "webpack-dev-server-learning",
    "version": "1.0.0",
    "description": "",
    "main": "index.js",
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "devDependencies": {
        "webpack": "^4.46.0",
        "webpack-cli": "^3.3.12",
        "webpack-dev-server": "^3.11.2",
        "webpack-merge": "^5.7.3"
    }
}
```

#### 測試環節

接著我們先來測試是否能使用吧！

1. 先建立src目錄，並且在src目錄建立index.js，如下圖：

    ![Untitled](/img/webpack-src-index.jpg)

2. 在package.json新增一條scripts，如下：(記得上一行的逗號)

    ```json
    {
        "name": "webpack-dev-server-learning",
        "version": "1.0.0",
        "description": "",
        "main": "index.js",
        "scripts": {
            "test": "echo \"Error: no test specified\" && exit 1",
            "build": "webpack"
        },
        "keywords": [],
        "author": "",
        "license": "ISC",
        "devDependencies": {
            "webpack": "^4.46.0",
            "webpack-cli": "^3.3.12",
            "webpack-dev-server": "^3.11.2",
            "webpack-merge": "^5.7.3"
        }
    }
    ```

3. 輸入下方指令：

    ```bash
    npm run build
    ```

    若輸入結果如下圖就成功啦

    ![Untitled](/img/webpack-install-output.jpg)

## 依 dev 和 prod 環境分別撰寫webpack設定檔

一般我們可以直接在根目錄撰寫 `webpack.config.js` 設定檔，但當我們開發與生產的環境設定不同時怎麼辦呢？若有些設定會相同，但又不想每次維護兩份檔案的話呢？


{% note success flat %}
* 使用 `webpack --config` 參數來選取我們的需要的設定檔
* 使用 `webpack-merge` 套件幫助我們合併 {% label 共用的 %} 設定檔
{% endnote %}

### 依專案架構建立webpack設定檔

#### 專案架構

```bash
 ├── build
 │   ├── webpack.config.common.js # 共用設定檔   
 │   ├── webpack.config.dev.js    # 開發環境設定檔
 │   └── webpack.config.prod.js   # 生產環境設定檔
 ├── dist # output輸出資料夾
 ├── node_modules
 ├── src
 │   └── index.js # entry 入口點
 ├── package-lock.json
 └── package.json
```

### 撰寫webpack共用設定檔(common)

我們可以在webpack設定該專案編譯的根目錄(context)、入口點(entry)、輸出檔案名稱規則和位置(output)
可以看到我們的設定檔在build資料夾內，所以context必須指向外層才符合我們的需求

{% tabs 依 dev 和 prod 環境分別撰寫webpack設定檔-撰寫webpack共用設定檔(common) %}
<!-- tab webpack.config.common.js -->
```jsx
const path = require('path');

module.exports = {
    context: path.resolve(__dirname, '../'), // 設定編譯時的根目錄
    entry: './src/index.js',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '../dist'),
    },
};
```

{% note warning %}
`path` 為node.js的模組
`__dirname` 則是回傳執行的 js 檔所在資料夾的絕對路徑
{% endnote %}


<!-- endtab -->
{% endtabs %}

### 撰寫webpack開發環境設定檔(dev)

設定檔中的`commonWebpackConfig`是我們剛剛寫的共用設定檔，利用merge將開發環境的設定與其合併。


{% tabs 依 dev 和 prod 環境分別撰寫webpack設定檔-撰寫webpack開發環境設定檔(dev) %}
<!-- tab webpack.config.dev.js -->

```jsx
const commonWebpackConfig = require("./webpack.config.common");
const { merge } = require('webpack-merge');

module.exports = merge(commonWebpackConfig, {
    mode: "development",
    devServer: {
        port: 8080,
        hot: true,
        open: true
    },
    plugins: [

    ],
    module: {
        rules: [
      
        ]
    }
});
```

{% note warning %}
`mode` 設置為開發環境
`devServer` 設置在webpack-dev-server的server環境
{% endnote %}
<!-- endtab -->
{% endtabs %}


### 撰寫webpack生產環境設定檔(prod)

大致設定與開發環境相同，`mode`改為生產環境、生產環境不需要使用dev-server


{% tabs 依 dev 和 prod 環境分別撰寫webpack設定檔-寫webpack生產環境設定檔(prod) %}
<!-- tab webpack.config.prod.js -->

```jsx
const commonWebpackConfig = require("./webpack.config.common");
const { merge } = require('webpack-merge');

module.exports = merge(commonWebpackConfig, {
    mode: "production",
    plugins: [

    ],
    module: {
        rules: [
      
        ]
    }
});
```
<!-- endtab -->
{% endtabs %}



### 測試環節

既然初步的webpack環境已經設定好了那就來測試是否能如期運行吧！

{% tabs 依 dev 和 prod 環境分別撰寫webpack設定檔-功能測試 %}
<!-- tab 開發環境 -->

```bash
npm run dev
```

執行後若如下圖表示成功了，但由於我們沒有設置`index.html` 所以只能看到根目錄

![Untitled](/img/webpack-dev-compile-output.jpg)

![Untitled](/img/webpack-dev-compile-demo.jpg)

{% note warning %}
關於html部份，由於進入點(entry)的index.js不用把html引入，反而是html需要引入index.js。因此我們會需要html-webpack-plugin套件幫助我們編譯後直接幫我們的html樣本引入編譯好的js檔案。
{% endnote %}


#### 安裝html-webpack-plugin

```bash
npm install html-webpack-plugin@4.5.2 --save-dev
```



* 在webpack.config.common.js增加插件設定設定

```jsx
const path = require('path');
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    context: path.resolve(__dirname, '../'), // 設定編譯時的根目錄
    entry: './src/index.js',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '../dist'),
    },  
    plugins:[
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html'
        })
    ]
};
```
    
* 新增src/index.html檔案

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
        
</body>
</html>
```

如此我們再次執行就會得到空白的畫面以及console面板的Hello World!

![Untitled](/img/webpack-dev-server-console.jpg)

<!-- endtab -->

<!-- tab 生產環境 -->

```bash
npm run build
```

沒意外的話，輸入資料夾dist中應該會有main.bundle.js以及剛剛加入的plugin所幫我們產生的index.html
![Untitled](/img/webpack-html-plugin.jpg)
<!-- endtab -->
{% endtabs %}


## 添加Webpack模組編譯規則

我們已經將基本環境架構設置完畢了，接著就可以依需求安裝需要的套件跟按照環境撰寫不同的設定。不過我們為了能夠編譯各種靜態資源還得個別添加模組規則。

### 為什麼要添加模組編譯規則

事實上webpack並不知道你的靜態資源要怎麼編譯，而且它沒辦法獨立完成這項作業。在下圖可以看到我添加了css檔案並在index.js引入，編譯後出現錯誤訊息。
![Untitled](/img/webpack-css-fail-output.jpg)


{% note danger flat %}
「 你需要**合適的loader**來處理這個**檔案類型**，目前這個檔案類型沒有設定任何的loader 」
{% endnote %}

由此可以得知我們必須添加規則設置loader給css的類型檔案，另外webpack本身並沒有各種靜態資源的loader，因此我們還需要額外安裝。

所以添加模組規則會有2件事情要執行：

1. **安裝需要的loader**
2. **在webpack設定檔撰寫模組編譯規則**


### 添加CSS編譯規則

若要編譯CSS我們必須安裝mini-css-extract-plugin(或style-loader)和css-loader，先解釋他們分別處理什麼：

{% note info flat %}
**mini-css-extract-plugin** ：為每個包含 CSS 的 JS 檔案創建一個單獨的 CSS 檔，且支援CSS和SourceMap需要時載載入
**style-loader** ：將CSS注入到HTML的 `<style></style>` 標籤上
**css-loader** ：處理在js中用 `@import url() || import/require()` 引入的css檔(還只是個檔案)
{% endnote %}

可以看到mini-css-extract-plugin已經幫我們處理style-loader的工作了，且功能更豐富

#### 安裝指令

```bash
npm install mini-css-extract-plugin@1.6.2 css-loader@4.3.0 --save-dev
```

#### 撰寫模組編譯規則

{% tabs 添加CSS編譯規則-撰寫模組編譯規則 %}
<!-- tab webpack.config.common.js -->

```jsx
const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    context: path.resolve(__dirname, '../'), // 設定編譯時的根目錄
    entry: './src/index.js',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '../dist'),
    },  
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [ MiniCssExtractPlugin.loader, "css-loader"]
            }
        ]
    },
    plugins:[
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html'
        }),
        new MiniCssExtractPlugin()
    ]
};
```
<!-- endtab -->
{% endtabs %}


{% note warning %}
在rule中以物件方式加入各個規則
其中test辨別該規則的條件(使用正則表示法)，如上述為符合css檔案
一個rule可以設置多個loader，但這邊要注意執行順序是(由下至上、由右至左)
{% endnote %}


在生產環境中我們可以使用optimize-css-assets-webpack-plugin外掛來優化、最小化CSS

#### 安裝optimize-css-assets-webpack-plugin

```bash
npm install optimize-css-assets-webpack-plugin@5.0.4 --save-dev
```

#### 加入插件

{% tabs 安裝optimize-css-assets-webpack-plugin-加入插件 %}
<!-- tab webpack.config.prod.js -->

```jsx
const commonWebpackConfig = require("./webpack.config.common");
const { merge } = require('webpack-merge');

const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = merge(commonWebpackConfig, {
    mode: "production",
    plugins: [
        new OptimizeCssAssetsPlugin({
            cssProcessorPluginOptions: {
              preset: ['default', { discardComments: { removeAll: true } }],
            }
        })
    ],
    module: {
        rules: [

        ]
    },
});
```
<!-- endtab -->
{% endtabs %}


#### 測試環節

若成功的話，在開發環境的網頁上可以看到我們套用的CSS囉！在生產環境則在dist/main.css可以看到壓縮後的css

![Untitled](/img/webpack-css-min-compile.jpg)

### 添加JS編譯規則

webpack預設支援編譯js檔，但無法將ES6以上版本語法編譯至ES5版本。雖然大多瀏覽器開始支援ES6語法，不過ES5版本還是較為穩定且兼容度高。babel是專門處理JavaScript編譯器的工具，因此這裡需要使用babel-loader幫助我們轉換ES6以上版本語法。

#### 安裝指令

```bash
npm install babel-loader@8.2.2 @babel/core@7.15.5 @babel/preset-env@7.15.4 --save-dev
```

{% note warning %}
**@babel/core** 為babel的核心
**@babel/preset-env** 為將大部分瀏覽器尚未支援的 js語法轉換成能被瀏覽器支援的語法
{% endnote %}


#### 撰寫模組編譯規則

{% tabs 添加JS編譯規則-撰寫模組編譯規則 %}
<!-- tab webpack.config.common.js -->

```jsx
const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    context: path.resolve(__dirname, '../'), // 設定編譯時的根目錄
    entry: './src/index.js',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '../dist'),
    },  
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [ MiniCssExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: "defaults" }]
                        ]
                    }
                }
            },
        ]
    },
    plugins:[
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html'
        }),
        new MiniCssExtractPlugin()
    ]
};
```
<!-- endtab -->
{% endtabs %}



#### 測試環節

這邊我使用es6的物件解構。若成功的話，編譯後檔案會發現看不到這種語法

```jsx
import './style.css'

console.log('Hello World!')

let date = {
    year: 2021,
    month: 9,
    day: 9
}

const {year, month} = date
console.log(year,month)
```

### 添加image編譯規則

圖片類型的靜態資源，我們也必須給予編譯規則。這邊會用到url-loader、file-loader、image-webpack-loader三種loader，以下分別為他們的用途。

{% note info flat %}
**url-loader** ：載入檔案並轉為base64編碼，嵌入至js檔內
**file-loader** ：處理引入的檔案物件、輸出目錄和它的url
**image-webpack-loader** ：將圖片壓縮優化
{% endnote %}


一般file-loader就能讓我們可以正常使用了，而url-loader可以設定檔案下限，將檔案嵌入js檔減少之後網頁渲染時request次數。

#### 安裝指令

```bash
npm install url-loader@4.1.1 file-loader@6.2.0 image-webpack-loader@7.0.1
```

#### 撰寫模組編譯規則

{% tabs 添加image編譯規則-撰寫模組編譯規則 %}
<!-- tab webpack.config.dev.js -->
```jsx
const commonWebpackConfig = require("./webpack.config.common");
const { merge } = require('webpack-merge');

module.exports = merge(commonWebpackConfig, {
    mode: "development",
    devServer: {
        port: 8080,
        hot: true,
        open: true
    },
    plugins: [

    ],
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif|jfif|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: 'assets/images/[hash:7].[ext]',
                            limit: 8192,
                            esModule: false
                        }
                    }
                ]
            }
        ]
    }
});
```
<!-- endtab -->

<!-- tab webpack.config.prod.js -->
```jsx
const commonWebpackConfig = require("./webpack.config.common");
const { merge } = require('webpack-merge');

const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = merge(commonWebpackConfig, {
    mode: "production",
    plugins: [
        new OptimizeCssAssetsPlugin({
            cssProcessorPluginOptions: {
              preset: ['default', { discardComments: { removeAll: true } }],
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif|jfif|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: 'assets/images/[hash:7].[ext]',
                            limit: 8192,
                            esModule: false
                        }
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            mozjpeg: {
                                progressive: true,
                                quality: 65,
                            },
                            optipng: {
                                enabled: false,
                            },
                            pngquant: {
                                quality: [0.65, 0.9],
                                speed: 4,
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            webp: {
                                quality: 75,
                            },
                        },
                    }
                ]
            }
        ]
    },
});
```
<!-- endtab -->


{% endtabs %}




#### 測試環節

我們試著拿幾張不同大小的圖片引入js檔編譯看看

如下圖可以看到原始資產中有3張圖片，但輸出資料夾只有2張，因為有一張圖片大小僅5KB，而我們在url-loader設置的限制為10KB，因此被以base64編碼寫至main.bundle.js

![Untitled](/img/webpack-image-loader-prod-output.jpg)

{% note warning %}
file-loader處理檔案物件，也可以應用在音訊、字型、文件檔等等
url-loader也是相同概念，不過要注意大小限制，過度使用反而讓js檔肥大
{% endnote %}

## 結語
看完可以發現並沒有什麼太複雜的概念，webpack就像一個容器讓我們組裝所需的內容, 而只要知道各個零件的用途與設置就可以添加各個需求。不過webpack依然還有須多可以研究的，例如考量網頁效能與體驗上如何最佳化編譯靜態資源將會是很重要的課題。

最後附上本次實作的程式碼
{% link webpack-dev-server-learning, https://github.com/SP12893678/webpack-dev-server-learning, /img/github.svg %}