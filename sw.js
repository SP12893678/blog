"use strict";var workboxVersion="5.1.3";importScripts("https://storage.googleapis.com/workbox-cdn/releases/".concat(workboxVersion,"/workbox-sw.js")),workbox.core.setCacheNameDetails({prefix:"your name"}),workbox.core.skipWaiting(),workbox.core.clientsClaim(),workbox.precaching.precacheAndRoute([{revision:"6e1a9701bc180a946330bdef254b2ec5",url:"./404.html"},{revision:"357c8ade843fd3e00f7b58ec64b75d3e",url:"./archives/2021/09/index.html"},{revision:"eb81ff10b1b20b6d27d7d21ef70dcd48",url:"./archives/2021/index.html"},{revision:"5e91368a4eaad7023347accd3dde2fb5",url:"./archives/2022/03/index.html"},{revision:"63f8a97835ce7c2c6e4d69475495e8e3",url:"./archives/2022/09/index.html"},{revision:"c4fc076ae27c9eb72126cc218955f652",url:"./archives/2022/index.html"},{revision:"73ba60fbc1093abbcef987f669e8ffb2",url:"./archives/index.html"},{revision:"0b8a95072b4911db0986fd9423abd81b",url:"./categories/DevOps/index.html"},{revision:"27c2764b0360b926aef084d65df64c4f",url:"./categories/index.html"},{revision:"217dfe03356289ff30b58e457828fd74",url:"./categories/web伺服器/index.html"},{revision:"58d1d37ffe26f7aec40ed6802b19a13a",url:"./categories/web前端/index.html"},{revision:"1e6fd4e950b5c2caf006b0b6e06f9319",url:"./css/custom.css"},{revision:"25692cc82268d7b156e5de96827da77d",url:"./css/index.css"},{revision:"87dacace071620a60d98d062e7b8433f",url:"./css/tag-diy.css"},{revision:"d41d8cd98f00b204e9800998ecf8427e",url:"./css/var.css"},{revision:"c8080a834279a4328f27f7b62dd85d46",url:"./index.html"},{revision:"c2390f5081136f0574864cd65e55ecd7",url:"./js/bubble.js"},{revision:"01f62452fd05335569c6341d3ac0f52b",url:"./js/main.js"},{revision:"533d980c0d50a0d0d7fe34c41a3e2100",url:"./js/search/algolia.js"},{revision:"acb62dcdf7e90930da3f6bf07349fc21",url:"./js/search/local-search.js"},{revision:"b3810513e04b13b2d18c6b779c883f85",url:"./js/tw_cn.js"},{revision:"12cef07c2e9bc8841a5380df4fd342f5",url:"./js/utils.js"},{revision:"e1db54ceeaf8e12c248d95956774733f",url:"./manifest.json"},{revision:"f1cc4612b43d01eca3b3adaa3416bfe5",url:"./posts/c3f7c839c7aa/index.html"},{revision:"46bf464e9c8cd6bfde5987e1efd72b53",url:"./posts/fc3aaac1c88e/index.html"},{revision:"d946cff76af70be305fa9aafc622f044",url:"./posts/fdc9a87fd564/index.html"},{revision:"eb9f13fe807490e751d173a3b0a0019c",url:"./tags/certbot/index.html"},{revision:"ab4466e9d048448232f581c2f4381bcf",url:"./tags/CI-CD/index.html"},{revision:"efe8b7669b4e7b81d92e4aac2abdf88f",url:"./tags/cloudflare/index.html"},{revision:"42ca3efa11017f434023bab3cff8bd2e",url:"./tags/dns/index.html"},{revision:"1050e653fdc52e9670c0deec46b68928",url:"./tags/docker-compose/index.html"},{revision:"b07a64faff3c5cc252771458a17e4486",url:"./tags/docker/index.html"},{revision:"dcb74f144af962bbe5b9238dae44fa33",url:"./tags/gitlab/index.html"},{revision:"6394271ee95ca10422bbd23bb3272f6e",url:"./tags/google-cloud/index.html"},{revision:"13d00b5cdf09afc50cc4e26bba81743f",url:"./tags/gradle/index.html"},{revision:"c7b38987059c7d4e9f30b8ad08ae7e5f",url:"./tags/index.html"},{revision:"d8db7f1e66f477fd7f17d8b0c5df9321",url:"./tags/jenkins/index.html"},{revision:"5cff4620cfe4ed325380cb8bd2816886",url:"./tags/maven/index.html"},{revision:"3f890043afa8bb38a7bc0504eec08907",url:"./tags/npm/index.html"},{revision:"6d8a8e45fe299f6f038a69ea75be5529",url:"./tags/sonarqube/index.html"},{revision:"18870437d2b3f7c3aff84744b330391b",url:"./tags/ssl/index.html"},{revision:"86ae75fc628f901dc0bc256cf7df3437",url:"./tags/webpack-dev-server/index.html"},{revision:"7c895f2f6f4b7776a5ea999d32338230",url:"./tags/webpack/index.html"},{revision:"7cd1d777c4bc386398e6bf7dc08a1cc8",url:"./tags/前端打包工具/index.html"}],{directoryIndex:null}),workbox.precaching.cleanupOutdatedCaches(),workbox.routing.registerRoute(/\.(?:png|jpg|jpeg|gif|bmp|webp|svg|ico)$/,new workbox.strategies.CacheFirst({cacheName:"images",plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:1e3,maxAgeSeconds:2592e3}),new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]})]})),workbox.routing.registerRoute(/\.(?:eot|ttf|woff|woff2)$/,new workbox.strategies.CacheFirst({cacheName:"fonts",plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:1e3,maxAgeSeconds:2592e3}),new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]})]})),workbox.routing.registerRoute(/^https:\/\/fonts\.googleapis\.com/,new workbox.strategies.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets"})),workbox.routing.registerRoute(/^https:\/\/fonts\.gstatic\.com/,new workbox.strategies.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:1e3,maxAgeSeconds:2592e3}),new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]})]})),workbox.routing.registerRoute(/^https:\/\/cdn\.jsdelivr\.net/,new workbox.strategies.CacheFirst({cacheName:"static-libs",plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:1e3,maxAgeSeconds:2592e3}),new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]})]})),workbox.googleAnalytics.initialize();