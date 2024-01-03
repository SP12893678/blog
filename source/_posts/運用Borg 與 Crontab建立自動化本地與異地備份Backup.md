title: 運用Borg 與 Crontab建立自動化本地與異地備份Backup
description: 

categories:
  - Linux
tags:
  - Linux
  - Backup
  - Disaster Recovery

keywords: borg, crontab, backup, restore
date: 2023-5-16 12:00:00
copyright_info: 此文章版權歸JUN-HONG所有，如有轉載，請註明來自原作者

cover: https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/banner_borg-crontab-automatic-backup.png
---

## 前言
當架設後端服務時，伺服器通常會隨著時間儲存了許多使用者的資料(圖片、影片等等)。然而若沒有本地備份與異地備份，當發生意外刪除或者磁碟損壞時，使用者的重要資料也就無法恢復了。因此定時備份為一種災難恢復(disaster recovery)的方式。

Borg是一種備份工具，他提供增量備份、去除重複壓縮與加密等功能。

Crontab是一個在Unix操作系統上用於定期執行任務的工具，透過設置任務方式，使其在預定時間或間隔自動執行指令或腳本


## 實作重點

- 環境準備
    - 安裝Borg
- 本地端 - 備份方法
    - 初始化備份資料的存放區
    - 建立備份歸檔
    - 列出歸檔清單
    - 修剪備份存檔
- 異地端 - 備份方法
    - 初始化備份資料的存放區
    - 建立備份歸檔
    - 透過金鑰授權，避免每次輸入異地機器的密碼方式
- 自動化備份
    - 建立備份腳本Shell script
    - 設定Crontab定時任務
- 其他備份指令介紹
    - 比較歸檔差異性
    - 恢復資料

## 環境準備

### 安裝Borg
這邊使用的是borg1.2.2版本
```bash
wget -q --show-progress https://github.com/borgbackup/borg/releases/download/1.2.2/borg-linuxold64

wget -q --show-progress https://github.com/borgbackup/borg/releases/download/1.2.2/borg-linuxold64.asc

# 驗證來源
gpg --verify borg-linuxold64.asc

# 將備份工具放置環境中
sudo cp borg-linuxold64 /usr/local/bin/borg

# 更改所有權
sudo chown root:root /usr/local/bin/borg

# 更改權限，使一般使用者可使用
sudo chmod 755 /usr/local/bin/borg

# 查看borg版本, 確認有無安裝成功
borg -V
```
{% note info flat %}
若有其他需求亦可在borg的Github repo找需要的版本：
https://github.com/borgbackup/borg
{% endnote %}

## 本地端 - 備份方法
### 初始化備份資料的存放區
一開始要設定想要備份在哪個目錄底下，初始化時會設定-e參數的加密方式，指令質性後會要求填寫passphrase，這是之後執行這個項備份相關任務時需要的密語
```bash
borg init -e repokey <備份資料存放的目錄>
# 舉例
borg init -e repokey ~/my_backup
```

### 建立備份歸檔
假設我們想要將專案的圖片目錄備份至上述初始化好的備份區中，可以執行下方指令
```bash
borg create --stats --progress --compression <壓縮形式> <備份區>::<標籤> <想要備份的資料目錄>
# 舉例
borg create --stats --progress --compression lz4  ~/my_backup::2023_02_22_0219 ~/my_project/assets
```

{% note info flat %}
💡參數介紹
--stats：列印已創建存檔的統計資訊
--progress：顯示目前建立備份的進度
--compression：壓縮形式
{% endnote %}

{% note warning flat %}
💡壓縮選項包含以下選項：
• lz4：壓縮速度快，但壓縮率較低，適合需要快速備份和恢復的情境
• zstd：可調節壓縮級別的選項，可以適需求客製化
• zlib：壓縮速度與壓縮率中等
• lzma：壓縮速度慢，但壓縮率較高，備份與恢復速度較慢
{% endnote %}

如下圖顯示建立備份後的資訊，如原本資料大小、壓縮後大小、去除重複資料大小
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/borg-create.jpg)


### 列出歸檔清單

經過一次或數次備份後，若想查看目前備份區中有多少個備份紀錄，可使用以下指令查看備份歸檔清單

```bash
borg list <備份資料存放的目錄>
# 舉例
borg list ~/my_backup
```
如下圖顯示目前的歸檔清單
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/borg-list.jpg)


