/**
 * 課程資料的型別定義。
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

export interface Boss {
  name: string;
  hp: number;
  intro: string;
  questions: Question[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  /** 需要先破關的 courseId；null 代表一開始就解鎖 */
  requires: string | null;
  mobs: Mob[];
  boss: Boss;
}

export type EncounterType = "mob" | "boss";

export interface CourseProgress {
  mobsCleared: string[];
  bossCleared: boolean;
}

export type Progress = Record<string, CourseProgress>;
