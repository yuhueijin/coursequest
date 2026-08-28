interface HpBarProps {
  cur: number;
  max: number;
  colorClass: "hp-player" | "hp-mob" | "hp-boss";
}

export default function HpBar({ cur, max, colorClass }: HpBarProps) {
  const pct = Math.max(0, Math.round((cur / max) * 100));
  return (
    <div className="hpbar">
      <div className={`hpbar-fill ${colorClass}`} style={{ width: `${pct}%` }} />
      <span className="hpbar-label">
        {cur} / {max}
      </span>
    </div>
  );
}
