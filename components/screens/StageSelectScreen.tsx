import { getStageProgress, isCourseFullyCleared, isStageUnlocked } from "@/lib/courses";
import type { Course, CourseProgress } from "@/lib/types";
import HomeButton from "@/components/HomeButton";
import HpBar from "@/components/HpBar";

interface StageSelectScreenProps {
  course: Course;
  cp: CourseProgress;
  level: number;
  hp: number;
  maxHp: number;
  onSelectStage: (stageId: string) => void;
  onChallengeBoss: () => void;
  onGoRest: () => void;
  onBack: () => void;
  onGoHome: () => void;
}

export default function StageSelectScreen({
  course,
  cp,
  level,
  hp,
  maxHp,
  onSelectStage,
  onChallengeBoss,
  onGoRest,
  onBack,
  onGoHome,
}: StageSelectScreenProps) {
  const isDead = hp <= 0;
  const fullyCleared = isCourseFullyCleared(course, cp) && !isDead;

  return (
    <div className="screen">
      <HomeButton onClick={onGoHome} />

      <h2>{course.title}</h2>
      <p className="subtitle">等級足夠的關卡可以任意順序挑戰，全部拿到卡片後就能挑戰大魔王！</p>

      <div className="player-hp-card">
        <div className="player-hp-card-header">
          <span>❤️ 你的血量</span>
          <span>
            {hp} / {maxHp}
          </span>
        </div>
        <HpBar cur={hp} max={maxHp} colorClass="hp-player" />
      </div>

      {isDead && (
        <div className="hp-locked-banner">
          💤 血量歸零了，暫時無法挑戰任何關卡或大魔王，先到下面的休息處回滿血再出發！
        </div>
      )}

      <div className="stage-list">
        {course.stages.map((stage) => {
          const sp = getStageProgress(cp, stage);
          const cleared = sp.miniBossCleared;
          const unlocked = !isDead && isStageUnlocked(stage, level);

          return (
            <button
              key={stage.id}
              className={`stage-tile ${cleared ? "cleared" : ""} ${unlocked ? "" : "locked"}`}
              onClick={unlocked ? () => onSelectStage(stage.id) : undefined}
              disabled={!unlocked}
            >
              <span className={`stage-badge ${cleared ? "earned" : ""}`}>
                {unlocked || cleared ? stage.card.icon : "🔒"}
              </span>
              <span className="stage-tile-body">
                <span className="stage-tile-title">{stage.title}</span>
                <span className="stage-tile-desc">{stage.description}</span>
                <span className="stage-tile-status">
                  {isDead
                    ? "💤 血量歸零，暫時無法挑戰"
                    : !isStageUnlocked(stage, level)
                      ? `🔒 需要 Lv.${stage.requiredLevel}`
                      : cleared
                        ? "✅ 已完成，可重新挑戰"
                        : `小怪 ${sp.mobsCleared.length}/${stage.mobs.length}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button className="stage-tile rest-tile" onClick={onGoRest}>
        <span className="stage-badge earned">🏕️</span>
        <span className="stage-tile-body">
          <span className="stage-tile-title">休息處</span>
          <span className="stage-tile-desc">血量歸零時，來這裡看部影片回滿血再出發。</span>
        </span>
      </button>

      <button
        className={`boss-tile ${fullyCleared ? "unlocked" : "locked"}`}
        onClick={fullyCleared ? onChallengeBoss : undefined}
        disabled={!fullyCleared}
      >
        <span className="stage-badge">{fullyCleared ? "👹" : "🔒"}</span>
        <span className="stage-tile-body">
          <span className="stage-tile-title">{course.finalBoss.name}</span>
          <span className="stage-tile-status">
            {isDead
              ? "💤 血量歸零，暫時無法挑戰"
              : isCourseFullyCleared(course, cp)
                ? cp.finalBossCleared
                  ? "🏆 已擊敗，可重新挑戰"
                  : "全部卡片已收集，挑戰大魔王！"
                : `完成所有關卡後解鎖（${course.stages.filter((s) => getStageProgress(cp, s).miniBossCleared).length}/${course.stages.length}）`}
          </span>
        </span>
      </button>

      <button className="btn btn-ghost" onClick={onBack}>
        ← 回課程選單
      </button>
    </div>
  );
}
