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
  /** 答對時顯示的「招式名」 */
  moveName: string;
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

/** 打贏一個 Stage 的小魔王後獲得的「招式卡」，用在最終大魔王的卡牌戰中 */
export interface StageCard {
  /** 卡面顯示的招式名稱 */
  moveName: string;
  /** 卡面圖示（emoji） */
  icon: string;
  /** 打出這張卡時要回答的題目（最終試煉等級的綜合題） */
  question: Question;
}

/** 一個主題章節：先打幾隻小怪（學習小節），再打這個主題的小魔王（綜合考驗） */
export interface Stage {
  id: string;
  title: string;
  description: string;
  mobs: Mob[];
  miniBoss: Boss;
  /** 通關這個 Stage 後獲得的徽章／招式卡 */
  card: StageCard;
}

/** 最終大魔王：只有基本資料，題目來自玩家收集到的招式卡（course.stages[].card） */
export interface FinalBoss {
  name: string;
  hp: number;
  intro: string;
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
