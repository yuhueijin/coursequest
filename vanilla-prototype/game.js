/**
 * ============================================================
 * 遊戲引擎 (game.js)
 * ============================================================
 * 負責：畫面渲染、戰鬥邏輯、進度存檔 (localStorage)。
 * 內容資料一律來自 courses.js 的 COURSES 陣列。
 * ============================================================
 */

const SAVE_KEY = "coursequest_progress_v1";
const PLAYER_MAX_HP = 100;
const WRONG_ANSWER_DAMAGE = 15;
const HEAL_AFTER_MOB = 15;

const app = document.getElementById("app");

/** ------------------------------------------------------------
 * 全域遊戲狀態
 * ------------------------------------------------------------ */
let state = {
  screen: "start", // start | courseSelect | lesson | battle | encounterResult | courseClear | gameover
  courseId: null,
  encounter: null, // { type: 'mob'|'boss', index: number, data: mob/boss物件 }
  player: { hp: PLAYER_MAX_HP, maxHp: PLAYER_MAX_HP },
  enemy: { hp: 0, maxHp: 0 },
  questionIndex: 0,
  lastResult: null, // 'correct' | 'wrong'
  lastLog: "",
  encounterOutcome: null, // 'win' | 'lose'
};

let progress = loadProgress();

/** ------------------------------------------------------------
 * 進度存檔 / 讀檔
 * ------------------------------------------------------------ */
function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("讀取存檔失敗", e);
  }
  return {}; // { courseId: { mobsCleared: [id,...], bossCleared: bool } }
}

function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
}

function getCourseProgress(courseId) {
  if (!progress[courseId]) {
    progress[courseId] = { mobsCleared: [], bossCleared: false };
  }
  return progress[courseId];
}

function isCourseUnlocked(course) {
  if (!course.requires) return true;
  return !!progress[course.requires]?.bossCleared;
}

/** ------------------------------------------------------------
 * 畫面切換工具
 * ------------------------------------------------------------ */
function goTo(screen) {
  state.screen = screen;
  render();
}

function findCourse(courseId) {
  return COURSES.find((c) => c.id === courseId);
}

/** ------------------------------------------------------------
 * 開始一個課程（大魔王關卡）
 * ------------------------------------------------------------ */
function startCourse(courseId) {
  state.courseId = courseId;
  state.player.hp = PLAYER_MAX_HP;
  state.player.maxHp = PLAYER_MAX_HP;

  const course = findCourse(courseId);
  const cp = getCourseProgress(courseId);

  // 找第一個還沒破的小怪；如果小怪都破了就直接挑戰 boss
  const nextMob = course.mobs.find((m) => !cp.mobsCleared.includes(m.id));
  if (nextMob) {
    enterEncounter("mob", nextMob);
  } else {
    enterEncounter("boss", course.boss);
  }
}

function enterEncounter(type, data) {
  state.encounter = { type, data };
  state.enemy.hp = data.hp;
  state.enemy.maxHp = data.hp;
  state.questionIndex = 0;
  state.lastResult = null;
  state.lastLog = "";
  state.encounterOutcome = null;

  if (type === "mob") {
    goTo("lesson");
  } else {
    goTo("bossIntro");
  }
}

function beginBattle() {
  goTo("battle");
}

/** ------------------------------------------------------------
 * 回答題目
 * ------------------------------------------------------------ */
function answerQuestion(optionIndex) {
  const q = state.encounter.data.questions[state.questionIndex];
  const correct = optionIndex === q.answer;

  if (correct) {
    const dmg = Math.ceil(state.enemy.maxHp / state.encounter.data.questions.length);
    state.enemy.hp = Math.max(0, state.enemy.hp - dmg);
    state.lastResult = "correct";
    state.lastLog = `✅ 答對了！使出「${q.moveName}」，造成 ${dmg} 點傷害！`;
  } else {
    state.player.hp = Math.max(0, state.player.hp - WRONG_ANSWER_DAMAGE);
    state.lastResult = "wrong";
    state.lastLog = `❌ 答錯了！敵人反擊，你受到 ${WRONG_ANSWER_DAMAGE} 點傷害。`;
  }
  state.lastExplain = q.explain;

  render(); // 先顯示這一題的結果 + 說明，玩家按「繼續」才往下走

}

