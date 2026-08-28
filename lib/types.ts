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

/** 挑戰：每個 Stage 結尾的綜合考驗 */
export interface Boss {
  name: string;
  hp: number;
  intro: string;
  questions: Question[];
}

/**
 * 完成一個關卡的挑戰後獲得的卡片。卡面直接顯示所屬關卡的標題，
 * 不需要另外幫招式取名字。
 */
export interface StageCard {
  /** 卡面圖示（emoji），同時當作關卡選單的完成標記 */
  icon: string;
  /**
   * 卡面下方的說明。因為一張卡在終極挑戰裡固定對應一題（見
   * FinalBossQuestion.correctStageId），這裡要直接寫出那一題的答案本身，
   * 而不是籠統的分類說明；答案內容要跟題目一一對應，讓玩家一眼就能
   * 分辨該選哪一張卡，不用用猜的。
   */
  description: string;
}

/** 終極挑戰的其中一題：對手出題，玩家要從手牌中選出對應這題的卡片作答 */
export interface FinalBossQuestion {
  q: string;
  /** 哪個關卡的卡片才是這題的正解 */
  correctStageId: string;
  explain: string;
}

/** 一個關卡：先做幾個訓練（學習小節），再進行這個關卡的挑戰（綜合考驗） */
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
 * 終極挑戰：依序出題，玩家要從收集到的卡片（course.stages[].card）
 * 手牌中選一張回答；questions 的數量應與 stages 數量一致，一張卡對一題。
 */
export interface FinalBoss {
  name: string;
  hp: number;
  intro: string;
  questions: FinalBossQuestion[];
  /**
   * 需要答對幾題才會過關，不一定要 questions.length（全部答對）。
   * 例如 5 題只設 4，代表答對其中任 4 題就能提前過關，不用全對。
   */
  requiredCorrect: number;
}

/** BossIntroScreen 共用的最小資料形狀，關卡挑戰與終極挑戰都符合 */
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
  /** 全部 Stage 都過關後才能進行的終極挑戰 */
  finalBoss: FinalBoss;
  /** 休息處播放的 YouTube 影片 ID（網址 watch?v= 後面那段） */
  restStopVideoId: string;
}

export type EncounterKind = "mob" | "miniboss";

/** 目前正在挑戰的對象：一個訓練、或某個 Stage 的挑戰 */
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
