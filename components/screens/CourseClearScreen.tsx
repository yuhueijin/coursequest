import HomeButton from "@/components/HomeButton";

interface CourseClearScreenProps {
  courseTitle: string;
  onBackToCourseSelect: () => void;
  onGoHome: () => void;
}

export default function CourseClearScreen({
  courseTitle,
  onBackToCourseSelect,
  onGoHome,
}: CourseClearScreenProps) {
  return (
    <div className="screen center">
      <HomeButton onClick={onGoHome} />
      <div className="result-card win">
        <h2>🏆 課程通關：{courseTitle}</h2>
        <p>你已經掌握了這個單元的所有知識！</p>
        <button className="btn btn-primary" onClick={onBackToCourseSelect}>
          回課程選單
        </button>
      </div>
    </div>
  );
}
