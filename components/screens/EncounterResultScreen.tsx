interface EncounterResultScreenProps {
  outcome: "win" | "lose";
  enemyName: string;
  onAfterWin: () => void;
  onRetry: () => void;
  onBack: () => void;
}

export default function EncounterResultScreen({
  outcome,
  enemyName,
  onAfterWin,
  onRetry,
  onBack,
}: EncounterResultScreenProps) {
  if (outcome === "win") {
    return (
      <div className="screen center">
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
      <div className="result-card lose">
        <h2>💀 你被 {enemyName} 擊倒了</h2>
        <p>再複習一下剛剛的觀念，重新挑戰吧！</p>
        <button className="btn btn-danger" onClick={onRetry}>
          再挑戰一次
        </button>
        <button className="btn btn-ghost" onClick={onBack}>
          回選擇章節
        </button>
      </div>
    </div>
  );
}
