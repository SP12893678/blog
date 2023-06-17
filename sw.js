"use strict";var workboxVersion="5.1.3";importScripts("https://storage.googleapis.com/workbox-cdn/releases/".concat(workboxVersion,"/workbox-sw.js")),workbox.core.setCacheNameDetails({prefix:"your name"}),workbox.core.skipWaiting(),workbox.core.clientsClaim(),workbox.precaching.precacheAndRoute([{revision:"8231ee42839ca66d0b85c75ae24165b4",url:"./404.html"},{revision:"e1d57175c729d6af2f6c42887752fdc5",url:"./archives/2021/09/index.html"},{revision:"fcb7992ab193fbbe35bd35ba1ae2fd57",url:"./archives/2021/index.html"},{revision:"56ed04b86a269b7c7e4ac621a1314011",url:"./archives/2022/03/index.html"},{revision:"d872cc8e7ad3818d84cc0a01536534c8",url:"./archives/2022/09/index.html"},{revision:"924a0d39341433f8bf17d9b66f5bfeb0",url:"./archives/2022/12/index.html"},{revision:"47b8415efe79b7bfc13d43a0c821ee97",url:"./archives/2022/index.html"},{revision:"da84b7489b511b080e7597b3df765dbb",url:"./archives/2023/05/index.html"},{revision:"aafe9bbc492809f9516d4b528772fd13",url:"./archives/2023/06/index.html"},{revision:"9f2edbdbeb6cf3c42422055bedb49151",url:"./archives/2023/index.html"},{revision:"8bc909bed3c571fd9162726fac0c6ccb",url:"./archives/index.html"},{revision:"30c6606989a58c53986daf1425575ad5",url:"./categories/AOP/index.html"},{revision:"db4b7a1f5663646e4687b23b89d99425",url:"./categories/DevOps/index.html"},{revision:"dc0de4a195a476c34a8eb644cb7ee2d4",url:"./categories/index.html"},{revision:"6be1b25ff6e11127eb4c43b733072a45",url:"./categories/Linux/index.html"},{revision:"e39ff08f91e4d3a6b5da3c8169188e61",url:"./categories/web伺服器/index.html"},{revision:"e8ab348fa0d203c0917a84fb4ee3c004",url:"./categories/web前端/index.html"},{revision:"1e6fd4e950b5c2caf006b0b6e06f9319",url:"./css/custom.css"},{revision:"25692cc82268d7b156e5de96827da77d",url:"./css/index.css"},{revision:"87dacace071620a60d98d062e7b8433f",url:"./css/tag-diy.css"},{revision:"d41d8cd98f00b204e9800998ecf8427e",url:"./css/var.css"},{revision:"1e6024b2464534b3c5ca017024b9558c",url:"./index.html"},{revision:"c2390f5081136f0574864cd65e55ecd7",url:"./js/bubble.js"},{revision:"01f62452fd05335569c6341d3ac0f52b",url:"./js/main.js"},{revision:"533d980c0d50a0d0d7fe34c41a3e2100",url:"./js/search/algolia.js"},{revision:"acb62dcdf7e90930da3f6bf07349fc21",url:"./js/search/local-search.js"},{revision:"b3810513e04b13b2d18c6b779c883f85",url:"./js/tw_cn.js"},{revision:"12cef07c2e9bc8841a5380df4fd342f5",url:"./js/utils.js"},{revision:"e1db54ceeaf8e12c248d95956774733f",url:"./manifest.json"},{revision:"c28152f645058bb9f44fd139be6af514",url:"./posts/33295bcc3561/index.html"},{revision:"5d5a5a2a1acc2d4c0858e7ad06b709de",url:"./posts/567ec1ac1a99/index.html"},{revision:"93be1c764e95c4a311ed8b6945af055e",url:"./posts/c3f7c839c7aa/index.html"},{revision:"cede3d7ab9be6c94ab2ea7c126297e77",url:"./posts/ede856d55d6d/index.html"},{revision:"ff44cf120e22899da1e5789d045bda4a",url:"./posts/ee9153d108ab/index.html"},{revision:"1e3b48438b349ea3d9d56c0c56ddd731",url:"./posts/fc3aaac1c88e/index.html"},{revision:"4f87c8bc37bb02535c8375dc361e0d11",url:"./posts/fdc9a87fd564/index.html"},{revision:"4cc4d922298b50d862ac648a90bf8eaa",url:"./tags/AOP/index.html"},{revision:"648837541b1c8c8f1ec84a7c8243c22c",url:"./tags/AspectJ/index.html"},{revision:"98bf2d60dc8a04c97d7629b745c5491b",url:"./tags/Backup/index.html"},{revision:"09ce38a07a1c8b4c21e2831b34690d3a",url:"./tags/certbot/index.html"},{revision:"c88b496167b6ee804ef23043ef614430",url:"./tags/CI-CD/index.html"},{revision:"20e340b0500b33005deab93fceebaa57",url:"./tags/cloudflare/index.html"},{revision:"7deb0f2e8e6282d019a8c1acbf1ed496",url:"./tags/DevOps/index.html"},{revision:"505a9fcc286d18310a6e20401775dfbc",url:"./tags/Disaster-Recovery/index.html"},{revision:"9613d8bfa23b4a7791cb8e69d7fe8579",url:"./tags/dns/index.html"},{revision:"ff2615554f67185a6e9fa2406eb54546",url:"./tags/docker-compose/index.html"},{revision:"5984546861e386cf8c97547c714338cb",url:"./tags/docker/index.html"},{revision:"45685576131282fe6b3ea15fc8d0b76d",url:"./tags/gitlab/index.html"},{revision:"f40bae3b12bba0b7e52a10b05e583b30",url:"./tags/google-cloud/index.html"},{revision:"34c8a1b0c8a64bdfb25ac1f8a971a1df",url:"./tags/gradle/index.html"},{revision:"d4ea8fd0a050edb664d0c6d8ff22785a",url:"./tags/index.html"},{revision:"6d08cd73ae1b06c7485fa4871e90235d",url:"./tags/jenkins-plugin/index.html"},{revision:"dc777c744e4f4afb3ba0053594b9886b",url:"./tags/jenkins/index.html"},{revision:"cd0b533a8731146cfac79dd14c6ef67b",url:"./tags/Linux/index.html"},{revision:"7384b88cb705e2dbeca61f08483c5cb1",url:"./tags/maven/index.html"},{revision:"7dc24a21d558126dfcac220c2a9a5903",url:"./tags/npm/index.html"},{revision:"d327bc6cf12acd195b2bc847fce71d72",url:"./tags/sonarqube/index.html"},{revision:"081229c4223188b6a33fff9f78b8b78a",url:"./tags/ssl/index.html"},{revision:"e9c24f689c3557662fb90d6e92be8191",url:"./tags/webpack-dev-server/index.html"},{revision:"2c9ffb3008e865c28d3199418e335d28",url:"./tags/webpack/index.html"},{revision:"bb07fa2b38e712e48b4e1d21ad7161c8",url:"./tags/前端打包工具/index.html"}],{directoryIndex:null}),workbox.precaching.cleanupOutdatedCaches(),workbox.routing.registerRoute(/\.(?:png|jpg|jpeg|gif|bmp|webp|svg|ico)$/,new workbox.strategies.CacheFirst({cacheName:"images",plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:1e3,maxAgeSeconds:2592e3}),new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]})]})),workbox.routing.registerRoute(/\.(?:eot|ttf|woff|woff2)$/,new workbox.strategies.CacheFirst({cacheName:"fonts",plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:1e3,maxAgeSeconds:2592e3}),new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]})]})),workbox.routing.registerRoute(/^https:\/\/fonts\.googleapis\.com/,new workbox.strategies.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets"})),workbox.routing.registerRoute(/^https:\/\/fonts\.gstatic\.com/,new workbox.strategies.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:1e3,maxAgeSeconds:2592e3}),new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]})]})),workbox.routing.registerRoute(/^https:\/\/cdn\.jsdelivr\.net/,new workbox.strategies.CacheFirst({cacheName:"static-libs",plugins:[new workbox.expiration.ExpirationPlugin({maxEntries:1e3,maxAgeSeconds:2592e3}),new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]})]})),workbox.googleAnalytics.initialize();