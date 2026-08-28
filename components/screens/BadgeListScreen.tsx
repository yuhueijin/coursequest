import type { BadgeInfo } from "@/lib/courses";
import HomeButton from "@/components/HomeButton";

interface BadgeListScreenProps {
  badges: BadgeInfo[];
  onBack: () => void;
  onGoHome: () => void;
}

/** 徽章清單：每完成一整門課程（完成終極挑戰）才會獲得一枚，跟每個關卡拿到的卡片是分開的收集品。 */
export default function BadgeListScreen({ badges, onBack, onGoHome }: BadgeListScreenProps) {
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="screen">
      <HomeButton onClick={onGoHome} />
      <h2>🏅 徽章清單</h2>
      <p className="subtitle">
        每完成一整門課程、完成終極挑戰，就能獲得這門課程的徽章。
        <br />
        目前已獲得 {earnedCount}/{badges.length} 枚。
      </p>

      <div className="badge-list">
        {badges.map((badge) => (
          <div key={badge.courseId} className={`badge-tile ${badge.earned ? "earned" : ""}`}>
            <span className="badge-tile-icon">{badge.earned ? "🏅" : "🔒"}</span>
            <span className="badge-tile-body">
              <span className="badge-tile-title">{badge.title}</span>
              <span className="badge-tile-status">{badge.earned ? "已獲得" : "尚未通關這門課程"}</span>
            </span>
          </div>
        ))}
      </div>

      <button className="btn btn-ghost" onClick={onBack}>
        ← 回主畫面
      </button>
    </div>
  );
}
