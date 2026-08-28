import { COURSES, findCourse, summarizeCourseProgress } from "@/lib/courses";
import { getCourseProgress, isCourseUnlocked } from "@/lib/progress";
import type { Progress } from "@/lib/types";
import HomeButton from "@/components/HomeButton";

interface CourseSelectScreenProps {
  progress: Progress;
  onSelectCourse: (courseId: string) => void;
  onGoHome: () => void;
}

export default function CourseSelectScreen({ progress, onSelectCourse, onGoHome }: CourseSelectScreenProps) {
  return (
    <div className="screen">
      <HomeButton onClick={onGoHome} />
      <h2>選擇課程</h2>

      <div className="course-list">
        {COURSES.map((course) => {
          const unlocked = isCourseUnlocked(progress, course);
          const cp = getCourseProgress(progress, course.id);
          const { totalCards, cardsEarned, finalBossCleared } = summarizeCourseProgress(course, cp);

          const requiredCourse = course.requires ? findCourse(course.requires) : undefined;
          const statusText = !unlocked
            ? `🔒 需先破關「${requiredCourse?.title ?? ""}」`
            : finalBossCleared
              ? "🏆 已通關｜🏅 已獲得徽章"
              : `🃏 卡片 ${cardsEarned}/${totalCards}｜大魔王 ${cardsEarned === totalCards ? "可挑戰" : "未解鎖"}`;

          return (
            <div key={course.id} className={`course-card ${unlocked ? "" : "locked"}`}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p className="status">{statusText}</p>
              {unlocked ? (
                <button className="btn btn-primary" onClick={() => onSelectCourse(course.id)}>
                  查看關卡
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
    </div>
  );
}
