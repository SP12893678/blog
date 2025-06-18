title: Cloudflare：Domain 託管便捷應用 - Email Routing
description: 

categories:
  - Network
tags:
  - Network
  - DNS
  - Cloudflare
  - Email Routing

keywords: Network, DNS, Cloudflare, Email Routing
date: 2025-6-17 12:00:00
copyright_info: 此文章版權歸JUN-HONG所有，如有轉載，請註明來自原作者

cover: https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/banner_traefik-mkcert
---

## 前言

擁有一組自己的域名（Domain）可以實現很多應用，最簡易的應用是將指定的域名路由到架設的服務，讓使用者可以透過域名訪問到服務。Cloudflare 提供域名託管，並提供各種整合性質服務，本次要分享2種服務與實務上的應用。

## 章節重點

- 環境準備
- Domain Email Routing 無限Email 收信測試系統
- Cloudflare Tunnels 分享Local臨時測試/Demo服務

## 環境準備

- 擁有一組域名

## Domain Email Routing 無限Email 收信測試系統

當開發一個產品或服務時，可能會設計註冊驗證信、邀請信等機制。並且產品可能有很多不同的角色與權限設置。為方便測試，需要很多Email帳號，而Cloudflare提供的Email Routing機制可以為自己的網域建立自訂電子郵件地址，並將收到的郵件轉送到指定的信箱。

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image.png)

### 設置DNS MX(Mail Exchange)記錄

設置DNS MX(Mail Exchange)記錄，用來指定該網域名稱的**電子郵件伺服器**

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%201.png)

這邊Cloudflare已經帶出設定內容，讓我們可以很便利的直接將DNS紀錄指到Cloudflare的電子郵件伺服器上，讓他來幫我們處理信件的接收與轉發事件

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%202.png)

設定完DNS MX紀錄後，就會啟用Email routing 並且有寫入相關的MX紀錄設置

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%203.png)

### 新增轉發的郵件地址

在Destination address要新增轉發的郵件地址

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%204.png)

### 啟用Email Routing設置

啟用Email Routing設置，設置Catch-All攔截所有郵件地址，並轉發給指定電子郵件

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%205.png)

點選Edit編輯設置攔截所有郵件的行為與目的地

這邊我們就選擇 Send to an email 寄送郵件到我們剛才設置的轉發地址

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%206.png)

<aside>
💡

到這步驟我們就能讓只要是發送到 @hairybear.me 的信件，都會被轉發到我自己的Gmail信箱中

</aside>

### Gmail接收者設定轉發對象與條件

如果想讓團隊成員都可以一起測試信件註冊驗證信、邀請信等機制或者多角色等功能，可以透過Gmail轉發機制給其他人

首先需要去設定 ⇒ 轉寄和POP/IMAP來新增轉寄的地址

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%207.png)

新增後需要讓接收的信箱做驗證

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%208.png)

確認是否允許接收來自XXX的自動郵件轉寄

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%209.png)

接續來建構信件篩選器，設置我們想要轉寄的郵件規則

這邊收件人就可以填寫 `@<你的域名>`

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%2010.png)

勾選 “轉寄給” 選項，並選擇電子郵件地址

接著就建立篩選器

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%2011.png)

如此我們在設定的⇒ 篩選器和封鎖的地址 就可以看到這項設定規則了

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%2012.png)

接著來用第三個帳號來模擬系統轉發郵件，測試一下能不能成功轉寄給大家

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%2013.png)

第三個帳號成功收到信件啦！

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%2014.png)

## Cloudflare Tunnels 分享Local臨時測試/Demo服務

### Zero Trust Networks **Tunnels**

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%2015.png)

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%2016.png)

![image.png](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/cloudflare-email-routing/image%2017.png)