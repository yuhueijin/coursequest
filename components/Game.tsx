"use client";

import { useEffect, useState } from "react";
import { findCourse, findNextEncounter, getEncounterPosition } from "@/lib/courses";
import { getCourseProgress, loadSave, saveSaveData } from "@/lib/progress";
import { SKILLS, findSkill, getLevel } from "@/lib/skills";
import type { Boss, EncounterRef, Mob, SaveData } from "@/lib/types";

import StartScreen from "@/components/screens/StartScreen";
import CourseSelectScreen from "@/components/screens/CourseSelectScreen";
import LessonScreen from "@/components/screens/LessonScreen";
import BossIntroScreen from "@/components/screens/BossIntroScreen";
import BattleScreen from "@/components/screens/BattleScreen";
import EncounterResultScreen from "@/components/screens/EncounterResultScreen";
import CourseClearScreen from "@/components/screens/CourseClearScreen";
import AdventureProgressBar from "@/components/AdventureProgressBar";

const PLAYER_MAX_HP = 100;
const WRONG_ANSWER_DAMAGE = 15;
const HEAL_AFTER_MOB = 15;
const XP_PER_CORRECT = 10;

type Screen =
  | "start"
  | "courseSelect"
  | "lesson"
  | "bossIntro"
  | "battle"
  | "encounterResult"
  | "courseClear";

