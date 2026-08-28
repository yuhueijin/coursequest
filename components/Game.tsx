"use client";

import { useEffect, useState } from "react";
import {
  findCourse,
  findNextEncounterInStage,
  getBadges,
  getEncounterPosition,
  getMaxCards,
  getMaxHpForLevel,
  getPlayerLevel,
  getStageProgress,
  getTotalCards,
  isCourseFullyCleared,
  isStageUnlocked,
} from "@/lib/courses";
import { getCourseProgress, loadSave, saveSaveData } from "@/lib/progress";
import type { Boss, EncounterRef, Mob, SaveData } from "@/lib/types";

import StartScreen from "@/components/screens/StartScreen";
import CourseSelectScreen from "@/components/screens/CourseSelectScreen";
import StageSelectScreen from "@/components/screens/StageSelectScreen";
import LessonScreen from "@/components/screens/LessonScreen";
import BossIntroScreen from "@/components/screens/BossIntroScreen";
import BattleScreen from "@/components/screens/BattleScreen";
import EncounterResultScreen from "@/components/screens/EncounterResultScreen";
import CardBossScreen from "@/components/screens/CardBossScreen";
import RestScreen from "@/components/screens/RestScreen";
import CourseClearScreen from "@/components/screens/CourseClearScreen";
import BadgeListScreen from "@/components/screens/BadgeListScreen";
import AdventureProgressBar from "@/components/AdventureProgressBar";

const WRONG_ANSWER_DAMAGE = 15;

type Screen =
  | "start"
  | "courseSelect"
  | "stageSelect"
  | "lesson"
  | "bossIntro"
  | "battle"
  | "encounterResult"
  | "rest"
  | "cardBossIntro"
  | "cardBoss"
  | "cardBossResult"
  | "courseClear"
  | "badges";

