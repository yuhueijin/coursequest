import { getStageProgress, isCourseFullyCleared, isStageUnlocked } from "@/lib/courses";
import type { Course, CourseProgress } from "@/lib/types";
import HomeButton from "@/components/HomeButton";

interface StageSelectScreenProps {
  course: Course;
  cp: CourseProgress;
  level: number;
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
  onSelectStage,
  onChallengeBoss,
  onGoRest,
  onBack,
  onGoHome,
}: StageSelectScreenProps) {
  const fullyCleared = isCourseFullyCleared(course, cp);

  return (
    <div className="screen">
      <HomeButton onClick={onGoHome} />

      <h2>{course.title}</h2>
      <p className="subtitle">等級足夠的章節可以任意順序挑戰，全部拿到徽章後就能挑戰大魔王！</p>

      <div className="stage-list">
        {course.stages.map((stage) => {
          const sp = getStageProgress(cp, stage);
          const cleared = sp.miniBossCleared;
          const unlocked = isStageUnlocked(stage, level);

          return (
            <button
              key={stage.id}
              className={`stage-tile ${cleared ? "cleared" : ""} ${unlocked ? "" : "locked"}`}
              onClick={unlocked ? () => onSelectStage(stage.id) : undefined}
              disabled={!unlocked}
            >
              <span className={`stage-badge ${cleared ? "earned" : ""}`}>
                {unlocked ? stage.card.icon : "🔒"}
              </span>
              <span className="stage-tile-body">
                <span className="stage-tile-title">{stage.title}</span>
                <span className="stage-tile-desc">{stage.description}</span>
                <span className="stage-tile-status">
                  {!unlocked
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
            {fullyCleared
              ? cp.finalBossCleared
                ? "🏆 已擊敗，可重新挑戰"
                : "全部徽章已集滿，挑戰大魔王！"
              : `完成所有章節後解鎖（${course.stages.filter((s) => getStageProgress(cp, s).miniBossCleared).length}/${course.stages.length}）`}
          </span>
        </span>
      </button>

      <button className="btn btn-ghost" onClick={onBack}>
        ← 回課程選單
      </button>
    </div>
  );
}
