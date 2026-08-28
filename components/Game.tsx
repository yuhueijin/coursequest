"use client";

import { useEffect, useState } from "react";
import {
  findCourse,
  findNextEncounterInStage,
  getEncounterPosition,
  getStageProgress,
  isCourseFullyCleared,
} from "@/lib/courses";
import { getCourseProgress, loadProgress, saveProgress } from "@/lib/progress";
import type { Boss, EncounterRef, Mob, Progress } from "@/lib/types";

import StartScreen from "@/components/screens/StartScreen";
import CourseSelectScreen from "@/components/screens/CourseSelectScreen";
import StageSelectScreen from "@/components/screens/StageSelectScreen";
import LessonScreen from "@/components/screens/LessonScreen";
import BossIntroScreen from "@/components/screens/BossIntroScreen";
import BattleScreen from "@/components/screens/BattleScreen";
import EncounterResultScreen from "@/components/screens/EncounterResultScreen";
import CardBossScreen from "@/components/screens/CardBossScreen";
import CourseClearScreen from "@/components/screens/CourseClearScreen";
import AdventureProgressBar from "@/components/AdventureProgressBar";

const PLAYER_MAX_HP = 100;
const WRONG_ANSWER_DAMAGE = 15;
const HEAL_AFTER_MOB = 15;

type Screen =
  | "start"
  | "courseSelect"
  | "stageSelect"
  | "lesson"
  | "bossIntro"
  | "battle"
  | "encounterResult"
  | "cardBossIntro"
  | "cardBoss"
  | "cardBossResult"
  | "courseClear";

