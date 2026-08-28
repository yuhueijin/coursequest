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
      <h2>選擇課程關卡</h2>

      <div className="course-list">
        {COURSES.map((course) => {
          const unlocked = isCourseUnlocked(progress, course);
          const cp = getCourseProgress(progress, course.id);
          const { totalBadges, badgesEarned, finalBossCleared } = summarizeCourseProgress(course, cp);

          const requiredCourse = course.requires ? findCourse(course.requires) : undefined;
          const statusText = !unlocked
            ? `🔒 需先破關「${requiredCourse?.title ?? ""}」`
            : finalBossCleared
              ? `🏆 已通關｜🏅 ${badgesEarned}/${totalBadges}`
              : `🏅 徽章 ${badgesEarned}/${totalBadges}｜大魔王 ${badgesEarned === totalBadges ? "可挑戰" : "未解鎖"}`;

          return (
            <div key={course.id} className={`course-card ${unlocked ? "" : "locked"}`}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p className="status">{statusText}</p>
              {unlocked ? (
                <button className="btn btn-primary" onClick={() => onSelectCourse(course.id)}>
                  查看章節
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
