"use strict";var workboxVersion="5.1.3";importScripts("https://storage.googleapis.com/workbox-cdn/releases/".concat(workboxVersion,"/workbox-sw.js")),workbox.core.setCacheNameDetails({prefix:"your name"}),workbox.core.skipWaiting(),workbox.core.clientsClaim(),workbox.precaching.precacheAndRoute([{revision:"6d5c029e2df0fd801411d7897af6664b",url:"./404.html"},{revision:"1fe0323f31dae3e6f17d17c8183583ce",url:"./archives/2021/09/index.html"},{revision:"3189bdf0df9d889f9ad0a590293480e8",url:"./archives/2021/index.html"},{revision:"6e78080b47adb61f695eb02d8f369d00",url:"./archives/2022/03/index.html"},{revision:"0daf60688f5e75bb87c19172449a3dea",url:"./archives/2022/09/index.html"},{revision:"16e136ad2471aad4cf709c44bf22a079",url:"./archives/2022/12/index.html"},{revision:"f622cf4f1728e24b8369f80cd1153346",url:"./archives/2022/index.html"},{revision:"62a2786a709d98a2e354f960632424ff",url:"./archives/index.html"},{revision:"3fe9579f4a5d0db0214e399f17545778",url:"./categories/DevOps/index.html"},{revision:"590e3220f76fd3ba5d1e90d7dae27bf0",url:"./categories/index.html"},{revision:"1dd6a0ab40856fd5aad28535ef2c1320",url:"./categories/web伺服器/index.html"},{revision:"543d4d1e6ac410fd665da9b5cb8f63c8",url:"./categories/web前端/index.html"},{revision:"1e6fd4e950b5c2caf006b0b6e06f9319",url:"./css/custom.css"},{revision:"25692cc82268d7b156e5de96827da77d",url:"./css/index.css"},{revision:"87dacace071620a60d98d062e7b8433f",url:"./css/tag-diy.css"},{revision:"d41d8cd98f00b204e9800998ecf8427e",url:"./css/var.css"},{revision:"3e3557a1baa7dbe6533e71f88cd9c362",url:"./index.html"},{revision:"c2390f5081136f0574864cd65e55ecd7",url:"./js/bubble.js"},{revision:"01f62452fd05335569c6341d3ac0f52b",url:"./js/main.js"},{revision:"533d980c0d50a0d0d7fe34c41a3e2100",url:"./js/search/algolia.js"},{revision:"acb62dcdf7e90930da3f6bf07349fc21",url:"./js/search/local-search.js"},{revision:"b3810513e04b13b2d18c6b779c883f85",url:"./js/tw_cn.js"},{revision:"12cef07c2e9bc8841a5380df4fd342f5",url:"./js/utils.js"},{revision:"e1db54ceeaf8e12c248d95956774733f",url:"./manifest.json"},{revision:"927aecbbc448eed79f36fa139dfd07fa",url:"./posts/c3f7c839c7aa/index.html"},{revision:"d99868c5a13fa0469215f0041a9c0b5e",url:"./posts/ede856d55d6d/index.html"},{revision:"7d60a4ddd7239e05299606d8e4aa2c53",url:"./posts/fc3aaac1c88e/index.html"},{revision:"9745ceb082fab8fedaeddee3ac199f2f",url:"./posts/fdc9a87fd564/index.html"},{revision:"4ed2cf38aa1da6f0c60fc9a51074091b",url:"./tags/certbot/index.html"},{revision:"b3c14f64cc24317e21303e8d45dccea4",url:"./tags/CI-CD/index.html"},{revision:"2aa7dd66f403012ec663c8ba628f85f2",url:"./tags/cloudflare/index.html"},{revision:"8b804623de833cb54d40f247e0fbf634",url:"./tags/dns/index.html"},{revision:"0bb6be4bd12b65cc3aa0914cd3f1ac1f",url:"./tags/docker-compose/index.html"},{revision:"0097e84c7c4cca95a9f99dbf11dd64b4",url:"./tags/docker/index.html"},{revision:"7136c81158e1f5d1454ae6e56f1dcc38",url:"./tags/gitlab/index.html"},{revision:"ecd7c9e93b940f8289e4c68835cb6e32",url:"./tags/google-cloud/index.html"},{revision:"8521a574d5effd5dbdec7a15d40ebd74",url:"./tags/gradle/index.html"},{revision:"70177ee679ae87bd8f2c716a732f738d",url:"./tags/index.html"},{revision:"e95aaf45325e80c3f28d58c3885f9c34",url:"./tags/jenkins-plugin/index.html"},{revision:"42510db92cdfbee74034bff0e1227d61",url:"./tags/jenkins/index.html"},{revision:"106866c3b45af599d26ea5124c297e16",url:"./tags/maven/index.html"},{revision:"0c09a9c59b68b69f56d7fd831266e2b8",url:"./tags/npm/index.html"},{revision:"223c02cdc9ce562c77e24ec46e7bf5bf",url:"./tags/sonarqube/index.html"},{revision:"5b6a50a9c55315f502403d4463330ca6",url:"./tags/ssl/index.html"},{revision:"a14850f493cc4a1b92b044170819aeec",url:"./tags/webpack-dev-server/index.html"},{revision:"297857e2bf9bf974d9e90af3d3fb7a92",url:"./tags/webpack/index.html"},{revision:"19d09a4c624afbc32d940d94a95658bd",url:"./tags/前端打包工具/index.html"}],{directoryIndex:null}),workbox.precaching.cleanupOutdatedCaches(),workbox.routing.registerRoute(/\.(?:png|jpg|jpeg|gif|bmp|webp|svg|ico)$/,new workbox.strategies.CacheFirst({cacheName:"images",plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:1e3,maxAgeSeconds:2592e3}),new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]})]})),workbox.routing.registerRoute(/\.(?:eot|ttf|woff|woff2)$/,new workbox.strategies.CacheFirst({cacheName:"fonts",plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:1e3,maxAgeSeconds:2592e3}),new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]})]})),workbox.routing.registerRoute(/^https:\/\/fonts\.googleapis\.com/,new workbox.strategies.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets"})),workbox.routing.registerRoute(/^https:\/\/fonts\.gstatic\.com/,new workbox.strategies.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:1e3,maxAgeSeconds:2592e3}),new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]})]})),workbox.routing.registerRoute(/^https:\/\/cdn\.jsdelivr\.net/,new workbox.strategies.CacheFirst({cacheName:"static-libs",plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:1e3,maxAgeSeconds:2592e3}),new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]})]})),workbox.googleAnalytics.initialize();