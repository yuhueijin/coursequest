import { LEVEL_THRESHOLDS, SKILLS, getLevel, getUnlockedSkills, getXpForNextLevel } from "@/lib/skills";
import type { PlayerState } from "@/lib/types";

interface PlayerStatusCardProps {
  player: PlayerState;
  onEquipSkill: (skillId: string | null) => void;
}

export default function PlayerStatusCard({ player, onEquipSkill }: PlayerStatusCardProps) {
  const level = getLevel(player.xp);
  const unlocked = getUnlockedSkills(level);
  const nextThreshold = getXpForNextLevel(level);
  const prevThreshold = LEVEL_THRESHOLDS[level - 1];
  const pct = nextThreshold
    ? Math.round(((player.xp - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
    : 100;
  const equippedSkill = SKILLS.find((s) => s.id === player.equippedSkillId) ?? null;

  return (
    <div className="player-status">
      <div className="player-status-header">
        <span className="player-level">Lv.{level}</span>
        <span className="player-xp-text">
          {nextThreshold !== null ? `${player.xp} / ${nextThreshold} XP` : `${player.xp} XP（已滿級）`}
        </span>
      </div>
      <div className="xp-bar">
        <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      {unlocked.length > 0 && (
        <div className="skill-picker">
          <p className="eyebrow">裝備技能（戰鬥中答對時額外加成傷害）</p>
          <div className="skill-options">
            <button
              className={`skill-chip ${player.equippedSkillId === null ? "active" : ""}`}
              onClick={() => onEquipSkill(null)}
            >
              不裝備
            </button>
            {unlocked.map((skill) => (
              <button
                key={skill.id}
                className={`skill-chip ${player.equippedSkillId === skill.id ? "active" : ""}`}
                onClick={() => onEquipSkill(skill.id)}
              >
                {skill.name}（+{skill.bonusPct}%）
              </button>
            ))}
          </div>
          {equippedSkill && <p className="skill-desc">{equippedSkill.description}</p>}
        </div>
      )}
    </div>
  );
}
