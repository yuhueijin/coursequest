/**
 * 課程資料與存檔的型別定義。
 * 內容本身放在 lib/courses.ts，之後要加新課程只要照著這些型別寫資料，
 * 不用碰任何遊戲引擎 / UI 程式碼。
 */

export interface Question {
  /** 題目文字 */
  q: string;
  /** 選項列表 */
  options: string[];
  /** 正確答案在 options 中的索引 */
  answer: number;
  /** 不管答對答錯都會顯示的觀念說明，強化記憶 */
  explain: string;
}

export interface Lesson {
  title: string;
  content: string;
}

export interface Mob {
  id: string;
  name: string;
  hp: number;
  lesson: Lesson;
  questions: Question[];
}

/** 小魔王：每個 Stage 結尾的綜合考驗 */
export interface Boss {
  name: string;
  hp: number;
  intro: string;
  questions: Question[];
}

/**
 * 打贏一個關卡的小魔王、完成該關卡後獲得的卡片。卡面直接顯示所屬
 * 關卡的標題，不需要另外幫招式取名字。
 */
export interface StageCard {
  /** 卡面圖示（emoji），同時當作關卡選單的完成標記 */
  icon: string;
  /**
   * 卡面下方的說明，提示這張卡適合回答什麼類型的情境。要精準到玩家
   * 看了大魔王的題目就能直接對應選出這張卡，不能只是籠統的分類說明。
   */
  description: string;
}

/** 大魔王的其中一題：他出題，玩家要從手牌中選出對應這題的招式卡作答 */
export interface FinalBossQuestion {
  q: string;
  /** 哪個關卡的卡片才是這題的正解 */
  correctStageId: string;
  explain: string;
}

/** 一個關卡：先打幾隻小怪（學習小節），再打這個關卡的小魔王（綜合考驗） */
export interface Stage {
  id: string;
  title: string;
  description: string;
  /** 需要達到這個角色等級才能挑戰此關卡 */
  requiredLevel: number;
  mobs: Mob[];
  miniBoss: Boss;
  /** 通關這個關卡後獲得的卡片 */
  card: StageCard;
}

/**
 * 最終大魔王：他會依序出題，玩家要從收集到的招式卡（course.stages[].card）
 * 手牌中選一張回答；questions 的數量應與 stages 數量一致，一張卡對一題。
 */
export interface FinalBoss {
  name: string;
  hp: number;
  intro: string;
  questions: FinalBossQuestion[];
  /**
   * 需要答對幾題才會被打死，不一定要 questions.length（全部答對）。
   * 例如 5 題只設 4，代表答對其中任 4 題就能提前擊倒魔王，不用全對。
   */
  requiredCorrect: number;
}

/** BossIntroScreen 共用的最小資料形狀，小魔王與大魔王都符合 */
export interface BossFlavor {
  name: string;
  intro: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  /** 需要先破關的 courseId；null 代表一開始就解鎖 */
  requires: string | null;
  stages: Stage[];
  /** 全部 Stage 都過關後才能挑戰的最終大魔王 */
  finalBoss: FinalBoss;
  /** 休息處播放的 YouTube 影片 ID（網址 watch?v= 後面那段） */
  restStopVideoId: string;
}

export type EncounterKind = "mob" | "miniboss";

/** 目前正在挑戰的對象：一隻小怪、或某個 Stage 的小魔王 */
export interface EncounterRef {
  kind: EncounterKind;
  stageId: string;
  data: Mob | Boss;
}

export interface StageProgress {
  mobsCleared: string[];
  miniBossCleared: boolean;
}

export interface CourseProgress {
  /** key 是 Stage id */
  stages: Record<string, StageProgress>;
  finalBossCleared: boolean;
}

export type Progress = Record<string, CourseProgress>;

/** 玩家的持續性血量：跨關卡、跨課程共用同一條血條，只有休息處能回滿 */
export interface PlayerState {
  hp: number;
}

/** localStorage 存檔的完整內容 */
export interface SaveData {
  courses: Progress;
  player: PlayerState;
}
