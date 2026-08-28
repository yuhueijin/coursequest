interface StartScreenProps {
  mounted: boolean;
  level: number;
  totalBadges: number;
  maxBadges: number;
  onStart: () => void;
}

export default function StartScreen({ mounted, level, totalBadges, maxBadges, onStart }: StartScreenProps) {
  return (
    <div className="screen center">
      <h1 className="title">📖 課程冒險 CourseQuest</h1>
      <p className="subtitle">
        把課程變成關卡，把知識變成招式。
        <br />
        打倒小怪學觀念，擊敗大魔王證明你學會了！
      </p>

      {/*
        等級／徽章來自 localStorage，只有客戶端掛載後才讀得到。
        mounted 在伺服器端渲染跟客戶端 hydrate 那一瞬間都是 false，
        兩邊輸出一致不會有 hydration 不一致的問題；掛載後才顯示真正數值。
      */}
      {mounted && (
        <div className="player-summary">
          <span className="player-summary-level">Lv.{level}</span>
          <span className="player-summary-badges">
            🏅 {totalBadges}/{maxBadges} 枚徽章
          </span>
        </div>
      )}

      <button className="btn btn-primary" onClick={onStart}>
        開始遊戲
      </button>
    </div>
  );
}
