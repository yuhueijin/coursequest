import type { Mob } from "@/lib/types";
import HomeButton from "@/components/HomeButton";

interface LessonScreenProps {
  mob: Mob;
  onBeginBattle: () => void;
  onGoHome: () => void;
}

export default function LessonScreen({ mob, onBeginBattle, onGoHome }: LessonScreenProps) {
  return (
    <div className="screen center">
      <HomeButton onClick={onGoHome} />
      <div className="lesson-card">
        <p className="eyebrow">訓練項目：{mob.name}</p>
        <h2>{mob.lesson.title}</h2>
        <p className="lesson-content">{mob.lesson.content}</p>
        <button className="btn btn-primary" onClick={onBeginBattle}>
          學會了，開打！
        </button>
      </div>
    </div>
  );
}
