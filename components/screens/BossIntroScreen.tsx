import type { Boss } from "@/lib/types";

interface BossIntroScreenProps {
  boss: Boss;
  kind: "miniboss" | "boss";
  onBeginBattle: () => void;
}

export default function BossIntroScreen({ boss, kind, onBeginBattle }: BossIntroScreenProps) {
  const isFinal = kind === "boss";
  return (
    <div className="screen center">
      <div className={`lesson-card ${isFinal ? "boss-intro" : "miniboss-intro"}`}>
        <p className="eyebrow">{isFinal ? "☠️ 終極大魔王現身" : "⚔️ 小魔王現身"}</p>
        <h2>{boss.name}</h2>
        <p className="lesson-content">{boss.intro}</p>
        <button className={`btn ${isFinal ? "btn-danger" : "btn-warn"}`} onClick={onBeginBattle}>
          {isFinal ? "挑戰終極大魔王！" : "挑戰小魔王！"}
        </button>
      </div>
    </div>
  );
}