export default function Game() {
  const [screen, setScreen] = useState<Screen>("start");

  // save 用 lazy initializer 讀取：SSR 階段 window 不存在，先給 null；
  // 客戶端 hydrate 時才真正讀 localStorage。這樣不用在 effect 裡呼叫
  // setState，也不會在讀檔完成前用空物件把舊存檔覆蓋掉。
  const [save, setSave] = useState<SaveData | null>(() =>
    typeof window === "undefined" ? null : loadSave()
  );

  const [courseId, setCourseId] = useState<string | null>(null);
  const [encounter, setEncounter] = useState<EncounterRef | null>(null);
  const [player, setPlayer] = useState({ hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP });
  const [enemy, setEnemy] = useState({ hp: 0, maxHp: 0 });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);
  const [lastLog, setLastLog] = useState("");
  const [lastExplain, setLastExplain] = useState("");
  const [encounterOutcome, setEncounterOutcome] = useState<"win" | "lose" | null>(null);

  useEffect(() => {
    if (save !== null) saveSaveData(save);
  }, [save]);

  const safeSave: SaveData = save ?? { courses: {}, player: { xp: 0, equippedSkillId: null } };

  function enterEncounter(ref: EncounterRef) {
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
      // 小魔王／大魔王是本章節的綜合考驗，開打前一律回滿血，公平重新開始。
      setPlayer((prev) => ({ ...prev, hp: prev.maxHp }));
      setScreen("bossIntro");
    }
  }

  function startCourse(id: string) {
    const course = findCourse(id);
    if (!course) return;
    const cp = getCourseProgress(safeSave, id);

    setCourseId(id);
    setPlayer({ hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP });
    enterEncounter(findNextEncounter(course, cp));
  }

  function beginBattle() {
    setScreen("battle");
  }

  function equipSkill(skillId: string | null) {
    setSave({ ...safeSave, player: { ...safeSave.player, equippedSkillId: skillId } });
  }

  function answerQuestion(optionIndex: number) {
    if (!encounter) return;
    const q = encounter.data.questions[questionIndex];
    const correct = optionIndex === q.answer;

    if (correct) {
      const skill = findSkill(safeSave.player.equippedSkillId);
      const baseDmg = Math.ceil(enemy.maxHp / encounter.data.questions.length);
      const dmg = skill ? Math.ceil(baseDmg * (1 + skill.bonusPct / 100)) : baseDmg;
      setEnemy((prev) => ({ ...prev, hp: Math.max(0, prev.hp - dmg) }));
      setLastResult("correct");

      const prevLevel = getLevel(safeSave.player.xp);
      const newXp = safeSave.player.xp + XP_PER_CORRECT;
      const newLevel = getLevel(newXp);
      setSave({ ...safeSave, player: { ...safeSave.player, xp: newXp } });

      let msg = `✅ 答對了！使出「${q.moveName}」`;
      if (skill) msg += `＋「${skill.name}」技能加成`;
      msg += `，造成 ${dmg} 點傷害！`;
      if (newLevel > prevLevel) {
        const unlockedSkill = SKILLS.find((s) => s.unlockLevel === newLevel);
        msg += ` 🎉 升到 Lv.${newLevel}`;
        if (unlockedSkill) msg += `，解鎖新技能「${unlockedSkill.name}」`;
        msg += "！";
      }
      setLastLog(msg);
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
    const cp = getCourseProgress(safeSave, courseId);

    if (encounter.kind === "mob") {
      const stageId = encounter.stageId!;
      const sp = cp.stages[stageId] ?? { mobsCleared: [], miniBossCleared: false };
      const mob = encounter.data as Mob;
      const mobsCleared = sp.mobsCleared.includes(mob.id) ? sp.mobsCleared : [...sp.mobsCleared, mob.id];
      const newCp = { ...cp, stages: { ...cp.stages, [stageId]: { ...sp, mobsCleared } } };
      const newSave = { ...safeSave, courses: { ...safeSave.courses, [courseId]: newCp } };
      setSave(newSave);

      setPlayer((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + HEAL_AFTER_MOB) }));
      enterEncounter(findNextEncounter(course, newCp));
    } else if (encounter.kind === "miniboss") {
      const stageId = encounter.stageId!;
      const sp = cp.stages[stageId] ?? { mobsCleared: [], miniBossCleared: false };
      const newCp = { ...cp, stages: { ...cp.stages, [stageId]: { ...sp, miniBossCleared: true } } };
      const newSave = { ...safeSave, courses: { ...safeSave.courses, [courseId]: newCp } };
      setSave(newSave);

      enterEncounter(findNextEncounter(course, newCp));
    } else {
      // 大魔王：整個課程通關
      const newCp = { ...cp, finalBossCleared: true };
      const newSave = { ...safeSave, courses: { ...safeSave.courses, [courseId]: newCp } };
      setSave(newSave);
      setScreen("courseClear");
    }
  }

  function retryEncounter() {
    if (!encounter) return;
    setPlayer((prev) => ({ ...prev, hp: Math.max(prev.hp, Math.ceil(prev.maxHp * 0.5)) }));
    enterEncounter(encounter);
  }

  function backToCourseSelect() {
    setCourseId(null);
    setEncounter(null);
    setScreen("courseSelect");
  }

  // 闖關中（教學／Boss介紹／戰鬥／結算）共用的整體進度條，
  // 讓玩家隨時知道現在第幾關、總共幾關、還剩幾個階段。
  function renderAdventureProgress() {
    if (!courseId || !encounter) return null;
    const course = findCourse(courseId);
    if (!course) return null;
    const cp = getCourseProgress(safeSave, courseId);
    const { current, total, stageLabel } = getEncounterPosition(course, cp, encounter);
    return <AdventureProgressBar current={current} total={total} stageLabel={stageLabel} />;
  }

  switch (screen) {
    case "start":
      return <StartScreen onStart={() => setScreen("courseSelect")} />;

    case "courseSelect":
      return (
        <CourseSelectScreen
          save={safeSave}
          onStartCourse={startCourse}
          onEquipSkill={equipSkill}
          onBack={() => setScreen("start")}
        />
      );

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
          <BossIntroScreen
            boss={encounter.data as Boss}
            kind={encounter.kind === "boss" ? "boss" : "miniboss"}
            onBeginBattle={beginBattle}
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
            player={player}
            enemy={enemy}
            equippedSkill={findSkill(safeSave.player.equippedSkillId)}
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
            onBackToCourseSelect={backToCourseSelect}
          />
        </>
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
