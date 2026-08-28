import type { Mob } from "@/lib/types";

interface LessonScreenProps {
  mob: Mob;
  onBeginBattle: () => void;
}

export default function LessonScreen({ mob, onBeginBattle }: LessonScreenProps) {
  return (
    <div className="screen center">
      <div className="lesson-card">
        <p className="eyebrow">遭遇小怪：{mob.name}</p>
        <h2>{mob.lesson.title}</h2>
        <p className="lesson-content">{mob.lesson.content}</p>
        <button className="btn btn-primary" onClick={onBeginBattle}>
          學會了，開打！
        </button>
      </div>
    </div>
  );
}
