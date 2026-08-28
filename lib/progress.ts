import type { Course, CourseProgress, SaveData, StageProgress } from "./types";

// v2：課程結構改成 Stage + 小魔王 + 大魔王，存檔格式跟 v1（單純 mobs+boss）不相容，
// 所以換一把新的 key，舊存檔就自然作廢，不用寫遷移邏輯。
const SAVE_KEY = "coursequest_save_v2";

function emptySaveData(): SaveData {
  return { courses: {}, player: { xp: 0, equippedSkillId: null } };
}

/** 讀取存檔；在伺服器端渲染（無 window）時直接回傳空存檔 */
export function loadSave(): SaveData {
  if (typeof window === "undefined") return emptySaveData();
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      return {
        courses: parsed.courses ?? {},
        player: {
          xp: parsed.player?.xp ?? 0,
          equippedSkillId: parsed.player?.equippedSkillId ?? null,
        },
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

export function getCourseProgress(save: SaveData, courseId: string): CourseProgress {
  return save.courses[courseId] ?? { stages: {}, finalBossCleared: false };
}

export function getStageProgressById(cp: CourseProgress, stageId: string): StageProgress {
  return cp.stages[stageId] ?? { mobsCleared: [], miniBossCleared: false };
}

export function isCourseUnlocked(save: SaveData, course: Course): boolean {
  if (!course.requires) return true;
  return !!save.courses[course.requires]?.finalBossCleared;
}
