import { COURSES, findCourse, summarizeCourseProgress } from "@/lib/courses";
import { getCourseProgress, isCourseUnlocked } from "@/lib/progress";
import type { SaveData } from "@/lib/types";
import PlayerStatusCard from "@/components/PlayerStatusCard";

interface CourseSelectScreenProps {
  save: SaveData;
  onStartCourse: (courseId: string) => void;
  onEquipSkill: (skillId: string | null) => void;
  onBack: () => void;
}

export default function CourseSelectScreen({
  save,
  onStartCourse,
  onEquipSkill,
  onBack,
}: CourseSelectScreenProps) {
  return (
    <div className="screen">
      <h2>選擇課程關卡</h2>

      <PlayerStatusCard player={save.player} onEquipSkill={onEquipSkill} />

      <div className="course-list">
        {COURSES.map((course) => {
          const unlocked = isCourseUnlocked(save, course);
          const cp = getCourseProgress(save, course.id);
          const { totalMobs, mobsDone, totalMiniBosses, miniBossesDone, finalBossCleared } =
            summarizeCourseProgress(course, cp);

          const requiredCourse = course.requires ? findCourse(course.requires) : undefined;
          const statusText = !unlocked
            ? `🔒 需先破關「${requiredCourse?.title ?? ""}」`
            : finalBossCleared
              ? "🏆 已通關"
              : `小怪 ${mobsDone}/${totalMobs}｜小魔王 ${miniBossesDone}/${totalMiniBosses}｜大魔王 未挑戰`;

          return (
            <div key={course.id} className={`course-card ${unlocked ? "" : "locked"}`}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p className="status">{statusText}</p>
              {unlocked ? (
                <button
                  className="btn btn-primary"
                  onClick={() => onStartCourse(course.id)}
                >
                  {finalBossCleared ? "重新挑戰" : "進入關卡"}
                </button>
              ) : (
                <button className="btn btn-disabled" disabled>
                  尚未解鎖
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button className="btn btn-ghost" onClick={onBack}>
        ← 回主畫面
      </button>
    </div>
  );
}
