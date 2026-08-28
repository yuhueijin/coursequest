import { getMaxHpForLevel } from "./courses";
import type { Course, CourseProgress, Progress, SaveData, StageProgress } from "./types";

// v4：玩家血量改成全域持續累積的資源（跨章節、跨課程共用一條血條，
// 只有休息處能回滿），存檔格式跟 v3（沒有 player 欄位）不相容，
// 所以換一把新的 key，舊存檔就自然作廢，不用寫遷移邏輯。
const SAVE_KEY = "coursequest_save_v4";

function emptySaveData(): SaveData {
  return { courses: {}, player: { hp: getMaxHpForLevel(1) } };
}

/** 讀取存檔；在伺服器端渲染（無 window）時直接回傳預設值（滿血、無進度） */
export function loadSave(): SaveData {
  if (typeof window === "undefined") return emptySaveData();
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      return {
        courses: parsed.courses ?? {},
        player: { hp: parsed.player?.hp ?? getMaxHpForLevel(1) },
      };
    }
  } catch (e) {
    console.warn("讀取存檔失敗", e);
  }
  return emptySaveData();
}

export function saveSaveData(data: SaveData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
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
