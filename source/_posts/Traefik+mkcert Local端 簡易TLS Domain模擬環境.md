title: Traefik+mkcert：Local端 簡易TLS Domain模擬環境
description: 

categories:
  - Network

tags:
  - Network
  - DNS
  - HTTPS
  - Traefik
  - Ingress

keywords: Network, DNS, HTTPS, Traefik, Ingress
date: 2025-6-6 12:00:00
copyright_info: 此文章版權歸JUN-HONG所有，如有轉載，請註明來自原作者

cover: https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/banner_traefik-mkcert.png
---

## 前言

在開發 Web 應用或 API 服務時，可能會遇到需要模擬「正式環境」的需求，例如：

- 測試前端在 HTTPS 下的行為（例如 Cookie 的 Secure 屬性、Service Worker 的註冊、瀏覽器安全性限制等）
- 使用 OAuth 或第三方登入服務時，要求 callback URL 必須為 HTTPS 網域
- 模擬實際部署情境中的多個子網域

## 章節重點

- 環境準備
    - Docker安裝
    - Kind安裝
    - helm安裝
- Traefik 介紹
- mkcert 介紹
- Docker Compose 路由轉發設置
- Kubernetes Ingress 路由轉發設置

## 環境準備

### Docker安裝
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

### Kind安裝
```bash
# For AMD64 / x86_64
[ $(uname -m) = x86_64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.29.0/kind-linux-amd64

# For ARM64
[ $(uname -m) = aarch64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.29.0/kind-linux-arm64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
```

### mkcert 安裝
```bash
sudo apt install libnss3-tools

curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert
```

## Traefik 介紹

Traefik是一個的 **反向代理（Reverse Proxy）** 和 **負載平衡器（Load Balancer）**的服務，並且支援容器化Docker、Kubernetes整合，可以便利的處理Ingress的路由處理。

其中提供了docker image、k8s Ingress和自定義的CRD IngressRoute作為Proxy/Ingress角色處理路由

### Traefik me介紹

**Traefik.me** 是一個提供「Wildcard DNS」的免費服務。可以透過類似 `10.0.0.1.traefik.me` 網址，**直接對應到指定 IP（例如本機或區網內的開發伺服器）**，不需要額外設定 DNS 或 `/etc/hosts`，其背後運作的是一台 **自訂的 DNS 伺服器**，它會從這個網域名稱中**解析出 IP 地址**，然後直接回傳。

範例：

- `10.0.0.1.traefik.me` ➝ 會自動解析成 `10.0.0.1`
- `app.10.0.0.1.traefik.me` ➝ 一樣會指向 `10.0.0.1`
- `mysite.traefik.me` ➝ 預設指向 `127.0.0.1` 

{% note info flat no-icon %}
💡 非IP類型，無法辨別的會導向127.0.0.1，非常適合用來Local服務測試
{% endnote %}


## mkcert 介紹

`mkcert` 是一個用來在本地產生「受信任的開發用 SSL 憑證」的工具，免去自己架設 CA 等麻煩設置，還可避免如自簽憑證會有瀏覽器警告。

### 安裝本地CA憑證
會在你的系統中建立並安裝一個本地的憑證授權機構（CA），並加入到系統 的信任憑證庫中。
```bash
mkcert -install
```

### 建立指定域名SSL憑證
為指定的域名或 IP 產生 SSL 憑證，會產生相應的公開憑證與私鑰
```bash
mkcert <指定的域名or IP>
```

## Docker Compose 路由轉發設置

{% note info flat no-icon %}
💡 範本可參考：https://github.com/SP12893678/traefik-ingress-example/tree/main/docker-compose
{% endnote %}

### Docker Compose 設置

