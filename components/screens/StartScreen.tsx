interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="screen center">
      <h1 className="title">📖 課程冒險 CourseQuest</h1>
      <p className="subtitle">
        把課程變成關卡，把知識變成招式。
        <br />
        打倒小怪學觀念，擊敗大魔王證明你學會了！
      </p>
      <button className="btn btn-primary" onClick={onStart}>
        開始遊戲
      </button>
    </div>
  );
}
