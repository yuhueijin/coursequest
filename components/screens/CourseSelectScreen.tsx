import { COURSES, findCourse } from "@/lib/courses";
import { getCourseProgress, isCourseUnlocked } from "@/lib/progress";
import type { Progress } from "@/lib/types";

interface CourseSelectScreenProps {
  progress: Progress;
  onStartCourse: (courseId: string) => void;
  onBack: () => void;
}

export default function CourseSelectScreen({
  progress,
  onStartCourse,
  onBack,
}: CourseSelectScreenProps) {
  return (
    <div className="screen">
      <h2>選擇課程關卡</h2>
      <div className="course-list">
        {COURSES.map((course) => {
          const unlocked = isCourseUnlocked(progress, course);
          const cp = getCourseProgress(progress, course.id);
          const mobsDone = cp.mobsCleared.length;
          const mobsTotal = course.mobs.length;
          const bossDone = cp.bossCleared;

          const requiredCourse = course.requires ? findCourse(course.requires) : undefined;
          const statusText = !unlocked
            ? `🔒 需先破關「${requiredCourse?.title ?? ""}」`
            : bossDone
              ? "🏆 已通關"
              : `小怪 ${mobsDone}/${mobsTotal}｜大魔王 ${bossDone ? "已擊敗" : "未挑戰"}`;

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
                  {bossDone ? "重新挑戰" : "進入關卡"}
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
