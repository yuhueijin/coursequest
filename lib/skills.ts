import type { Skill } from "./types";

/**
 * 升級與技能系統（簡化版）：
 * - 答對題目會累積 XP。
 * - XP 累積到門檻就升級，並解鎖一個新技能。
 * - 技能可以在「選擇課程關卡」畫面裝備，裝備後只要答對題目，
 *   就會額外造成技能對應的加成傷害（跟原本招式的傷害疊加）。
 * - 每次只能裝備一個技能，讓玩家有取捨、不會後期技能全部疊加太誇張。
 *
 * 技能本身也呼應教材內容（自我保護、蒐證、旁觀者介入、申訴、心理支持），
 * 讓「升級解鎖技能」這件事本身也是一次複習。
 */

export const SKILLS: Skill[] = [
  {
    id: "refuse",
    name: "明確拒絕術",
    description:
      "遭受性騷擾時，第一步永遠是明確表達不願意、確保自身安全。裝備後，答對題目時額外造成 20% 傷害。",
    unlockLevel: 2,
    bonusPct: 20,
  },
  {
    id: "evidence",
    name: "蒐證之眼",
    description:
      "養成隨時記錄時間、地點、涉事人與行為細節的習慣，是申訴最重要的準備。裝備後，答對題目時額外造成 25% 傷害。",
    unlockLevel: 3,
    bonusPct: 25,
  },
  {
    id: "bystander",
    name: "旁觀者介入",
    description:
      "看見他人受害時挺身而出、提醒不當言行、協助作證，能避免被害人孤立無援。裝備後，答對題目時額外造成 30% 傷害。",
    unlockLevel: 4,
    bonusPct: 30,
  },
  {
    id: "complaint",
    name: "申訴之盾",
    description:
      "善用機關的申訴管道保護自己與他人，是法律賦予的權利。裝備後，答對題目時額外造成 35% 傷害。",
    unlockLevel: 5,
    bonusPct: 35,
  },
  {
    id: "support",
    name: "心理支持網",
    description:
      "知道何時尋求心理諮商與法律協助，是完整自我保護的最後一塊拼圖。裝備後，答對題目時額外造成 40% 傷害。",
    unlockLevel: 6,
    bonusPct: 40,
  },
];

/** 每個等級「累積」需要多少 XP 才能達到；index 0（等級1）永遠是 0 */
export const LEVEL_THRESHOLDS = [0, 50, 110, 180, 260, 350];

export const MAX_LEVEL = LEVEL_THRESHOLDS.length;

export function getLevel(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level;
}

/** 升到下一級所需的「累積」XP；已經滿級則回傳 null */
export function getXpForNextLevel(level: number): number | null {
  return level < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[level] : null;
}

export function getUnlockedSkills(level: number): Skill[] {
  return SKILLS.filter((s) => s.unlockLevel <= level);
}

export function findSkill(skillId: string | null): Skill | null {
  if (!skillId) return null;
  return SKILLS.find((s) => s.id === skillId) ?? null;
}
