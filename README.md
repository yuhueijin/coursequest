# 課程冒險 CourseQuest

把課程變成關卡、把知識變成招式的文字冒險學習遊戲。

- **課程** = 大魔王關卡
- **小怪** = 學習小節（先教一段觀念，再用問答當攻擊）
- **大魔王戰** = 綜合測驗，答對造成傷害、答錯被反擊

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

## 專案結構

```
app/                  Next.js 路由（layout、page、全域樣式）
components/
  Game.tsx            遊戲引擎：畫面狀態機、戰鬥邏輯、存檔
  HpBar.tsx            血條元件
  screens/            各畫面（開始、選課程、教學、Boss 介紹、戰鬥、結算、通關）
lib/
  types.ts            課程資料型別
  courses.ts          課程內容資料（★ 加新課程只改這個檔案）
  progress.ts         localStorage 存讀檔工具
vanilla-prototype/    最初的純 HTML/CSS/JS 原型（保留參考，未串接）
```

## 加新課程

只要在 `lib/courses.ts` 的 `COURSES` 陣列新增一個物件即可，型別見 `lib/types.ts`，不用碰 `components/` 底下的任何程式碼。
