import HpBar from "@/components/HpBar";
import HomeButton from "@/components/HomeButton";
import type { Boss, EncounterKind, Mob } from "@/lib/types";

interface BattleScreenProps {
  enemyData: Mob | Boss;
  kind: EncounterKind;
  questionIndex: number;
  player: { hp: number; maxHp: number };
  enemy: { hp: number; maxHp: number };
  lastResult: "correct" | "wrong" | null;
  lastLog: string;
  lastExplain: string;
  onAnswer: (optionIndex: number) => void;
  onProceed: () => void;
  onGoHome: () => void;
}

const ENEMY_ICON: Record<EncounterKind, string> = {
  mob: "📝",
  miniboss: "🎯",
};

const ENEMY_HP_CLASS: Record<EncounterKind, "hp-mob" | "hp-miniboss"> = {
  mob: "hp-mob",
  miniboss: "hp-miniboss",
};

export default function BattleScreen({
  enemyData,
  kind,
  questionIndex,
  player,
  enemy,
  lastResult,
  lastLog,
  lastExplain,
  onAnswer,
  onProceed,
  onGoHome,
}: BattleScreenProps) {
  const q = enemyData.questions[questionIndex];

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
          <p className="name">
            {ENEMY_ICON[kind]} {enemyData.name}
          </p>
          <HpBar cur={enemy.hp} max={enemy.maxHp} colorClass={ENEMY_HP_CLASS[kind]} />
        </div>
      </div>

      <div className="question-card">
        <p className="eyebrow">
          第 {questionIndex + 1} / {enemyData.questions.length} 題
        </p>
        <h3>{q.q}</h3>
        {!lastResult && (
          <div className="options">
            {q.options.map((opt, i) => (
              <button
                key={i}
                className="btn btn-option"
                onClick={() => onAnswer(i)}
              >
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
    </div>
  );
}
