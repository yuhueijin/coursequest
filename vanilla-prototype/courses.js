/**
 * ============================================================
 * 課程資料檔 (courses.js)
 * ============================================================
 * 這裡定義所有「課程 = 大魔王關卡」的內容。
 * 之後要加新課程，只要在 COURSES 陣列裡新增一個物件即可，
 * game.js 完全不用改。
 *
 * 資料結構說明：
 *
 * course = {
 *   id: 唯一代碼 (英數，勿重複)
 *   title: 課程名稱（顯示在關卡選單）
 *   description: 一句話簡介
 *   requires: 需要先破關的 courseId（沒有就填 null，代表一開始就解鎖）
 *   mobs: [ 小怪們，依序打 ]
 *     mob = {
 *       id, name, hp,
 *       lesson: { title, content }   // 打之前先教一小段知識
 *       questions: [ { q, options[], answer(索引), moveName, explain } ]
 *     }
 *   boss: {
 *     name, hp, intro,
 *     questions: [ 同上，通常混合這個課程教過的所有觀念 ]
 *   }
 * }
 * ============================================================
 */

const COURSES = [
  {
    id: "js-basics",
    title: "JavaScript 新手村",
    description: "變數、條件判斷、迴圈——寫程式的第一哩路。",
    requires: null,
    mobs: [
      {
        id: "mob-variable",
        name: "變數史萊姆",
        hp: 20,
        lesson: {
          title: "什麼是變數？",
          content:
            "變數就像一個貼了標籤的箱子，用來存放資料。\n" +
            "在 JavaScript 中，用 let 宣告「之後可以改變」的變數，\n" +
            "用 const 宣告「之後不能重新賦值」的常數。\n\n" +
            "例如：let score = 10;  // score 現在是 10",
        },
        questions: [
          {
            q: "下列何者是正確宣告變數的方式？",
            options: ["let score = 10;", "score := 10;", "int score = 10;"],
            answer: 0,
            moveName: "宣告斬",
            explain: "JavaScript 用 let / const / var 加上變數名稱與 = 來宣告變數。",
          },
          {
            q: "用 const 宣告的變數，之後可以重新賦值嗎？",
            options: ["可以", "不可以", "看心情"],
            answer: 1,
            moveName: "常數盾擊",
            explain: "const 代表「常數」，一旦賦值後就不能再指定新的值。",
          },
        ],
      },
      {
        id: "mob-condition",
        name: "條件狗頭人",
        hp: 25,
        lesson: {
          title: "if / else 條件判斷",
          content:
            "程式需要「做決定」的時候就用 if / else。\n\n" +
            "if (age >= 18) {\n  // 滿 18 歲要做的事\n} else {\n  // 沒滿 18 歲要做的事\n}\n\n" +
            "如果條件有很多種，可以用 else if 串接多個判斷。",
        },
        questions: [
          {
            q: "想在 age >= 18 時才允許投票，應該怎麼寫？",
            options: [
              "if (age >= 18) { allowVote(); }",
              "if (age = 18) { allowVote(); }",
              "while (age >= 18) { allowVote(); }",
            ],
            answer: 0,
            moveName: "邏輯斬",
            explain: "判斷相等要用 ===（比較），單一個 = 是「賦值」，跟判斷條件是兩回事。",
          },
          {
            q: "當有三種以上的情況要分別處理，通常會用？",
            options: ["for 迴圈", "else if 串接", "宣告更多變數"],
            answer: 1,
            moveName: "多重連擊",
            explain: "if / else if / else if / ... / else 可以依序檢查多種條件。",
          },
        ],
      },
      {
        id: "mob-loop",
        name: "迴圈骷髏",
        hp: 30,
        lesson: {
          title: "for 迴圈",
          content:
            "想要「重複做同一件事」，就用迴圈。\n\n" +
            "for (let i = 0; i < 5; i++) {\n  console.log(i);\n}\n\n" +
            "這段程式會印出 0,1,2,3,4，總共執行 5 次。\n" +
            "想提早結束迴圈，可以用 break。",
        },
        questions: [
          {
            q: "for (let i = 0; i < 5; i++) { ... } 這段迴圈總共會執行幾次？",
            options: ["5 次", "4 次", "6 次"],
            answer: 0,
            moveName: "五連斬",
            explain: "i 從 0 開始，只要 i < 5 就繼續，所以是 0,1,2,3,4 共 5 次。",
          },
          {
            q: "想要提早跳出迴圈，該用哪個關鍵字？",
            options: ["break", "stop", "exit"],
            answer: 0,
            moveName: "斷鎖擊",
            explain: "break 會立即中止最近的迴圈，繼續執行迴圈之後的程式碼。",
          },
        ],
      },
    ],
    boss: {
      name: "邏輯混沌魔王",
      hp: 100,
      intro:
        "邏輯混沌魔王融合了變數、條件、迴圈三種力量。\n" +
        "只有真正理解這三個觀念的人，才能將它擊敗！",
      questions: [
        {
          q: "下列何者是合法的變數宣告？",
          options: ["let total = 0;", "let 0total = ;", "total == 0"],
          answer: 0,
          moveName: "宣告斬・奧義",
          explain: "變數名稱不能用數字開頭，且宣告要有 = 賦值。",
        },
        {
          q: "想在數字大於 10 時印出「大」，否則印出「小」，該用什麼？",
          options: ["for 迴圈", "if / else", "只用 const"],
          answer: 1,
          moveName: "邏輯斬・奧義",
          explain: "有兩種互斥結果要選一種執行，就是 if / else 的典型情境。",
        },
        {
          q: "for (let i = 0; i < 3; i++) { console.log('hi'); } 會印出幾次 'hi'？",
          options: ["3 次", "2 次", "無限次"],
          answer: 0,
          moveName: "五連斬・奧義",
          explain: "i = 0,1,2 都小於 3，所以印出 3 次。",
        },
        {
          q: "break 在迴圈中的作用是？",
          options: ["跳出迴圈", "重新開始迴圈", "宣告新變數"],
          answer: 0,
          moveName: "斷鎖擊・奧義",
          explain: "break 會立刻結束目前的迴圈。",
        },
        {
          q: "用 const 宣告後，可以重新賦值嗎？",
          options: ["可以", "不可以", "只有數字可以"],
          answer: 1,
          moveName: "常數盾擊・奧義",
          explain: "const 宣告的變數不能重新賦值，這是它與 let 最大的差別。",
        },
      ],
    },
  },

  {
    id: "js-functions-arrays",
    title: "函式與陣列秘境",
    description: "把重複的邏輯包成函式，把一堆資料整理進陣列。",
    requires: "js-basics",
    mobs: [
      {
        id: "mob-function",
        name: "函式哥布林",
        hp: 25,
        lesson: {
          title: "什麼是函式？",
          content:
            "函式是一段「可以重複呼叫」的程式碼包。\n\n" +
            "function sayHi(name) {\n  return '哈囉，' + name;\n}\n\n" +
            "sayHi('小明') 會回傳 '哈囉，小明'。\n" +
            "括號裡的 name 叫做「參數」，是傳進函式讓它使用的資料。",
        },
        questions: [
          {
            q: "function sayHi(){ return 'hi'; }  執行 sayHi() 會得到什麼？",
            options: ["'hi'", "sayHi", "undefined"],
            answer: 0,
            moveName: "呼叫擊",
            explain: "函式執行到 return 時，會把後面的值回傳給呼叫它的地方。",
          },
          {
            q: "函式括號裡的「參數」是用來做什麼的？",
            options: [
              "傳入資料給函式內部使用",
              "宣告全域變數",
              "產生迴圈",
            ],
            answer: 0,
            moveName: "參數突刺",
            explain: "參數就像函式的輸入，讓同一段邏輯可以套用在不同的資料上。",
          },
        ],
      },
      {
        id: "mob-array",
        name: "陣列蜘蛛",
        hp: 25,
        lesson: {
          title: "什麼是陣列？",
          content:
            "陣列是一串排好順序的資料。\n\n" +
            "let fruits = ['蘋果', '香蕉', '橘子'];\n\n" +
            "fruits[0] 是第一個元素 '蘋果'（索引從 0 開始）。\n" +
            "fruits.length 會得到陣列的長度，也就是 3。",
        },
        questions: [
          {
            q: "let arr = [1, 2, 3];  arr.length 的結果是？",
            options: ["3", "2", "4"],
            answer: 0,
            moveName: "計數擊",
            explain: "陣列有 3 個元素，所以 length 是 3。",
          },
          {
            q: "陣列的索引（index）是從幾開始算的？",
            options: ["0", "1", "-1"],
            answer: 0,
            moveName: "索引突刺",
            explain: "JavaScript（以及大多數語言）的陣列索引都是從 0 開始。",
          },
        ],
      },
    ],
    boss: {
      name: "資料結構九頭蛇",
      hp: 80,
      intro:
        "九頭蛇的每顆頭都藏著一段函式與陣列的考驗，\n" +
        "唯有融會貫通，才能一次斬斷牠所有的頭！",
      questions: [
        {
          q: "function add(a, b) { return a + b; }  add(2, 3) 會回傳？",
          options: ["5", "23", "undefined"],
          answer: 0,
          moveName: "呼叫擊・奧義",
          explain: "a=2, b=3，return a + b 就是 2 + 3 = 5。",
        },
        {
          q: "let nums = [10, 20, 30];  nums[1] 是？",
          options: ["10", "20", "30"],
          answer: 1,
          moveName: "索引突刺・奧義",
          explain: "索引從 0 開始，所以 nums[1] 是第二個元素 20。",
        },
        {
          q: "想把陣列中每個元素都印出來，最常見的做法是？",
          options: [
            "用 for 迴圈搭配陣列索引",
            "只印 arr[0]",
            "宣告更多變數",
          ],
          answer: 0,
          moveName: "連環突刺",
          explain: "搭配 for (let i = 0; i < arr.length; i++) 可以走訪整個陣列。",
        },
        {
          q: "函式最主要的好處是？",
          options: [
            "避免重複寫同樣的邏輯，方便重複使用",
            "讓程式變慢",
            "取代所有變數",
          ],
          answer: 0,
          moveName: "呼叫擊・究極",
          explain: "把邏輯包成函式後，只要呼叫就能重複使用，不用複製貼上。",
        },
      ],
    },
  },
];
