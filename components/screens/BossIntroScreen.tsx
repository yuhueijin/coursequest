import type { BossFlavor } from "@/lib/types";
import HomeButton from "@/components/HomeButton";

interface BossIntroScreenProps {
  boss: BossFlavor;
  variant: "miniboss" | "finalboss";
  onBeginBattle: () => void;
  onGoHome: () => void;
}

export default function BossIntroScreen({ boss, variant, onBeginBattle, onGoHome }: BossIntroScreenProps) {
  const isFinal = variant === "finalboss";
  return (
    <div className="screen center">
      <HomeButton onClick={onGoHome} />
      <div className={`lesson-card ${isFinal ? "boss-intro" : "miniboss-intro"}`}>
        <p className="eyebrow">{isFinal ? "🏆 終極挑戰開始" : "⚔️ 關卡挑戰開始"}</p>
        <h2>{boss.name}</h2>
        <p className="lesson-content">{boss.intro}</p>
        <button className={`btn ${isFinal ? "btn-danger" : "btn-warn"}`} onClick={onBeginBattle}>
          {isFinal ? "開始終極挑戰！" : "開始挑戰！"}
        </button>
      </div>
    </div>
  );
}