### 修剪備份存檔
如果一天備份2次，那365天就備份730次，這將導致備份檔案膨脹。其實過了一年我們需要的可能是過往每週一份或每月一份即可，因此可使用修剪方法
```bash
borg prune -v --list --keep-daily=<日級別保留數> --keep-weekly=<周級別保留數> --keep-monthly=<月份級別保留數> --keep-yearly=<年度保留數> <備份目錄>

# 舉例
borg prune -v --list --keep-daily=14 --keep-monthly=6 --keep-yearly=1 /backup/my-project
```
{% note info flat %}
💡參數介紹
-v, --verbose：會列印出詳細的操作資料
--keep-daily：保留近期N個每日備份
--keep-weekly：保留近期N個每周備份
--keep-monthly：保留近期N個每月備份
--keep-yearly：保留近期N個每年備份
{% endnote %}

這是官方的例子。若經過一年，會保留以下日期的備份
```bash
List view
---------

--keep-daily 14     --keep-monthly 6     --keep-yearly 1
----------------------------------------------------------------
 1. 2015-12-31       (2015-12-31 kept     (2015-12-31 kept
 2. 2015-12-30        by daily rule)       by daily rule)
 3. 2015-12-29       1. 2015-11-30        1. 2015-01-01 (oldest)
 4. 2015-12-28       2. 2015-10-31
 5. 2015-12-27       3. 2015-09-30
 6. 2015-12-26       4. 2015-08-31
 7. 2015-12-25       5. 2015-07-31
 8. 2015-12-24       6. 2015-06-30
 9. 2015-12-23
10. 2015-12-22
11. 2015-12-21
12. 2015-12-20
    (no backup made on 2015-12-19)
13. 2015-12-18
14. 2015-12-17
```

## 異地端 - 備份方法
異地與本地備份不同處在於

- 輸入備份區的目錄會是ssh://username@remote_ip/<指定的路徑>
- 每次備份需要輸入異地登入的密碼，因為每次都使用ssh連線
- 使用前，異地端需要安裝borg

輸入上多一點前面的連線資訊而已，試著做做看吧
### 初始化備份資料的存放區
```bash
borg init -e repokey ssh://username@remote_ip/<備份資料存放的目錄>
# 舉例
borg init -e repokey ssh://username@remote_ip/~/my_backup
```


### 建立備份歸檔
假設我們想要將專案的圖片目錄備份至上述初始化好的備份區中，可以執行下方指令
```bash
borg create --stats --progress --compression <壓縮形式> <備份區>::<標籤> ssh://username@remote_ip/<備份資料存放的目錄>
# 舉例
borg create --stats --progress --compression lz4  ssh://username@remote_ip/~/my_backup::2023_02_22_0219 ~/my_project/assets
```

### 透過金鑰授權，避免每次輸入異地機器的密碼方式
透過上述實作會發現每次備份都需要輸入登入的密碼，以下透過金鑰授權來省略此步驟
另外若要實施自動化備份必然不能有手動輸入密碼的步驟

#### 建立ssh key
下方指令將產生一組ssh key，會有一些問答互動，基本上默認即可 (若要更安全點, 可以設置)

建立後的金鑰位置會在你當前使用者的家目錄/.ssh目錄底下
```bash
ssh-keygen
```

#### 使用ssh-copy-id方式授予遠端伺服器金鑰
ssh-copy-id可以跟遠端伺服器說這個金鑰是以後登入用的, 而遠端伺服器就會將此金鑰寫入至authorized_keys檔案中
authorized_keys檔案紀錄可以存取的使用者公開金鑰
輸入以下指令後，會要求輸入遠端登入密碼，確認你有權限登入
若成功會提示說可以用 ssh username@remote_ip  方式登入，而且無須輸入密碼
```bash
ssh-copy-id username@remote_ip 
```

#### 使用ssh登入確認可無密碼輸入登入
```bash
ssh username@remote_ip
```
{% note info flat %}
若伺服器未安裝openssh-server需安裝
{% endnote %}

## 自動化備份
在Linux上我們可以應用crontab設置定時任務來達到自動化的效果

在這之前，borg github repo上有給予一個自動化備份的sample shell script
https://github.com/borgbackup/borg/blob/master/docs/quickstart.rst
這個shell script可以分為幾點來看

1. 備份區目錄設定：borg透過環境變數方式，只要設定好BORG_REPO就可以省去操作指令時的輸入
2. 備份區密語設定：borg透過環境變數方式，只要設定好BORG_PASSPHRASE就可以省去需要輸入密語的步驟
3. 備份建立指令：就是我們主要的備份動作
4. 備份歸檔剪枝指令：每次備份完後，可以進行剪枝來縮減備份占用的空間
5. 備份壓縮指令：可以當作是優化儲存壓縮的空間，將重複的資料重新組織達到更好的壓縮與儲存效果

