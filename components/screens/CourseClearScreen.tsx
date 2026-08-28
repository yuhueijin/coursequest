interface CourseClearScreenProps {
  courseTitle: string;
  onBackToCourseSelect: () => void;
}

export default function CourseClearScreen({
  courseTitle,
  onBackToCourseSelect,
}: CourseClearScreenProps) {
  return (
    <div className="screen center">
      <div className="result-card win">
        <h2>🏆 課程通關：{courseTitle}</h2>
        <p>你已經掌握了這個單元的所有知識！</p>
        <button className="btn btn-primary" onClick={onBackToCourseSelect}>
          回關卡選單
        </button>
      </div>
    </div>
  );
}