```yaml
services:
  traefik:
    image: traefik:v2.10
    restart: unless-stopped
    command:
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --entrypoints.websecure.http.tls=true
      - --providers.docker=true
      - --providers.file.directory=/etc/traefik/dynamic
      - --providers.file.watch=true

    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./certs:/certs
      - ./dynamic:/etc/traefik/dynamic

  whoami:
    image: containous/whoami
    labels:
      - "traefik.http.routers.whoami.rule=Host(`whoami.traefik.me`)"
      - "traefik.http.routers.whoami.entrypoints=websecure"
      - "traefik.http.routers.whoami.tls=true"
```

{% note info flat no-icon %}
**Entrypoints**

- `web`：對應 **HTTP**（port 80）
- `websecure`：對應 **HTTPS**（port 443），並啟用 **TLS**

**Providers**

Traefik 支援多種服務提供者（Providers），這裡我們啟用了兩種：

- `docker`：從其他 container 的 `labels` 自動讀取路由規則
- `file`：從指定目錄（如 `dynamic/`）讀取設定（可用來定義 TLS 憑證、middlewares 等）

**Volume 掛載**

- `certs/`：存放 `mkcert` 產生的憑證檔（`.pem`, `.key`）
- `dynamic/`：靜態設定檔（例如 `tls.yml`），由 file provider 掃描
{% endnote %}



#### Traefik labels 說明

`whoami` 是一個簡易測試服務，會回傳你的 IP 和一些請求資訊。
這段 label 設定了：訪問 `https://whoami.traefik.me` 時，請求會被 Traefik 接收並使用 TLS，然後轉發到 `whoami` 服務。


Traefik 透過 Docker container 的 `labels` 來設定路由（router），而 `traefik.http.routers` 是定義 HTTP 路由的核心設定。router 負責匹配符合條件的請求，並將請求導向指定的服務。

| Label 名稱 | 說明 |
| --- | --- |
| `traefik.http.routers.<router_name>.rule` | 定義如何匹配請求（如 Host、Path）例：`Host(`whoami.traefik.me`)` |
| `traefik.http.routers.<router_name>.entrypoints` | 指定此路由對應的入口點，如 `web`, `websecure` |
| `traefik.http.routers.<router_name>.tls` | 若設為 `true`，表示此路由會使用 TLS |

