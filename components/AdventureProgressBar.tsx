interface AdventureProgressBarProps {
  current: number;
  total: number;
  stageLabel: string;
}

export default function AdventureProgressBar({ current, total, stageLabel }: AdventureProgressBarProps) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="adventure-progress">
      <div className="adventure-progress-header">
        <span>{stageLabel}</span>
        <span>
          第 {current} / {total} 關
        </span>
      </div>
      <div className="adventure-progress-bar">
        <div className="adventure-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
