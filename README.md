# 課程冒險 CourseQuest

把課程變成關卡、把知識變成招式的文字冒險學習遊戲。

🎮 **線上直接玩：https://yuhueijin.github.io/coursequest/**

- **課程** = 一個大主題，底下分好幾個**關卡**
- **關卡** = 先打幾隻小怪（學習小節），再打這個關卡的小魔王（綜合考驗）；打贏
  小魔王就完成這個關卡，直接**回到關卡選擇畫面**拿卡片，不會連續逼你一直打
  下一關。卡片不需要另外取招式名，卡面就是這個關卡的標題
- **角色等級** = 兩門課程共用，每拿一張卡片升一級，等級決定哪些關卡解鎖；
  等級足夠的關卡之間可以任意順序挑戰
- **血量（HP）** = 兩門課程共用同一條血量，每次升級上限都會提高（等級越高血量
  上限越多）；小怪／小魔王答錯或大魔王反擊都會扣血，血量歸零後**任何關卡、
  任何大魔王都無法挑戰**，畫面會提示先去休息處回血
- **卡片** = 每完成一個關卡就會拿到一張，當作最終大魔王戰的手牌
- **徽章** = 跟卡片是分開的收集品，**完成一整門課程**（打贏最終大魔王）才會
  獲得一枚，一門課程只有一枚；主畫面有專屬的徽章清單可以查看已獲得哪些
- **大魔王** = 全部關卡都拿到卡片後才解鎖的最終試煉：牠依序出題，玩家要從
  收集到的卡片手牌中選一張回答，每張卡都附**精準的說明文字**，讓玩家能直接
  對應題目選出正確的卡，不只是籠統的分類；答對造成傷害、答錯被反擊。魔王的
  擊倒條件分兩種：
  - 「機關性騷擾防治研習」的魔王要五題**全部答對**才會被打倒；
  - 「職場霸凌防治研習」的魔王只要答對其中 **4/5 題**就能提前擊倒
- **休息處** = 每門課程都有，血量歸零時可以進去看部相關影片，回血到滿再出發

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
  HomeButton.tsx       每個畫面都有的「回主畫面」按鈕
  AdventureProgressBar.tsx  單一關卡自己的闖關進度條
  screens/
    CourseSelectScreen.tsx  選課程（顯示卡片彙總、是否已通關）
    StageSelectScreen.tsx   選關卡（等級解鎖、休息處、大魔王入口）
    LessonScreen / BossIntroScreen / BattleScreen / EncounterResultScreen
    CardBossScreen.tsx      大魔王卡牌戰（魔王出題，手牌選卡作答）
    RestScreen.tsx          休息處（YouTube 影片、回血到滿）
    CourseClearScreen.tsx
    BadgeListScreen.tsx     徽章清單（每門課程一枚，完成整門課程才會拿到）
lib/
  types.ts            課程／關卡／卡片／存檔的型別定義
  courses.ts          課程內容資料（★ 加新課程只改這個檔案）＋關卡推進、
                       等級解鎖、卡片與徽章統計等邏輯
  progress.ts         localStorage 存讀檔工具
vanilla-prototype/    最初的純 HTML/CSS/JS 原型（保留參考，未串接）
```

## 加新課程

只要在 `lib/courses.ts` 的 `COURSES` 陣列新增一個物件即可：一個 Course 底下有多個
`Stage`（關卡，各自有 `requiredLevel` 決定幾級解鎖），每個關卡有 `mobs[]` + `miniBoss` +
`card`（打贏小魔王、完成這個關卡後獲得的卡片，含 `icon`、`description`——卡面直接顯示
關卡的 `title`，不用另外幫招式取名字；`description` 要精準到玩家看了大魔王的題目就能
直接對應選出這張卡，不能只是籠統的分類說明），課程結尾再加一個 `finalBoss`，其
`questions[]` 每題用 `correctStageId` 指定哪張卡是正解、數量要跟關卡數一致（一張卡對
一題）；`requiredCorrect` 決定要答對幾題才會被打倒——設成跟題數相同就是「全部要對」，
設成比題數少就是「部分對就能提前擊倒」。另外要補一個 `restStopVideoId`（YouTube 影片
ID）。角色血量上限由 `getMaxHpForLevel()` 依等級計算，全域共用、存在 `SaveData.player.hp`，
不用逐課程另外設定。徽章（`getBadges()`）是完成整門課程才會獲得的成就，跟卡片是分開
的兩種收集品，不需要額外設定，會依 `finalBossCleared` 自動判斷。型別見 `lib/types.ts`，
不用碰 `components/` 底下的任何程式碼。