function proceedAfterAnswer() {
  if (state.player.hp <= 0) {
    state.encounterOutcome = "lose";
    goTo("encounterResult");
    return;
  }
  if (state.enemy.hp <= 0) {
    state.encounterOutcome = "win";
    goTo("encounterResult");
    return;
  }
  state.questionIndex++;
  if (state.questionIndex >= state.encounter.data.questions.length) {
    // 題目出完但雙方都還活著 -> 依剩餘血量判定（理論上敵人血量會在最後一題答對時歸零，這裡是保險）
    state.encounterOutcome = state.enemy.hp <= 0 ? "win" : "lose";
    goTo("encounterResult");
    return;
  }
  state.lastResult = null;
  goTo("battle");
}

/** ------------------------------------------------------------
 * 結算後續處理
 * ------------------------------------------------------------ */
function afterWin() {
  const course = findCourse(state.courseId);
  const cp = getCourseProgress(state.courseId);

  if (state.encounter.type === "mob") {
    if (!cp.mobsCleared.includes(state.encounter.data.id)) {
      cp.mobsCleared.push(state.encounter.data.id);
    }
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + HEAL_AFTER_MOB);
    saveProgress();

    const nextMob = course.mobs.find((m) => !cp.mobsCleared.includes(m.id));
    if (nextMob) {
      enterEncounter("mob", nextMob);
    } else {
      state.player.hp = state.player.maxHp; // 打完全部小怪，戰前全滿血
      enterEncounter("boss", course.boss);
    }
  } else {
    // boss 過了
    cp.bossCleared = true;
    saveProgress();
    goTo("courseClear");
  }
}

function retryEncounter() {
  // 重新挑戰目前這場戰鬥，血量回復一部分，不用整個課程重來
  state.player.hp = Math.max(state.player.hp, Math.ceil(state.player.maxHp * 0.5));
  enterEncounter(state.encounter.type, state.encounter.data);
}

function backToCourseSelect() {
  state.courseId = null;
  state.encounter = null;
  goTo("courseSelect");
}

/** ------------------------------------------------------------
 * 渲染：各畫面
 * ------------------------------------------------------------ */
function render() {
  switch (state.screen) {
    case "start":
      app.innerHTML = renderStart();
      break;
    case "courseSelect":
      app.innerHTML = renderCourseSelect();
      break;
    case "lesson":
      app.innerHTML = renderLesson();
      break;
    case "bossIntro":
      app.innerHTML = renderBossIntro();
      break;
    case "battle":
      app.innerHTML = renderBattle();
      break;
    case "encounterResult":
      app.innerHTML = renderEncounterResult();
      break;
    case "courseClear":
      app.innerHTML = renderCourseClear();
      break;
  }
}

function hpBar(cur, max, colorClass) {
  const pct = Math.max(0, Math.round((cur / max) * 100));
  return `
    <div class="hpbar">
      <div class="hpbar-fill ${colorClass}" style="width:${pct}%"></div>
      <span class="hpbar-label">${cur} / ${max}</span>
    </div>
  `;
}

function renderStart() {
  return `
    <div class="screen center">
      <h1 class="title">📖 課程冒險 CourseQuest</h1>
      <p class="subtitle">把課程變成關卡，把知識變成招式。<br/>打倒小怪學觀念，擊敗大魔王證明你學會了！</p>
      <button class="btn btn-primary" data-action="goCourseSelect">開始遊戲</button>
    </div>
  `;
}

function renderCourseSelect() {
  const cards = COURSES.map((course) => {
    const unlocked = isCourseUnlocked(course);
    const cp = getCourseProgress(course.id);
    const mobsDone = cp.mobsCleared.length;
    const mobsTotal = course.mobs.length;
    const bossDone = cp.bossCleared;

    const statusText = !unlocked
      ? `🔒 需先破關「${findCourse(course.requires).title}」`
      : bossDone
      ? "🏆 已通關"
      : `小怪 ${mobsDone}/${mobsTotal}｜大魔王 ${bossDone ? "已擊敗" : "未挑戰"}`;

    return `
      <div class="course-card ${unlocked ? "" : "locked"}">
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <p class="status">${statusText}</p>
        ${
          unlocked
            ? `<button class="btn btn-primary" data-action="startCourse" data-course="${course.id}">
                ${bossDone ? "重新挑戰" : "進入關卡"}
               </button>`
            : `<button class="btn btn-disabled" disabled>尚未解鎖</button>`
        }
      </div>
    `;
  }).join("");

  return `
    <div class="screen">
      <h2>選擇課程關卡</h2>
      <div class="course-list">${cards}</div>
      <button class="btn btn-ghost" data-action="goStart">← 回主畫面</button>
    </div>
  `;
}