```shell
#!/bin/sh

# Setting this, so the repo does not need to be given on the commandline:
export BORG_REPO=ssh://username@example.com:2022/~/backup/main

# See the section "Passphrase notes" for more infos.
export BORG_PASSPHRASE='XYZl0ngandsecurepa_55_phrasea&&123'

# some helpers and error handling:
info() { printf "\n%s %s\n\n" "$( date )" "$*" >&2; }
trap 'echo $( date ) Backup interrupted >&2; exit 2' INT TERM

info "Starting backup"

# Back up the most important directories into an archive named after
# the machine this script is currently running on:

borg create                         \
    --verbose                       \
    --filter AME                    \
    --list                          \
    --stats                         \
    --show-rc                       \
    --compression lz4               \
    --exclude-caches                \
    --exclude 'home/*/.cache/*'     \
    --exclude 'var/tmp/*'           \
                                    \
    ::'{hostname}-{now}'              \
    /etc                            \
    /home                           \
    /root                           \
    /var

backup_exit=$?

info "Pruning repository"

# Use the `prune` subcommand to maintain 7 daily, 4 weekly and 6 monthly
# archives of THIS machine. The '{hostname}-*' globbing is very important to
# limit prune's operation to this machine's archives and not apply to
# other machines' archives also:

borg prune                              \
    --list                              \
    --glob-archives '{hostname}-*'  \
    --show-rc                           \
    --keep-daily    7                   \
    --keep-weekly   4                   \
    --keep-monthly  6

prune_exit=$?

# actually free repo disk space by compacting segments

info "Compacting repository"

borg compact

compact_exit=$?

# use highest exit code as global exit code
global_exit=$(( backup_exit > prune_exit ? backup_exit : prune_exit ))
global_exit=$(( compact_exit > global_exit ? compact_exit : global_exit ))

if [ ${global_exit} -eq 0 ]; then
    info "Backup, Prune, and Compact finished successfully"
elif [ ${global_exit} -eq 1 ]; then
    info "Backup, Prune, and/or Compact finished with warnings"
else
    info "Backup, Prune, and/or Compact finished with errors"
fi

exit ${global_exit}
```

### 建立備份腳本Shell script
將以上程式碼貼上吧
```bash
nano ~/auto_backup.sh
```

{% note info flat %}
💡 程式碼中需更改部分有
1. BORG_REPO (需要填寫欲存放備份資料的目錄，也就是borg init的地方)
2. BORG_PASSPHRASE (需填寫borg init時的密語，這樣才有權限執行)
3. borg create 時需要的備份目錄路徑 (範例中是備份/home、/root、/var目錄)
4. borg prune 時需要的剪枝設定 (例如想要保留年份的備份)
{% endnote %}

### 設定Crontab定時任務
若我們希望每日23:30執行這個auto_backup.sh的話，如以下指令
```bash
30 23 * * * ~/auto_backup.sh >> ~/auto_backup.log 2>&1
```

{% note warning flat %}
💡 若要查看是否有順利備份可前往auto_backup.log查看，這邊的設置將備份的操作output到log檔案中，若有錯誤也可以看到

※ 2>&1 意思是把 標準錯誤輸出 重定向到 標準輸出
{% endnote %}


## 其他指令介紹
### 比較歸檔差異性
如果想知道A版跟B版多了什麼檔案或者少了甚麼檔案，可以使用已下指令了解
先寫的是基準, 如下標籤1是基準, 所以標籤2多檔案, 會顯示多了XX檔案
```bash
borg diff <備份資料存放的目錄>::<標籤1> <標籤2>
# 舉例
borg diff ~/my_backup::2023_02_22_0219 2023_02_23_0219
```
如下圖顯示比較歸檔差異性
![Untitled](https://cdn.jsdelivr.net/gh/sp12893678/blog@gh-pages/img/borg-diff.jpg)

### 恢復資料
如果因為意外因素導致，某些資料損壞無法讀取情形，此時可以考慮恢復過去資料

**※還原到當前目錄**
```bash
borg extract <備份資料存放的目錄>::<標籤> 
# 舉例
borg extract ~/my_backup::2023_02_22_0219 
```

## 結語
本篇大致敘述了borg備份工具的使用，自動化異地備份使資料不會放在同一個籃子上而毀壞，大幅增加災難恢復的能力。此外，在災難恢復中有著2個關鍵的指標RTO (Recovery Time Objective, 復原時間目標)和RPO (Recovery Point Objective, 復原點目標)，期望復原點目標越近，備份的頻率就相對高，而期望復原時間目標越快則需要更快速的故障轉移(failover)策略。除了Backup and Restore，Pilot Light、Warm Standby、Multi-site亦是未來可研究的方向。
