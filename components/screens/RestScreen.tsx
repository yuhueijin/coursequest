import HomeButton from "@/components/HomeButton";

interface RestScreenProps {
  videoId: string;
  onFullyRested: () => void;
  onBack: () => void;
  onGoHome: () => void;
}

export default function RestScreen({ videoId, onFullyRested, onBack, onGoHome }: RestScreenProps) {
  return (
    <div className="screen center">
      <HomeButton onClick={onGoHome} />
      <div className="lesson-card rest-card">
        <p className="eyebrow">🏕️ 休息處</p>
        <h2>先喘口氣，看部影片再出發</h2>
        <p className="lesson-content" style={{ textAlign: "center" }}>
          血量歸零了嗎？沒關係，在這裡看完影片就能回滿血，繼續挑戰！
        </p>
        <div className="video-wrapper">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="休息處影片"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <button className="btn btn-primary" onClick={onFullyRested}>
          看完了，回血到滿！
        </button>
        <button className="btn btn-ghost" onClick={onBack}>
          ← 回選擇章節
        </button>
      </div>
    </div>
  );
}