export default function Game() {
  const [screen, setScreen] = useState<Screen>("start");

  // save 用 lazy initializer 讀取：SSR 階段 window 不存在，先給預設值；
  // 客戶端 hydrate 時才真正讀 localStorage。這樣不用在 effect 裡呼叫
  // setState，也不會在讀檔完成前用空物件把舊存檔覆蓋掉。
  const [save, setSave] = useState<SaveData | null>(() =>
    typeof window === "undefined" ? null : loadSave()
  );

  // mounted 只給「主畫面」用：伺服器端跟客戶端 hydrate 那一瞬間都是 false，
  // 兩邊渲染出來的內容一致，不會有 hydration 不一致的問題；掛載後才翻成
  // true，改用客戶端真正讀到的 localStorage 資料顯示等級／徽章／卡片／血量。
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // 這是 Next.js/React 官方建議用來避開 SSR hydration 不一致的標準寫法
    // （只在掛載後翻一次旗標），不是可以用 lazy initializer 或衍生值取代
    // 的情況，所以特意豁免這一行的 set-state-in-effect 規則。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const [courseId, setCourseId] = useState<string | null>(null);

  // 訓練／關卡挑戰的一般戰鬥狀態（血量已經改成全域持續資源，不放在這裡了）
  const [encounter, setEncounter] = useState<EncounterRef | null>(null);
  const [enemy, setEnemy] = useState({ hp: 0, maxHp: 0 });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);
  const [lastLog, setLastLog] = useState("");
  const [lastExplain, setLastExplain] = useState("");
  const [encounterOutcome, setEncounterOutcome] = useState<"win" | "lose" | null>(null);

  // 終極挑戰卡牌戰狀態：依序出題，玩家從手牌（尚未用掉的卡片）選一張回答
  const [cardQuestionIndex, setCardQuestionIndex] = useState(0);
  const [playedStageIds, setPlayedStageIds] = useState<string[]>([]);
  const [cardBossOutcome, setCardBossOutcome] = useState<"win" | "lose" | null>(null);

  useEffect(() => {
    if (save !== null) saveSaveData(save);
  }, [save]);

  const safeSave: SaveData = save ?? { courses: {}, player: { hp: getMaxHpForLevel(1) } };
  const safeProgress = safeSave.courses;
  const level = getPlayerLevel(safeProgress);
  const totalCards = getTotalCards(safeProgress);
  const maxCards = getMaxCards();
  const badges = getBadges(safeProgress);
  const earnedBadgeCount = badges.filter((b) => b.earned).length;
  const maxBadgeCount = badges.length;
  const maxHp = getMaxHpForLevel(level);
  const hp = Math.min(safeSave.player.hp, maxHp);
  const isDead = hp <= 0;

  function setHp(newHp: number) {
    setSave({ ...safeSave, player: { hp: Math.max(0, Math.min(maxHp, newHp)) } });
  }

  function setCoursesProgress(newCourses: typeof safeProgress) {
    setSave({ ...safeSave, courses: newCourses });
  }

  function enterStageEncounter(ref: EncounterRef) {
    setEncounter(ref);
    setEnemy({ hp: ref.data.hp, maxHp: ref.data.hp });
    setQuestionIndex(0);
    setLastResult(null);
    setLastLog("");
    setLastExplain("");
    setEncounterOutcome(null);
    setScreen(ref.kind === "mob" ? "lesson" : "bossIntro");
  }

  function goHome() {
    setCourseId(null);
    setEncounter(null);
    setEncounterOutcome(null);
    setCardBossOutcome(null);
    setScreen("start");
  }

  function selectCourse(id: string) {
    setCourseId(id);
    setScreen("stageSelect");
  }

  function selectStage(stageId: string) {
    if (!courseId || isDead) return; // 血量歸零不能挑戰任何關卡
    const course = findCourse(courseId);
    if (!course) return;
    const stage = course.stages.find((s) => s.id === stageId);
    if (!stage) return;
    if (!isStageUnlocked(stage, level)) return; // 保險：等級不夠不能進

    const cp = getCourseProgress(safeProgress, courseId);
    const sp = getStageProgress(cp, stage);
    const ref = findNextEncounterInStage(stage, sp) ?? { kind: "miniboss" as const, stageId: stage.id, data: stage.miniBoss };
    enterStageEncounter(ref);
  }

  function beginBattle() {
    setScreen("battle");
  }

  function answerQuestion(optionIndex: number) {
    if (!encounter) return;
    const q = encounter.data.questions[questionIndex];
    const correct = optionIndex === q.answer;

    if (correct) {
      const dmg = Math.ceil(enemy.maxHp / encounter.data.questions.length);
      setEnemy((prev) => ({ ...prev, hp: Math.max(0, prev.hp - dmg) }));
      setLastResult("correct");
      setLastLog(`✅ 答對了！造成 ${dmg} 點傷害！`);
    } else {
      setHp(hp - WRONG_ANSWER_DAMAGE);
      setLastResult("wrong");
      setLastLog(`❌ 答錯了！敵人反擊，你受到 ${WRONG_ANSWER_DAMAGE} 點傷害。`);
    }
    setLastExplain(q.explain);
  }

  function proceedAfterAnswer() {
    if (!encounter) return;

    if (hp <= 0) {
      setEncounterOutcome("lose");
      setScreen("encounterResult");
      return;
    }
    if (enemy.hp <= 0) {
      setEncounterOutcome("win");
      setScreen("encounterResult");
      return;
    }

    const next = questionIndex + 1;
    if (next >= encounter.data.questions.length) {
      // 保險：題目出完但雙方都還活著時，依剩餘血量判定
      setEncounterOutcome(enemy.hp <= 0 ? "win" : "lose");
      setScreen("encounterResult");
      return;
    }

    setQuestionIndex(next);
    setLastResult(null);
    setScreen("battle");
  }

  function afterWin() {
    if (!encounter || !courseId) return;
    const course = findCourse(courseId);
    if (!course) return;
    const stage = course.stages.find((s) => s.id === encounter.stageId);
    if (!stage) return;
    const cp = getCourseProgress(safeProgress, courseId);
    const sp = getStageProgress(cp, stage);

    if (encounter.kind === "mob") {
      const mob = encounter.data as Mob;
      const mobsCleared = sp.mobsCleared.includes(mob.id) ? sp.mobsCleared : [...sp.mobsCleared, mob.id];
      const newSp = { ...sp, mobsCleared };
      const newCp = { ...cp, stages: { ...cp.stages, [stage.id]: newSp } };
      setCoursesProgress({ ...safeProgress, [courseId]: newCp });
      enterStageEncounter(findNextEncounterInStage(stage, newSp) ?? { kind: "miniboss" as const, stageId: stage.id, data: stage.miniBoss });
    } else {
      // 完成挑戰：完成這個關卡，拿到卡片，可能因此升級，升級的話血量上限
      // 跟著提高，多出來的上限直接加到目前血量；接著直接回到關卡選擇畫面，
      // 不會連續逼玩家馬上打下一關。
      const newSp = { ...sp, miniBossCleared: true };
      const newCp = { ...cp, stages: { ...cp.stages, [stage.id]: newSp } };
      const newCourses = { ...safeProgress, [courseId]: newCp };
      const newLevel = getPlayerLevel(newCourses);
      const newMaxHp = getMaxHpForLevel(newLevel);
      const hpGain = newLevel > level ? newMaxHp - maxHp : 0;
      setSave({ courses: newCourses, player: { hp: Math.min(newMaxHp, hp + hpGain) } });
      setScreen("stageSelect");
    }
  }

  function retryEncounter() {
    if (!encounter || isDead) return; // 血量歸零不能重新挑戰
    enterStageEncounter(encounter);
  }

  function backToStageSelect() {
    setEncounter(null);
    setEncounterOutcome(null);
    setScreen("stageSelect");
  }

  function backToCourseSelect() {
    setCourseId(null);
    setEncounter(null);
    setScreen("courseSelect");
  }

  // ---------------- 休息處 ----------------

  function goRest() {
    if (!courseId) return;
    setScreen("rest");
  }

  function restFully() {
    setHp(maxHp);
    setScreen("stageSelect");
  }

  // ---------------- 終極挑戰卡牌戰 ----------------

  function challengeBoss() {
    if (!courseId || isDead) return; // 血量歸零不能開始終極挑戰
    const course = findCourse(courseId);
    if (!course) return;
    const cp = getCourseProgress(safeProgress, courseId);
    if (!isCourseFullyCleared(course, cp)) return;

    setEnemy({ hp: course.finalBoss.hp, maxHp: course.finalBoss.hp });
    setCardQuestionIndex(0);
    setPlayedStageIds([]);
    setLastResult(null);
    setLastLog("");
    setLastExplain("");
    setCardBossOutcome(null);
    setScreen("cardBossIntro");
  }

  function beginCardBoss() {
    setScreen("cardBoss");
  }

  function selectCardAnswer(stageId: string) {
    if (!courseId) return;
    const course = findCourse(courseId);
    if (!course) return;
    const q = course.finalBoss.questions[cardQuestionIndex];
    const stage = course.stages.find((s) => s.id === stageId);
    const correct = stageId === q.correctStageId;

    if (correct) {
      const dmg = Math.ceil(enemy.maxHp / course.finalBoss.requiredCorrect);
      setEnemy((prev) => ({ ...prev, hp: Math.max(0, prev.hp - dmg) }));
      setLastResult("correct");
      setLastLog(`✅ 答對了！使出「${stage?.title ?? "卡片"}」，造成 ${dmg} 點傷害！`);
    } else {
      setHp(hp - WRONG_ANSWER_DAMAGE);
      setLastResult("wrong");
      setLastLog(`❌ 選錯卡了！敵人反擊，你受到 ${WRONG_ANSWER_DAMAGE} 點傷害。`);
    }
    setLastExplain(q.explain);
    setPlayedStageIds((prev) => [...prev, stageId]);
  }

  function proceedAfterCardAnswer() {
    if (!courseId) return;
    const course = findCourse(courseId);
    if (!course) return;

    if (hp <= 0) {
      setCardBossOutcome("lose");
      setScreen("cardBossResult");
      return;
    }
    if (enemy.hp <= 0) {
      setCardBossOutcome("win");
      setScreen("cardBossResult");
      return;
    }

    const next = cardQuestionIndex + 1;
    if (next >= course.finalBoss.questions.length) {
      // 保險：題目出完但雙方都還活著時，依剩餘血量判定
      setCardBossOutcome(enemy.hp <= 0 ? "win" : "lose");
      setScreen("cardBossResult");
      return;
    }

    setCardQuestionIndex(next);
    setLastResult(null);
    setLastLog("");
    setLastExplain("");
    setScreen("cardBoss");
  }

  function afterCardBossWin() {
    if (!courseId) return;
    const cp = getCourseProgress(safeProgress, courseId);
    const newCp = { ...cp, finalBossCleared: true };
    setCoursesProgress({ ...safeProgress, [courseId]: newCp });
    setScreen("courseClear");
  }

  function retryCardBoss() {
    if (!courseId || isDead) return; // 血量歸零不能重新挑戰
    const course = findCourse(courseId);
    if (!course) return;
    setEnemy({ hp: course.finalBoss.hp, maxHp: course.finalBoss.hp });
    setCardQuestionIndex(0);
    setPlayedStageIds([]);
    setLastResult(null);
    setLastLog("");
    setLastExplain("");
    setCardBossOutcome(null);
    setScreen("cardBossIntro");
  }

  // 闖關中（教學／挑戰介紹／戰鬥／結算）共用的整體進度條，
  // 顯示的是「這個 Stage 自己」的進度，不會跟其他 Stage 混在一起。
  function renderAdventureProgress() {
    if (!courseId || !encounter) return null;
    const course = findCourse(courseId);
    if (!course) return null;
    const cp = getCourseProgress(safeProgress, courseId);
    const { current, total, stageLabel } = getEncounterPosition(course, cp, encounter);
    return <AdventureProgressBar current={current} total={total} stageLabel={stageLabel} />;
  }

  const playerBar = { hp, maxHp };

  switch (screen) {
    case "start":
      return (
        <StartScreen
          mounted={mounted}
          level={level}
          totalCards={totalCards}
          maxCards={maxCards}
          earnedBadgeCount={earnedBadgeCount}
          maxBadgeCount={maxBadgeCount}
          hp={hp}
          maxHp={maxHp}
          onStart={() => setScreen("courseSelect")}
          onViewBadges={() => setScreen("badges")}
        />
      );

    case "badges":
      return <BadgeListScreen badges={badges} onBack={() => setScreen("start")} onGoHome={goHome} />;

    case "courseSelect":
      return <CourseSelectScreen progress={safeProgress} onSelectCourse={selectCourse} onGoHome={goHome} />;

    case "stageSelect": {
      if (!courseId) return null;
      const course = findCourse(courseId);
      if (!course) return null;
      const cp = getCourseProgress(safeProgress, courseId);
      return (
        <StageSelectScreen
          course={course}
          cp={cp}
          level={level}
          hp={hp}
          maxHp={maxHp}
          onSelectStage={selectStage}
          onChallengeBoss={challengeBoss}
          onGoRest={goRest}
          onBack={backToCourseSelect}
          onGoHome={goHome}
        />
      );
    }

    case "lesson":
      if (!encounter) return null;
      return (
        <>
          {renderAdventureProgress()}
          <LessonScreen mob={encounter.data as Mob} onBeginBattle={beginBattle} onGoHome={goHome} />
        </>
      );

    case "bossIntro":
      if (!encounter) return null;
      return (
        <>
          {renderAdventureProgress()}
          <BossIntroScreen
            boss={encounter.data as Boss}
            variant="miniboss"
            onBeginBattle={beginBattle}
            onGoHome={goHome}
          />
        </>
      );

    case "battle":
      if (!encounter) return null;
      return (
        <>
          {renderAdventureProgress()}
          <BattleScreen
            enemyData={encounter.data}
            kind={encounter.kind}
            questionIndex={questionIndex}
            player={playerBar}
            enemy={enemy}
            lastResult={lastResult}
            lastLog={lastLog}
            lastExplain={lastExplain}
            onAnswer={answerQuestion}
            onProceed={proceedAfterAnswer}
            onGoHome={goHome}
          />
        </>
      );

    case "encounterResult":
      if (!encounter || !encounterOutcome) return null;
      return (
        <>
          {renderAdventureProgress()}
          <EncounterResultScreen
            outcome={encounterOutcome}
            enemyName={encounter.data.name}
            canRetry={!isDead}
            onAfterWin={afterWin}
            onRetry={retryEncounter}
            onGoRest={goRest}
            onBack={backToStageSelect}
            onGoHome={goHome}
          />
        </>
      );

    case "rest": {
      if (!courseId) return null;
      const course = findCourse(courseId);
      if (!course) return null;
      return (
        <RestScreen
          videoId={course.restStopVideoId}
          onFullyRested={restFully}
          onBack={() => setScreen("stageSelect")}
          onGoHome={goHome}
        />
      );
    }

    case "cardBossIntro": {
      if (!courseId) return null;
      const course = findCourse(courseId);
      if (!course) return null;
      return (
        <BossIntroScreen
          boss={course.finalBoss}
          variant="finalboss"
          onBeginBattle={beginCardBoss}
          onGoHome={goHome}
        />
      );
    }

    case "cardBoss": {
      if (!courseId) return null;
      const course = findCourse(courseId);
      if (!course) return null;
      const remainingStageIds = course.stages.map((s) => s.id).filter((id) => !playedStageIds.includes(id));
      const currentQuestion = course.finalBoss.questions[cardQuestionIndex];
      return (
        <CardBossScreen
          bossName={course.finalBoss.name}
          stages={course.stages}
          player={playerBar}
          enemy={enemy}
          currentQuestion={currentQuestion}
          questionNumber={cardQuestionIndex + 1}
          totalQuestions={course.finalBoss.questions.length}
          requiredCorrect={course.finalBoss.requiredCorrect}
          remainingStageIds={remainingStageIds}
          lastResult={lastResult}
          lastLog={lastLog}
          lastExplain={lastExplain}
          onSelectCard={selectCardAnswer}
          onProceed={proceedAfterCardAnswer}
          onGoHome={goHome}
        />
      );
    }

    case "cardBossResult": {
      if (!courseId || !cardBossOutcome) return null;
      const course = findCourse(courseId);
      if (!course) return null;
      return (
        <EncounterResultScreen
          outcome={cardBossOutcome}
          enemyName={course.finalBoss.name}
          canRetry={!isDead}
          onAfterWin={afterCardBossWin}
          onRetry={retryCardBoss}
          onGoRest={goRest}
          onBack={backToStageSelect}
          onGoHome={goHome}
        />
      );
    }

    case "courseClear": {
      if (!courseId) return null;
      const course = findCourse(courseId);
      return (
        <CourseClearScreen
          courseTitle={course?.title ?? ""}
          onBackToCourseSelect={backToCourseSelect}
          onGoHome={goHome}
        />
      );
    }

    default:
      return null;
  }
}