{% note info flat no-icon %}
詳細設置參考: [Traefik Docker Routing Documentation - Traefik](https://doc.traefik.io/traefik/routing/providers/docker/)

{% endnote %}


### **建立TLS secret憑證**

使用 `mkcert` 建立本地的自簽憑證，讓我們可以在本機使用 HTTPS 加密存取 `whoami.traefik.me`

```yaml
mkcert whoami.traefik.me
```

會產生兩個檔案：

- `whoami.traefik.me.pem`（憑證）
- `whoami.traefik.me-key.pem`（私鑰）

請將這兩個檔案放入 `certs/` 目錄中。

### 設置Traefik需要讀取 TLS設定

建立 `dynamic/tls.yml` 檔案，內容如下，讓 Traefik 知道要使用剛剛產生的憑證：

```yaml
tls:
  certificates:
    - certFile: /certs/whoami.traefik.me.pem
      keyFile: /certs/whoami.traefik.me-key.pem
```

這個檔案會透過 `docker-compose.yml` 中的 volume 掛載進 `/etc/traefik/dynamic`，由 `--providers.file.directory` 指定的位置載入。只要 Traefik 有啟用 `--providers.file.watch=true`，變更會自動套用。

### 啟動服務

```yaml
docker compose up -d
```

原則上，服務啟動後，whoami.traefik.me就可以查看到whoami提供的相關資訊

## Kubernetes Ingress 路由轉發設置

在下面的環節中，打算安裝**Prometheus stack**，並將`http://grafana.traefik.me` 導到 `grafana`服務上

社群維護的 [`kube-prometheus-stack`](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)，提供Helm方式快速安裝Prometheus、Grafana等可觀測性服務。

### Kind設置

建立 kind-config.yml

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
      - containerPort: 443
        hostPort: 443
```

這段設定會讓 `kind` 建立的本地 Kubernetes cluster 能夠將本機的 80（HTTP）與 443（HTTPS）port 映射到 container 的對應 port，這樣才能用 `localhost` 或 `*.traefik.me` 這種本地測試域名直接訪問服務。

### 建立Cluster

```bash
kind create cluster --name demo --config kind-config.yml 
```

### **安裝 Traefik stack**

Helm 安裝 Traefik，並透過 `hostPort` 將 Traefik 的 `web`（80）與 `websecure`（443） entrypoint 暴露到本機網路中，對應前面 Kind 的 port mapping。這樣才可以讓我們訪問 `http://grafana.traefik.me` 等網址時，自動進入 Traefik 處理路由邏輯。

```bash
helm repo add traefik https://traefik.github.io/charts
helm repo update

helm install traefik traefik/traefik \
  --namespace=traefik --create-namespace \
  --set service.type=ClusterIP \
  --set ports.web.hostPort=80 \
  --set ports.websecure.hostPort=443 \
  --set ports.web.expose.enabled=true \
  --set ports.websecure.expose.enabled=true
```

### **安裝 Prometheus stack**

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

### **建立TLS secret**

使用 `mkcert` 建立本地的自簽憑證，提供設置Ingress所需的憑證來源

並透過 `kubectl create secret tls` 將憑證等機密資訊存放在Secret，待Ingress物件讀取 

```bash
mkcert grafana.traefik.me

kubectl create secret tls grafana-cert-secret \
  --cert=grafana.traefik.me.pem \
  --key=grafana.traefik.me-key.pem \
  -n monitoring
```

### Ingress設置

```yaml
# grafana-ingress.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: grafana-ingress
  namespace: monitoring
  annotations:
    kubernetes.io/ingress.class: traefik
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
    traefik.ingress.kubernetes.io/router.tls: 'true'
spec:
  ingressClassName: traefik
  tls:
    - hosts:
        - grafana.traefik.me
      secretName: grafana-cert-secret
  rules:
    - host: grafana.traefik.me
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: prometheus-grafana
                port:
                  number: 80
```

使用 Kubernetes 原生的 Ingress 物件來設定路由轉發規則，透過以下設定：

- `annotations.traefik.ingress.kubernetes.io/router.entrypoints: websecure`
    
    表示這條路由透過 HTTPS (`websecure`) entrypoint 處理。
    
- `annotations.traefik.ingress.kubernetes.io/router.tls: 'true'`
    
    要求使用 TLS（HTTPS）協定處理。
    
- `spec.rules.host` 與 `spec.tls.hosts` 都設為 `grafana.traefik.me`
    
    讓 Traefik 根據 Hostname 來比對請求，並綁定先前建立的憑證 Secret。
    

最終，Ingress 設定會將使用 `https://grafana.traefik.me` 的請求轉發給 `prometheus-grafana` service。

### 執行建立Ingress

```bash
kubectl apply -f grafana-ingress.yml
```

### Traefik的CRD IngressRoute設置

Traefik 提供一種更彈性的方式來設定路由，叫做 `IngressRoute`。和原生 Ingress 相比，IngressRoute 支援更多條件、組合邏輯與中介處理（middleware）設定。

```yaml
# grafana-ingress-route.yml
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: grafana-ingressroute
  namespace: monitoring
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(`grafana.traefik.me`) && PathPrefix(`/`)
      kind: Rule
      services:
        - name: prometheus-grafana
          port: 80
  tls:
    secretName: grafana-cert-secret
```

設定和前面的 Ingress 類似：

- `entryPoints` 指定進入點為 `websecure`（HTTPS）
- `routes.match` 使用 Host 與 PathPrefix 組合邏輯
- `services` 指定後端服務與對應 port
- `tls.secretName` 指定要使用的憑證 Secret

### 執行建立Ingress Route

```bash
kubectl apply -f grafana-ingress-route.yml
```

原則上，http://grafana.traefik.me/ 就可以成功查看到架設的 grafana服務了