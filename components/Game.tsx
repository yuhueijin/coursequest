"use client";

import { useEffect, useState } from "react";
import { findCourse } from "@/lib/courses";
import { getCourseProgress, loadProgress, saveProgress } from "@/lib/progress";
import type { Boss, EncounterType, Mob, Progress } from "@/lib/types";

import StartScreen from "@/components/screens/StartScreen";
import CourseSelectScreen from "@/components/screens/CourseSelectScreen";
import LessonScreen from "@/components/screens/LessonScreen";
import BossIntroScreen from "@/components/screens/BossIntroScreen";
import BattleScreen from "@/components/screens/BattleScreen";
import EncounterResultScreen from "@/components/screens/EncounterResultScreen";
import CourseClearScreen from "@/components/screens/CourseClearScreen";

const PLAYER_MAX_HP = 100;
const WRONG_ANSWER_DAMAGE = 15;
const HEAL_AFTER_MOB = 15;

type Screen =
  | "start"
  | "courseSelect"
  | "lesson"
  | "bossIntro"
  | "battle"
  | "encounterResult"
  | "courseClear";

interface Encounter {
  type: EncounterType;
  data: Mob | Boss;
}

export default function Game() {
  const [screen, setScreen] = useState<Screen>("start");

  // progress 用 lazy initializer 讀取：SSR 階段 window 不存在，先給 null；
  // 客戶端 hydrate 時才真正讀 localStorage。這樣不用在 effect 裡呼叫
  // setState，也不會在讀檔完成前用空物件把舊存檔覆蓋掉。
  const [progress, setProgress] = useState<Progress | null>(() =>
    typeof window === "undefined" ? null : loadProgress()
  );

  const [courseId, setCourseId] = useState<string | null>(null);
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [player, setPlayer] = useState({ hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP });
  const [enemy, setEnemy] = useState({ hp: 0, maxHp: 0 });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);
  const [lastLog, setLastLog] = useState("");
  const [lastExplain, setLastExplain] = useState("");
  const [encounterOutcome, setEncounterOutcome] = useState<"win" | "lose" | null>(null);

  useEffect(() => {
    if (progress !== null) saveProgress(progress);
  }, [progress]);

  const safeProgress = progress ?? {};

  function enterEncounter(type: EncounterType, data: Mob | Boss) {
    setEncounter({ type, data });
    setEnemy({ hp: data.hp, maxHp: data.hp });
    setQuestionIndex(0);
    setLastResult(null);
    setLastLog("");
    setLastExplain("");
    setEncounterOutcome(null);
    setScreen(type === "mob" ? "lesson" : "bossIntro");
  }

  function startCourse(id: string) {
    const course = findCourse(id);
    if (!course) return;
    const cp = getCourseProgress(safeProgress, id);

    setCourseId(id);
    setPlayer({ hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP });

    const nextMob = course.mobs.find((m) => !cp.mobsCleared.includes(m.id));
    if (nextMob) {
      enterEncounter("mob", nextMob);
    } else {
      enterEncounter("boss", course.boss);
    }
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
    const cp = getCourseProgress(safeProgress, courseId);

    if (encounter.type === "mob") {
      const mob = encounter.data as Mob;
      const mobsCleared = cp.mobsCleared.includes(mob.id)
        ? cp.mobsCleared
        : [...cp.mobsCleared, mob.id];

      setProgress({
        ...safeProgress,
        [courseId]: { ...cp, mobsCleared },
      });

      const nextMob = course.mobs.find((m) => !mobsCleared.includes(m.id));
      if (nextMob) {
        setPlayer((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + HEAL_AFTER_MOB) }));
        enterEncounter("mob", nextMob);
      } else {
        // 打完所有小怪，戰前全滿血再挑戰大魔王
        setPlayer((prev) => ({ ...prev, hp: prev.maxHp }));
        enterEncounter("boss", course.boss);
      }
    } else {
      setProgress({
        ...safeProgress,
        [courseId]: { ...cp, bossCleared: true },
      });
      setScreen("courseClear");
    }
  }

  function retryEncounter() {
    if (!encounter) return;
    setPlayer((prev) => ({ ...prev, hp: Math.max(prev.hp, Math.ceil(prev.maxHp * 0.5)) }));
    enterEncounter(encounter.type, encounter.data);
  }

  function backToCourseSelect() {
    setCourseId(null);
    setEncounter(null);
    setScreen("courseSelect");
  }

  switch (screen) {
    case "start":
      return <StartScreen onStart={() => setScreen("courseSelect")} />;

    case "courseSelect":
      return (
        <CourseSelectScreen
          progress={safeProgress}
          onStartCourse={startCourse}
          onBack={() => setScreen("start")}
        />
      );

    case "lesson":
      if (!encounter) return null;
      return <LessonScreen mob={encounter.data as Mob} onBeginBattle={beginBattle} />;

    case "bossIntro":
      if (!encounter) return null;
      return <BossIntroScreen boss={encounter.data as Boss} onBeginBattle={beginBattle} />;

    case "battle":
      if (!encounter) return null;
      return (
        <BattleScreen
          enemyData={encounter.data}
          isBoss={encounter.type === "boss"}
          questionIndex={questionIndex}
          player={player}
          enemy={enemy}
          lastResult={lastResult}
          lastLog={lastLog}
          lastExplain={lastExplain}
          onAnswer={answerQuestion}
          onProceed={proceedAfterAnswer}
        />
      );

    case "encounterResult":
      if (!encounter || !encounterOutcome) return null;
      return (
        <EncounterResultScreen
          outcome={encounterOutcome}
          enemyName={encounter.data.name}
          onAfterWin={afterWin}
          onRetry={retryEncounter}
          onBackToCourseSelect={backToCourseSelect}
        />
      );

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
