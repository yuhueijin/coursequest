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

/** 小魔王（每個 Stage 結尾）與大魔王（整個課程結尾）共用同一種資料形狀 */
export interface Boss {
  name: string;
  hp: number;
  intro: string;
  questions: Question[];
}

/** 一個主題章節：先打幾隻小怪（學習小節），再打這個主題的小魔王（綜合考驗） */
export interface Stage {
  id: string;
  title: string;
  description: string;
  mobs: Mob[];
  miniBoss: Boss;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  /** 需要先破關的 courseId；null 代表一開始就解鎖 */
  requires: string | null;
  stages: Stage[];
  /** 全課程打完所有 Stage 後的最終考驗 */
  finalBoss: Boss;
}

export type EncounterKind = "mob" | "miniboss" | "boss";

/** 目前正在挑戰的對象：一隻小怪、某個 Stage 的小魔王、或課程的最終大魔王 */
export interface EncounterRef {
  kind: EncounterKind;
  /** 小魔王所屬的 Stage id；大魔王沒有對應的 Stage，為 null */
  stageId: string | null;
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

/** 技能：解鎖後可以在戰鬥中裝備，答對時提供額外傷害加成 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
  bonusPct: number;
}

export interface PlayerState {
  xp: number;
  equippedSkillId: string | null;
}

export interface SaveData {
  courses: Progress;
  player: PlayerState;
}
