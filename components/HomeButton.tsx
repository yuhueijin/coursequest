interface HomeButtonProps {
  onClick: () => void;
}

/** 每個畫面都會用到的「回主畫面」按鈕，讓玩家隨時可以直接跳回最開始的畫面。 */
export default function HomeButton({ onClick }: HomeButtonProps) {
  return (
    <button className="btn btn-ghost home-btn" onClick={onClick}>
      🏠 回主畫面
    </button>
  );
}