function renderLesson() {
  const mob = state.encounter.data;
  return `
    <div class="screen center">
      <div class="lesson-card">
        <p class="eyebrow">遭遇小怪：${mob.name}</p>
        <h2>${mob.lesson.title}</h2>
        <p class="lesson-content">${escapeHtml(mob.lesson.content)}</p>
        <button class="btn btn-primary" data-action="beginBattle">學會了，開打！</button>
      </div>
    </div>
  `;
}

function renderBossIntro() {
  const boss = state.encounter.data;
  return `
    <div class="screen center">
      <div class="lesson-card boss-intro">
        <p class="eyebrow">⚔️ 大魔王現身</p>
        <h2>${boss.name}</h2>
        <p class="lesson-content">${escapeHtml(boss.intro)}</p>
        <button class="btn btn-danger" data-action="beginBattle">挑戰大魔王！</button>
      </div>
    </div>
  `;
}

function renderBattle() {
  const enemyData = state.encounter.data;
  const isBoss = state.encounter.type === "boss";
  const q = enemyData.questions[state.questionIndex];

  const resultBlock = state.lastResult
    ? `
      <div class="result-banner ${state.lastResult}">
        <p>${state.lastLog}</p>
        <p class="explain">💡 ${escapeHtml(state.lastExplain)}</p>
        <button class="btn btn-primary" data-action="proceedAfterAnswer">繼續</button>
      </div>
    `
    : "";

  const optionsBlock = state.lastResult
    ? ""
    : `
      <div class="options">
        ${q.options
          .map(
            (opt, i) =>
              `<button class="btn btn-option" data-action="answer" data-index="${i}">${escapeHtml(
                opt
              )}</button>`
          )
          .join("")}
      </div>
    `;

  return `
    <div class="screen">
      <div class="battle-header">
        <div class="combatant">
          <p class="name">🧑 你</p>
          ${hpBar(state.player.hp, state.player.maxHp, "hp-player")}
        </div>
        <div class="vs">VS</div>
        <div class="combatant">
          <p class="name">${isBoss ? "👹" : "👾"} ${enemyData.name}</p>
          ${hpBar(state.enemy.hp, state.enemy.maxHp, isBoss ? "hp-boss" : "hp-mob")}
        </div>
      </div>

      <div class="question-card">
        <p class="eyebrow">第 ${state.questionIndex + 1} / ${enemyData.questions.length} 題</p>
        <h3>${escapeHtml(q.q)}</h3>
        ${optionsBlock}
      </div>

      ${resultBlock}
    </div>
  `;
}

function renderEncounterResult() {
  const win = state.encounterOutcome === "win";
  const enemyName = state.encounter.data.name;

  if (win) {
    return `
      <div class="screen center">
        <div class="result-card win">
          <h2>🎉 擊敗了 ${enemyName}！</h2>
          <p>知識轉化成了力量。</p>
          <button class="btn btn-primary" data-action="afterWin">繼續前進</button>
        </div>
      </div>
    `;
  }
  return `
    <div class="screen center">
      <div class="result-card lose">
        <h2>💀 你被 ${enemyName} 擊倒了</h2>
        <p>再複習一下剛剛的觀念，重新挑戰吧！</p>
        <button class="btn btn-danger" data-action="retryEncounter">再挑戰一次</button>
        <button class="btn btn-ghost" data-action="goCourseSelect">回關卡選單</button>
      </div>
    </div>
  `;
}

function renderCourseClear() {
  const course = findCourse(state.courseId);
  return `
    <div class="screen center">
      <div class="result-card win">
        <h2>🏆 課程通關：${course.title}</h2>
        <p>你已經掌握了這個單元的所有知識！</p>
        <button class="btn btn-primary" data-action="goCourseSelect">回關卡選單</button>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML.replace(/\n/g, "<br/>");
}

/** ------------------------------------------------------------
 * 事件委派：所有按鈕透過 data-action 觸發
 * ------------------------------------------------------------ */
app.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;

  switch (action) {
    case "goCourseSelect":
      goTo("courseSelect");
      break;
    case "goStart":
      goTo("start");
      break;
    case "startCourse":
      startCourse(btn.dataset.course);
      break;
    case "beginBattle":
      beginBattle();
      break;
    case "answer":
      answerQuestion(Number(btn.dataset.index));
      break;
    case "proceedAfterAnswer":
      proceedAfterAnswer();
      break;
    case "afterWin":
      afterWin();
      break;
    case "retryEncounter":
      retryEncounter();
      break;
  }
});

/** ------------------------------------------------------------
 * 啟動
 * ------------------------------------------------------------ */
render();
