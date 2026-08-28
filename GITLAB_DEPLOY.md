# 部署到公司內部 GitLab

這份文件說明把這個 repo 搬到公司內部 GitLab 後，怎麼讓它像現在的 GitHub
Pages 一樣，推上去就自動有一個可以直接打開的網址（GitLab Pages）。

## 前置需求（要先跟 GitLab 管理員確認）

GitLab Pages 是**整個 GitLab 執行個體**要先啟用的功能，不是專案自己打開
一個開關就好——這通常是管理員在 `gitlab.rb`（Omnibus 安裝）或 Helm
values（Kubernetes 安裝）裡設定 `pages_external_url` 之類的參數，並且準備
一個對應的網域（例如 `*.pages.company.internal`）。

在公司內部、對外不開放的 GitLab 環境，這個功能**不一定有裝**。動手之前，
建議先確認兩件事：

1. 這個 GitLab 執行個體有沒有啟用 Pages（可以直接問管理員，或試著在任一個
   有 Pages 的專案裡看 **Settings → Pages** 這個選單存不存在）。
2. 如果有，Pages 的網址是用什麼網域（例如
   `https://<群組>.pages.company.internal/<專案名稱>/`）。

如果最後確認沒有啟用 Pages，`.gitlab-ci.yml` 這個 pipeline 還是會照常跑完、
建置出靜態檔案，只是不會有對外的網址——這時候可以參考文末的
[沒有 GitLab Pages 怎麼辦](#沒有-gitlab-pages-怎麼辦) 章節。

## 這次改了什麼、為什麼

這個專案本來就是純靜態網站（`next.config.ts` 裡的 `output: "export"`），
只是先前只設定給 GitHub Pages 用。這次做的調整讓同一份程式碼可以**同時**
部署到 GitHub Pages 和 GitLab Pages，兩邊互不影響：

- **[next.config.ts](next.config.ts)**：原本用 `GITHUB_PAGES=true` 這個
  只認 GitHub 的環境變數、把子路徑寫死成 `/coursequest`。現在改成讀取
  通用的 `BASE_PATH` 環境變數，值由各自的部署腳本帶入，`next.config.ts`
  本身不用因為換部署平台而修改。
- **[.github/workflows/deploy.yml](.github/workflows/deploy.yml)**：
  對應改成帶入 `BASE_PATH: /coursequest`，行為跟以前完全一樣。
- **[.gitlab-ci.yml](.gitlab-ci.yml)**：新增的 GitLab CI/CD 設定檔，
  推到 GitLab 後會自動跑（見下方「怎麼跑起來」）。

## 怎麼跑起來

1. 把這個 repo 推到公司內部 GitLab 上的專案（不管是新建專案還是既有的都
   可以，`.gitlab-ci.yml` 已經在 repo 裡了，不用額外設定 CI/CD 變數）。
2. 進 GitLab 專案的 **CI/CD → Pipelines**，確認 `pages` 這個 job 有跑、
   而且是綠色（成功）。第一次跑可能要幾分鐘（要下載 npm 套件）。
3. pipeline 成功後，進 **Settings → Pages**，那裡會列出這個專案的 Pages
   網址；點進去就是跑起來的網站。
4. 之後每次 push 到預設分支（`main`），pipeline 會自動重新建置、重新
   部署，不用手動做任何事，跟現在 GitHub 那邊的行為一樣。

## 網址規則

GitLab Pages 專案頁面的網址規則是
`https://<群組/命名空間>.<Pages 網域>/<專案名稱>/`。`.gitlab-ci.yml`
裡用 GitLab 內建的 `$CI_PROJECT_NAME` 變數動態組出這個子路徑
（`BASE_PATH="/${CI_PROJECT_NAME}"`），所以**不管這個專案在內部 GitLab
上取什麼名字，子路徑都會自動對上，不用手動改設定檔**。

（唯一例外：如果專案名稱剛好取成 `<命名空間>.<Pages 網域>` 這種特殊格式，
GitLab 會把它當成「根網域頁面」發佈在網域根目錄、不帶子路徑——這種情況下
`BASE_PATH` 應該設為空字串。一般專案不會遇到這個狀況，先不用特別處理。）

## 除錯

- **pipeline 是綠的，但 Settings → Pages 沒有網址、或網址打不開**：多半是
  這個 GitLab 執行個體本身沒啟用 Pages 功能，回頭找管理員確認，見前面的
  「前置需求」。
- **頁面打得開，但畫面空白、或 CSS／圖示跑掉**：通常是 `BASE_PATH` 沒對上
  實際網址的子路徑。打開瀏覽器開發者工具的 Network 分頁，看被擋掉
  （404）的資源網址長怎樣，跟網址列的路徑對一下。
- **pipeline 直接失敗在 `npm ci` 或 `npm run build`**：先看 job log 的
  錯誤訊息；常見原因是 GitLab Runner 沒有對外網路（連不到 npm registry），
  這種情況要請管理員確認 Runner 的網路設定或改用內部鏡像。

## 沒有 GitLab Pages 怎麼辦

如果最後確認這個 GitLab 執行個體沒有裝 Pages 功能，還是可以照樣拿到建置
好的靜態網站，只是不會有 GitLab 自動生成的網址：

1. pipeline 成功後，進 **CI/CD → Pipelines** 點進那次 pipeline，`pages`
   job 右側有 **Download artifacts**，下載下來會是一個 `public/` 資料夾。
2. 把 `public/` 資料夾放到任何內部的靜態檔案伺服器（Nginx、Apache，或
   臨時用 `npx serve public` 在本機跑起來看）即可，不需要 Node.js 執行
   環境，因為裡面已經是純 HTML/CSS/JS。

## GitHub / GitLab 可以同時維持嗎？

可以。[.github/workflows/deploy.yml](.github/workflows/deploy.yml) 只有
推到 GitHub 才會跑，[.gitlab-ci.yml](.gitlab-ci.yml) 只有推到 GitLab 才會
跑，兩份設定檔互相獨立，共用同一份 `next.config.ts`，不用兩邊擇一。
