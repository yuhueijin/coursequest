interface EncounterResultScreenProps {
  outcome: "win" | "lose";
  enemyName: string;
  onAfterWin: () => void;
  onRetry: () => void;
  onBackToCourseSelect: () => void;
}

export default function EncounterResultScreen({
  outcome,
  enemyName,
  onAfterWin,
  onRetry,
  onBackToCourseSelect,
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
        <button className="btn btn-ghost" onClick={onBackToCourseSelect}>
          回關卡選單
        </button>
      </div>
    </div>
  );
}
