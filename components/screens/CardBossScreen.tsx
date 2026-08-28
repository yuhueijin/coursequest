import HpBar from "@/components/HpBar";
import type { Stage } from "@/lib/types";

interface CardBossScreenProps {
  bossName: string;
  stages: Stage[];
  player: { hp: number; maxHp: number };
  enemy: { hp: number; maxHp: number };
  playedStageIds: string[];
  cardOutcomes: Record<string, "correct" | "wrong">;
  activeStageId: string | null;
  lastResult: "correct" | "wrong" | null;
  lastLog: string;
  lastExplain: string;
  onPlayCard: (stageId: string) => void;
  onAnswer: (optionIndex: number) => void;
  onProceed: () => void;
}

export default function CardBossScreen({
  bossName,
  stages,
  player,
  enemy,
  playedStageIds,
  cardOutcomes,
  activeStageId,
  lastResult,
  lastLog,
  lastExplain,
  onPlayCard,
  onAnswer,
  onProceed,
}: CardBossScreenProps) {
  const activeStage = activeStageId ? stages.find((s) => s.id === activeStageId) : null;

  return (
    <div className="screen">
      <div className="battle-header">
        <div className="combatant">
          <p className="name">🧑 你</p>
          <HpBar cur={player.hp} max={player.maxHp} colorClass="hp-player" />
        </div>
        <div className="vs">VS</div>
        <div className="combatant">
          <p className="name">👹 {bossName}</p>
          <HpBar cur={enemy.hp} max={enemy.maxHp} colorClass="hp-boss" />
        </div>
      </div>

      {activeStage ? (
        <>
          <div className="question-card">
            <p className="eyebrow">
              {activeStage.card.icon} {activeStage.card.moveName}
            </p>
            <h3>{activeStage.card.question.q}</h3>
            {!lastResult && (
              <div className="options">
                {activeStage.card.question.options.map((opt, i) => (
                  <button key={i} className="btn btn-option" onClick={() => onAnswer(i)}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {lastResult && (
            <div className={`result-banner ${lastResult}`}>
              <p>{lastLog}</p>
              <p className="explain">💡 {lastExplain}</p>
              <button className="btn btn-primary" onClick={onProceed}>
                繼續
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card-hand">
          <p className="eyebrow">選一張招式卡出招</p>
          <div className="card-hand-grid">
            {stages.map((stage) => {
              const played = playedStageIds.includes(stage.id);
              const outcome = cardOutcomes[stage.id];
              return (
                <button
                  key={stage.id}
                  className={`move-card ${played ? `played ${outcome}` : ""}`}
                  onClick={() => !played && onPlayCard(stage.id)}
                  disabled={played}
                >
                  <span className="move-card-icon">{stage.card.icon}</span>
                  <span className="move-card-name">{stage.card.moveName}</span>
                  {played && <span className="move-card-mark">{outcome === "correct" ? "✅" : "❌"}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
