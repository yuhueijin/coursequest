import type { Course, CourseProgress, Progress, StageProgress } from "./types";

// v3：拿掉裝備／技能／經驗值系統，改成過關拿徽章＋卡牌大魔王，
// 存檔格式跟 v2（含 player.xp / equippedSkillId）不相容，
// 所以換一把新的 key，舊存檔就自然作廢，不用寫遷移邏輯。
const SAVE_KEY = "coursequest_progress_v3";

/** 讀取存檔；在伺服器端渲染（無 window）時直接回傳空物件 */
export function loadProgress(): Progress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw) as Progress;
  } catch (e) {
    console.warn("讀取存檔失敗", e);
  }
  return {};
}

export function saveProgress(progress: Progress): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
}

export function getCourseProgress(progress: Progress, courseId: string): CourseProgress {
  return progress[courseId] ?? { stages: {}, finalBossCleared: false };
}

export function getStageProgressById(cp: CourseProgress, stageId: string): StageProgress {
  return cp.stages[stageId] ?? { mobsCleared: [], miniBossCleared: false };
}

export function isCourseUnlocked(progress: Progress, course: Course): boolean {
  if (!course.requires) return true;
  return !!progress[course.requires]?.finalBossCleared;
}
