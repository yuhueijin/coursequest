import type { Boss } from "@/lib/types";

interface BossIntroScreenProps {
  boss: Boss;
  onBeginBattle: () => void;
}

export default function BossIntroScreen({ boss, onBeginBattle }: BossIntroScreenProps) {
  return (
    <div className="screen center">
      <div className="lesson-card boss-intro">
        <p className="eyebrow">⚔️ 大魔王現身</p>
        <h2>{boss.name}</h2>
        <p className="lesson-content">{boss.intro}</p>
        <button className="btn btn-danger" onClick={onBeginBattle}>
          挑戰大魔王！
        </button>
      </div>
    </div>
  );
}
