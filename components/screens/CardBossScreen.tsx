import HpBar from "@/components/HpBar";
import HomeButton from "@/components/HomeButton";
import type { FinalBossQuestion, Stage } from "@/lib/types";

interface CardBossScreenProps {
  bossName: string;
  stages: Stage[];
  player: { hp: number; maxHp: number };
  enemy: { hp: number; maxHp: number };
  currentQuestion: FinalBossQuestion;
  questionNumber: number;
  totalQuestions: number;
  /** 答對幾題就能提前打死魔王；等於 totalQuestions 代表要全對 */
  requiredCorrect: number;
  remainingStageIds: string[];
  lastResult: "correct" | "wrong" | null;
  lastLog: string;
  lastExplain: string;
  onSelectCard: (stageId: string) => void;
  onProceed: () => void;
  onGoHome: () => void;
}

export default function CardBossScreen({
  bossName,
  stages,
  player,
  enemy,
  currentQuestion,
  questionNumber,
  totalQuestions,
  requiredCorrect,
  remainingStageIds,
  lastResult,
  lastLog,
  lastExplain,
  onSelectCard,
  onProceed,
  onGoHome,
}: CardBossScreenProps) {
  const remainingStages = stages.filter((s) => remainingStageIds.includes(s.id));
  const winConditionText =
    requiredCorrect >= totalQuestions
      ? `⚠️ 這隻魔王要全部 ${totalQuestions} 題都答對才會被打倒`
      : `💡 只要答對其中 ${requiredCorrect}/${totalQuestions} 題就能提前打倒魔王`;

  return (
    <div className="screen">
      <HomeButton onClick={onGoHome} />
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

      <p className="win-condition-note">{winConditionText}</p>

      <div className="question-card">
        <p className="eyebrow">
          魔王出題　第 {questionNumber} / {totalQuestions} 題
        </p>
        <h3>{currentQuestion.q}</h3>
      </div>

      {!lastResult && (
        <div className="card-hand">
          <p className="eyebrow">從手牌選一張回答</p>
          <div className="card-hand-grid">
            {remainingStages.map((stage) => (
              <button key={stage.id} className="move-card" onClick={() => onSelectCard(stage.id)}>
                <span className="move-card-icon">{stage.card.icon}</span>
                <span className="move-card-name">{stage.card.moveName}</span>
                <span className="move-card-desc">{stage.card.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {lastResult && (
        <div className={`result-banner ${lastResult}`}>
          <p>{lastLog}</p>
          <p className="explain">💡 {lastExplain}</p>
          <button className="btn btn-primary" onClick={onProceed}>
            繼續
          </button>
        </div>
      )}
    </div>
  );
}
