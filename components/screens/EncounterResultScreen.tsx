import HomeButton from "@/components/HomeButton";

interface EncounterResultScreenProps {
  outcome: "win" | "lose";
  enemyName: string;
  onAfterWin: () => void;
  onRetry: () => void;
  onGoRest: () => void;
  onBack: () => void;
  onGoHome: () => void;
}

export default function EncounterResultScreen({
  outcome,
  enemyName,
  onAfterWin,
  onRetry,
  onGoRest,
  onBack,
  onGoHome,
}: EncounterResultScreenProps) {
  if (outcome === "win") {
    return (
      <div className="screen center">
        <HomeButton onClick={onGoHome} />
        <div className="result-card win">
          <h2>🎉 擊敗了 {enemyName}！</h2>
          <p>知識轉化成了力量。</p>
          <button className="btn btn-primary" onClick={onAfterWin}>
            繼續前進
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen center">
      <HomeButton onClick={onGoHome} />
      <div className="result-card lose">
        <h2>😅 這次沒有打贏 {enemyName}</h2>
        <p>別灰心，複習一下剛剛的觀念，下次再來挑戰！</p>
        <button className="btn btn-danger" onClick={onRetry}>
          再挑戰一次
        </button>
        <button className="btn btn-warn" onClick={onGoRest}>
          🏕️ 前往休息處回血
        </button>
        <button className="btn btn-ghost" onClick={onBack}>
          回選擇章節
        </button>
      </div>
    </div>
  );
}
