# 課程冒險 CourseQuest

把課程變成關卡、把知識變成招式的文字冒險學習遊戲。

🎮 **線上直接玩：https://yuhueijin.github.io/coursequest/**

- **課程** = 一個大主題，底下分好幾個 **Stage（章節／小關卡）**，可以任意順序挑戰
- **小怪** = 學習小節（先教一段觀念，再用問答當攻擊）
- **小魔王** = 每個 Stage 結尾的綜合考驗，打贏拿到這個章節的**徽章／招式卡**
- **大魔王** = 全部 Stage 都拿到徽章後才解鎖的最終試煉，用收集到的招式卡**卡牌戰**——
  自由選一張卡出招，答對造成傷害、答錯被反擊，直到牌用完或分出勝負

目前內建兩門課程：
1. 「機關性騷擾防治研習」改編自行政院性別平等處《各機關性騷擾防治通用教材》，
   涵蓋性騷擾防治三法與跟蹤騷擾防制法。
2. 「職場霸凌防治研習」改編自《職場霸凌防治教育訓練－職安法相關規定說明》，
   依職業安全衛生法第22條之1編寫。

## 技術棧

Next.js（App Router）+ TypeScript + React，純前端、無後端依賴，進度用 `localStorage` 保存在瀏覽器。

## 開發

需要 Node.js 18.18+（建議 20 LTS，專案根目錄已附 `.nvmrc`）。

```bash
npm install
npm run dev
```

如果你用 [nvm](https://github.com/nvm-sh/nvm) 管理 Node 版本，也可以直接跑 `./scripts/dev.sh`，會自動切到 `.nvmrc` 指定的版本再啟動。

打開 http://localhost:3000

## 部署

這個專案是純前端（沒有伺服器功能），用 `output: "export"` 打包成靜態檔案，
透過 [.github/workflows/deploy.yml](.github/workflows/deploy.yml) 在每次 push 到
`main` 時自動建置並部署到 **GitHub Pages**。

本機也可以自己模擬打包＋預覽：

```bash
GITHUB_PAGES=true npm run build   # 輸出到 out/，路徑會加上 /coursequest 前綴
npm run start                     # 用 serve 在本機預覽 out/ 的結果
```

## 專案結構

```
app/                  Next.js 路由（layout、page、全域樣式）
components/
  Game.tsx            遊戲引擎：畫面狀態機、戰鬥邏輯、存檔
  HpBar.tsx            血條元件
  AdventureProgressBar.tsx  闖關過程的整體進度條
  screens/
    CourseSelectScreen.tsx  選課程（顯示徽章彙總）
    StageSelectScreen.tsx   選章節（自由挑選、大魔王解鎖判斷）
    LessonScreen / BossIntroScreen / BattleScreen / EncounterResultScreen
    CardBossScreen.tsx      大魔王卡牌戰
    CourseClearScreen.tsx
lib/
  types.ts            課程／Stage／招式卡／存檔的型別定義
  courses.ts          課程內容資料（★ 加新課程只改這個檔案）＋關卡推進邏輯
  progress.ts         localStorage 存讀檔工具
vanilla-prototype/    最初的純 HTML/CSS/JS 原型（保留參考，未串接）
```

## 加新課程

只要在 `lib/courses.ts` 的 `COURSES` 陣列新增一個物件即可：一個 Course 底下有多個
`Stage`（可任意順序挑戰），每個 Stage 有 `mobs[]` + `miniBoss` + `card`（打贏小魔王
拿到的招式卡，也是最終大魔王卡牌戰要用的那張卡），課程結尾再加一個沒有題目、只有
基本資料的 `finalBoss`。型別見 `lib/types.ts`，不用碰 `components/` 底下的任何程式碼。
