import { getStageProgress, isCourseFullyCleared } from "@/lib/courses";
import type { Course, CourseProgress } from "@/lib/types";

interface StageSelectScreenProps {
  course: Course;
  cp: CourseProgress;
  onSelectStage: (stageId: string) => void;
  onChallengeBoss: () => void;
  onBack: () => void;
}

export default function StageSelectScreen({
  course,
  cp,
  onSelectStage,
  onChallengeBoss,
  onBack,
}: StageSelectScreenProps) {
  const fullyCleared = isCourseFullyCleared(course, cp);

  return (
    <div className="screen">
      <h2>{course.title}</h2>
      <p className="subtitle">章節可以任意順序挑戰，全部拿到徽章後就能挑戰大魔王！</p>

      <div className="stage-list">
        {course.stages.map((stage) => {
          const sp = getStageProgress(cp, stage);
          const cleared = sp.miniBossCleared;
          return (
            <button
              key={stage.id}
              className={`stage-tile ${cleared ? "cleared" : ""}`}
              onClick={() => onSelectStage(stage.id)}
            >
              <span className={`stage-badge ${cleared ? "earned" : ""}`}>{stage.card.icon}</span>
              <span className="stage-tile-body">
                <span className="stage-tile-title">{stage.title}</span>
                <span className="stage-tile-desc">{stage.description}</span>
                <span className="stage-tile-status">
                  {cleared ? "✅ 已完成，可重新挑戰" : `小怪 ${sp.mobsCleared.length}/${stage.mobs.length}`}
                </span>
              </span>
            </button>
          );
        })}
      </div>

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
