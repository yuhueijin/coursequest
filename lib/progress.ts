import type { Course, CourseProgress, Progress } from "./types";

const SAVE_KEY = "coursequest_progress_v1";

function emptyCourseProgress(): CourseProgress {
  return { mobsCleared: [], bossCleared: false };
}

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
  return progress[courseId] ?? emptyCourseProgress();
}

export function isCourseUnlocked(progress: Progress, course: Course): boolean {
  if (!course.requires) return true;
  return !!progress[course.requires]?.bossCleared;
}