export default function Game() {
  const [screen, setScreen] = useState<Screen>("start");

  // progress 用 lazy initializer 讀取：SSR 階段 window 不存在，先給 null；
  // 客戶端 hydrate 時才真正讀 localStorage。這樣不用在 effect 裡呼叫
  // setState，也不會在讀檔完成前用空物件把舊存檔覆蓋掉。
  const [progress, setProgress] = useState<Progress | null>(() =>
    typeof window === "undefined" ? null : loadProgress()
  );

  const [courseId, setCourseId] = useState<string | null>(null);

  // 小怪／小魔王的一般戰鬥狀態
  const [encounter, setEncounter] = useState<EncounterRef | null>(null);
  const [player, setPlayer] = useState({ hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP });
  const [enemy, setEnemy] = useState({ hp: 0, maxHp: 0 });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);
  const [lastLog, setLastLog] = useState("");
  const [lastExplain, setLastExplain] = useState("");
  const [encounterOutcome, setEncounterOutcome] = useState<"win" | "lose" | null>(null);

  // 大魔王卡牌戰狀態
  const [playedCardIds, setPlayedCardIds] = useState<string[]>([]);
  const [cardOutcomes, setCardOutcomes] = useState<Record<string, "correct" | "wrong">>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [cardBossOutcome, setCardBossOutcome] = useState<"win" | "lose" | null>(null);

  useEffect(() => {
    if (progress !== null) saveProgress(progress);
  }, [progress]);

  const safeProgress: Progress = progress ?? {};

  function enterStageEncounter(ref: EncounterRef) {
    setEncounter(ref);
    setEnemy({ hp: ref.data.hp, maxHp: ref.data.hp });
    setQuestionIndex(0);
    setLastResult(null);
    setLastLog("");
    setLastExplain("");
    setEncounterOutcome(null);

    if (ref.kind === "mob") {
      setScreen("lesson");
    } else {
      // 小魔王是這個章節的綜合考驗，開打前一律回滿血，公平重新開始。
      setPlayer((prev) => ({ ...prev, hp: prev.maxHp }));
      setScreen("bossIntro");
    }
  }

  function selectCourse(id: string) {
    setCourseId(id);
    setScreen("stageSelect");
  }

  function selectStage(stageId: string) {
    if (!courseId) return;
    const course = findCourse(courseId);
    if (!course) return;
    const stage = course.stages.find((s) => s.id === stageId);
    if (!stage) return;
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
      setLastLog(`✅ 答對了！使出「${q.moveName}」，造成 ${dmg} 點傷害！`);
    } else {
      setPlayer((prev) => ({ ...prev, hp: Math.max(0, prev.hp - WRONG_ANSWER_DAMAGE) }));
      setLastResult("wrong");
      setLastLog(`❌ 答錯了！敵人反擊，你受到 ${WRONG_ANSWER_DAMAGE} 點傷害。`);
    }
    setLastExplain(q.explain);
  }

  function proceedAfterAnswer() {
    if (!encounter) return;

    if (player.hp <= 0) {
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
      const newProgress = { ...safeProgress, [courseId]: newCp };
      setProgress(newProgress);

      setPlayer((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + HEAL_AFTER_MOB) }));
      const nextRef = findNextEncounterInStage(stage, newSp) ?? { kind: "miniboss" as const, stageId: stage.id, data: stage.miniBoss };
      enterStageEncounter(nextRef);
    } else {
      // 小魔王：拿到這個章節的徽章／招式卡，回到章節選單，讓玩家自由選下一關。
      const newSp = { ...sp, miniBossCleared: true };
      const newCp = { ...cp, stages: { ...cp.stages, [stage.id]: newSp } };
      const newProgress = { ...safeProgress, [courseId]: newCp };
      setProgress(newProgress);
      setScreen("stageSelect");
    }
  }

  function retryEncounter() {
    if (!encounter) return;
    setPlayer((prev) => ({ ...prev, hp: Math.max(prev.hp, Math.ceil(prev.maxHp * 0.5)) }));
    enterStageEncounter(encounter);
  }

  function backToStageSelect() {
    setEncounter(null);
    setScreen("stageSelect");
  }

  function backToCourseSelect() {
    setCourseId(null);
    setEncounter(null);
    setScreen("courseSelect");
  }

  // ---------------- 大魔王卡牌戰 ----------------

  function challengeBoss() {
    if (!courseId) return;
    const course = findCourse(courseId);
    if (!course) return;
    const cp = getCourseProgress(safeProgress, courseId);
    if (!isCourseFullyCleared(course, cp)) return;

    setEnemy({ hp: course.finalBoss.hp, maxHp: course.finalBoss.hp });
    setPlayer({ hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP });
    setPlayedCardIds([]);
    setCardOutcomes({});
    setActiveCardId(null);
    setLastResult(null);
    setLastLog("");
    setLastExplain("");
    setCardBossOutcome(null);
    setScreen("cardBossIntro");
  }

  function beginCardBoss() {
    setScreen("cardBoss");
  }

  function playCard(stageId: string) {
    setActiveCardId(stageId);
    setLastResult(null);
    setLastLog("");
    setLastExplain("");
  }

  function answerCardQuestion(optionIndex: number) {
    if (!activeCardId || !courseId) return;
    const course = findCourse(courseId);
    if (!course) return;
    const stage = course.stages.find((s) => s.id === activeCardId);
    if (!stage) return;
    const q = stage.card.question;
    const correct = optionIndex === q.answer;

    if (correct) {
      const dmg = Math.ceil(enemy.maxHp / course.stages.length);
      setEnemy((prev) => ({ ...prev, hp: Math.max(0, prev.hp - dmg) }));
      setLastResult("correct");
      setLastLog(`✅ 答對了！使出「${q.moveName}」，造成 ${dmg} 點傷害！`);
      setCardOutcomes((prev) => ({ ...prev, [activeCardId]: "correct" }));
    } else {
      setPlayer((prev) => ({ ...prev, hp: Math.max(0, prev.hp - WRONG_ANSWER_DAMAGE) }));
      setLastResult("wrong");
      setLastLog(`❌ 答錯了！敵人反擊，你受到 ${WRONG_ANSWER_DAMAGE} 點傷害。`);
      setCardOutcomes((prev) => ({ ...prev, [activeCardId]: "wrong" }));
    }
    setLastExplain(q.explain);
    setPlayedCardIds((prev) => [...prev, activeCardId]);
  }

  function proceedAfterCardAnswer() {
    if (!courseId) return;
    const course = findCourse(courseId);
    if (!course) return;

    if (player.hp <= 0) {
      setCardBossOutcome("lose");
      setScreen("cardBossResult");
      return;
    }
    if (enemy.hp <= 0) {
      setCardBossOutcome("win");
      setScreen("cardBossResult");
      return;
    }
    if (playedCardIds.length >= course.stages.length) {
      // 保險：卡牌出完但雙方都還活著時，依剩餘血量判定
      setCardBossOutcome(enemy.hp <= 0 ? "win" : "lose");
      setScreen("cardBossResult");
      return;
    }

    setActiveCardId(null);
    setLastResult(null);
    setScreen("cardBoss");
  }

  function afterCardBossWin() {
    if (!courseId) return;
    const cp = getCourseProgress(safeProgress, courseId);
    const newCp = { ...cp, finalBossCleared: true };
    setProgress({ ...safeProgress, [courseId]: newCp });
    setScreen("courseClear");
  }

  function retryCardBoss() {
    if (!courseId) return;
    const course = findCourse(courseId);
    if (!course) return;
    setPlayer((prev) => ({ ...prev, hp: Math.max(prev.hp, Math.ceil(prev.maxHp * 0.5)) }));
    setEnemy({ hp: course.finalBoss.hp, maxHp: course.finalBoss.hp });
    setPlayedCardIds([]);
    setCardOutcomes({});
    setActiveCardId(null);
    setLastResult(null);
    setLastLog("");
    setLastExplain("");
    setCardBossOutcome(null);
    setScreen("cardBossIntro");
  }

  // 闖關中（教學／小魔王介紹／戰鬥／結算）共用的整體進度條，
  // 讓玩家隨時知道現在第幾關、總共幾關、還剩幾個章節。
  function renderAdventureProgress() {
    if (!courseId || !encounter) return null;
    const course = findCourse(courseId);
    if (!course) return null;
    const cp = getCourseProgress(safeProgress, courseId);
    const { current, total, stageLabel } = getEncounterPosition(course, cp, encounter);
    return <AdventureProgressBar current={current} total={total} stageLabel={stageLabel} />;
  }

  switch (screen) {
    case "start":
      return <StartScreen onStart={() => setScreen("courseSelect")} />;

    case "courseSelect":
      return (
        <CourseSelectScreen
          progress={safeProgress}
          onSelectCourse={selectCourse}
          onBack={() => setScreen("start")}
        />
      );

    case "stageSelect": {
      if (!courseId) return null;
      const course = findCourse(courseId);
      if (!course) return null;
      const cp = getCourseProgress(safeProgress, courseId);
      return (
        <StageSelectScreen
          course={course}
          cp={cp}
          onSelectStage={selectStage}
          onChallengeBoss={challengeBoss}
          onBack={backToCourseSelect}
        />
      );
    }

    case "lesson":
      if (!encounter) return null;
      return (
        <>
          {renderAdventureProgress()}
          <LessonScreen mob={encounter.data as Mob} onBeginBattle={beginBattle} />
        </>
      );

    case "bossIntro":
      if (!encounter) return null;
      return (
        <>
          {renderAdventureProgress()}
          <BossIntroScreen boss={encounter.data as Boss} variant="miniboss" onBeginBattle={beginBattle} />
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
            player={player}
            enemy={enemy}
            lastResult={lastResult}
            lastLog={lastLog}
            lastExplain={lastExplain}
            onAnswer={answerQuestion}
            onProceed={proceedAfterAnswer}
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
            onAfterWin={afterWin}
            onRetry={retryEncounter}
            onBack={backToStageSelect}
          />
        </>
      );

    case "cardBossIntro": {
      if (!courseId) return null;
      const course = findCourse(courseId);
      if (!course) return null;
      return <BossIntroScreen boss={course.finalBoss} variant="finalboss" onBeginBattle={beginCardBoss} />;
    }

    case "cardBoss": {
      if (!courseId) return null;
      const course = findCourse(courseId);
      if (!course) return null;
      return (
        <CardBossScreen
          bossName={course.finalBoss.name}
          stages={course.stages}
          player={player}
          enemy={enemy}
          playedStageIds={playedCardIds}
          cardOutcomes={cardOutcomes}
          activeStageId={activeCardId}
          lastResult={lastResult}
          lastLog={lastLog}
          lastExplain={lastExplain}
          onPlayCard={playCard}
          onAnswer={answerCardQuestion}
          onProceed={proceedAfterCardAnswer}
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
          onAfterWin={afterCardBossWin}
          onRetry={retryCardBoss}
          onBack={backToStageSelect}
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
        />
      );
    }

    default:
      return null;
  }
}
