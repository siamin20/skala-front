/* =====================================================================
   dino.js — 공룡 달리기 (크롬 오프라인 게임 오마주)
   · <canvas> 순수 JS 구현: requestAnimationFrame 게임 루프 + 중력/점프 물리 +
     선인장 장애물 생성 + AABB 충돌 판정 + 최고 점수 localStorage 저장.
   · 구글 원본 스프라이트는 저작권이 있어 쓰지 않고, 사각형으로 직접 그린 버전.
   · 조작: 스페이스 / ↑ / 캔버스 클릭·탭 = 점프, 게임오버 후 같은 키 = 재시작.
   ===================================================================== */
(function () {
  "use strict";

  var startBtn = document.querySelector("[data-dino-start]");
  var dialog = document.getElementById("dinoDialog");
  if (!startBtn || !dialog) return;
  var canvas = document.getElementById("dinoCanvas");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var scoreEl = dialog.querySelector("[data-dino-score]");
  var bestEl = dialog.querySelector("[data-dino-best]");
  var hintEl = dialog.querySelector("[data-dino-hint]");
  var closeBtn = dialog.querySelector("[data-dino-close]");

  var W = canvas.width, H = canvas.height;
  var GROUND = H - 20;          // 지면 y
  var GRAVITY = 0.62, JUMP = -10.2;
  var BEST_KEY = "skala-dino-best-v2"; // 점수 기준이 '장애물 통과'로 바뀌어 키 갱신

  var dino, obs, speed, score, best, spawnIn, tick, over, running, raf, theme;

  function loadBest() { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch (e) { return 0; } }
  function saveBest(v) { try { localStorage.setItem(BEST_KEY, String(v)); } catch (e) {} }

  // 현재 테마 색을 캔버스에 반영 (다크/라이트 대응) — 시작 시 1회 캐시
  function readTheme() {
    var cs = getComputedStyle(document.documentElement);
    var pick = function (v, fb) { var c = cs.getPropertyValue(v).trim(); return c || fb; };
    theme = {
      ink: pick("--ink", "#1c1f36"),
      cactus: pick("--accent-2", "#0d9488"),
      line: pick("--border-strong", "#c9ccd8"),
      eye: pick("--surface", "#ffffff")
    };
  }

  function reset() {
    dino = { x: 40, w: 26, h: 30, y: GROUND - 30, vy: 0, onGround: true };
    obs = [];
    speed = 4.6;
    score = 0;
    spawnIn = 45;
    tick = 0;
    over = false;
    best = loadBest();
    scoreEl.textContent = "0";
    bestEl.textContent = "최고 " + best;
    hintEl.textContent = "스페이스 · 클릭으로 점프";
    hintEl.dataset.state = "";
  }

  function jump() {
    if (over) { reset(); return; }            // 게임오버 후 = 재시작
    if (dino.onGround) { dino.vy = JUMP; dino.onGround = false; }
  }

  function spawnObstacle() {
    var big = Math.random() < 0.35;
    var h = big ? 32 + Math.floor(Math.random() * 8) : 18 + Math.floor(Math.random() * 10);
    var w = big ? 18 : 11 + Math.floor(Math.random() * 8);
    obs.push({ x: W + 8, y: GROUND - h, w: w, h: h });
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function step() {
    tick++;
    // 공룡 물리 (중력 → 낙하 → 착지)
    dino.vy += GRAVITY;
    dino.y += dino.vy;
    if (dino.y + dino.h >= GROUND) { dino.y = GROUND - dino.h; dino.vy = 0; dino.onGround = true; }
    // 난이도 점증
    speed += 0.0022;
    // 장애물 생성 간격 (시간이 지날수록 촘촘 — tick 기준)
    if (--spawnIn <= 0) {
      spawnObstacle();
      spawnIn = Math.max(24, 72 - Math.floor(tick / 480) - Math.floor(Math.random() * 18));
    }
    // 장애물 이동 + 충돌 + 통과 점수
    var box = { x: dino.x + 4, y: dino.y + 4, w: dino.w - 9, h: dino.h - 6 };
    for (var i = obs.length - 1; i >= 0; i--) {
      obs[i].x -= speed;
      if (obs[i].x + obs[i].w < -6) {           // 선인장을 무사히 넘김 → 점수 +1
        obs.splice(i, 1);
        score++;
        scoreEl.textContent = String(score);
        continue;
      }
      if (aabb(box, obs[i])) { endGame(); return; }
    }
  }

  function endGame() {
    over = true;
    if (score > best) { best = score; saveBest(best); bestEl.textContent = "최고 " + best; }
    hintEl.textContent = "게임 오버! 스페이스/클릭으로 다시";
    hintEl.dataset.state = "over";
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // 지면
    ctx.strokeStyle = theme.line; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, GROUND + 1); ctx.lineTo(W, GROUND + 1); ctx.stroke();

    // 공룡(T-Rex): 선 자세로 박스 안에서 그려 점프 시 통째로 이동
    var d = dino;
    var r = function (dx, dy, w, h) { ctx.fillRect(d.x + dx, d.y + dy, w, h); };
    ctx.fillStyle = theme.ink;
    r(-6, 16, 8, 4);          // 꼬리 (왼쪽 아래로 뻗음)
    r(-1, 13, 6, 4);          // 꼬리 뿌리
    r(3, 9, 13, 13);          // 몸통
    r(12, 4, 6, 8);           // 등·목 (머리로 올라가는 경사)
    r(14, 0, 12, 8);          // 머리 (우상단)
    r(26, 4, 3, 3);           // 주둥이
    r(15, 15, 6, 3);          // 앞다리(짧은 팔)
    // 뒷다리 — 박스 하단 기준. 달릴 땐 교차, 점프 중엔 모음
    var footY = d.h - 8;
    if (d.onGround) {
      var swap = Math.floor(tick / 6) % 2 === 0;
      r(4, footY, 5, swap ? 8 : 4);
      r(11, footY, 5, swap ? 4 : 8);
    } else {
      r(5, footY, 5, 6);
      r(11, footY, 5, 6);
    }
    // 눈 (머리에 흰 점)
    ctx.fillStyle = theme.eye;
    r(21, 2, 2, 2);

    // 선인장
    ctx.fillStyle = theme.cactus;
    for (var i = 0; i < obs.length; i++) {
      var o = obs[i];
      ctx.fillRect(o.x, o.y, o.w, o.h);                                   // 기둥
      ctx.fillRect(o.x - 4, o.y + o.h * 0.28, 4, Math.max(4, o.h * 0.28)); // 왼팔
      ctx.fillRect(o.x + o.w, o.y + o.h * 0.45, 4, Math.max(4, o.h * 0.22)); // 오른팔
    }

    if (over) {
      ctx.fillStyle = theme.ink;
      ctx.font = "700 16px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", W / 2, H / 2 - 4);
      ctx.textAlign = "left";
    }
  }

  function frame() {
    if (!running) return;
    if (!over) step();
    draw();
    raf = requestAnimationFrame(frame);
  }

  function startLoop() { running = true; cancelAnimationFrame(raf); frame(); }
  function stopLoop() { running = false; cancelAnimationFrame(raf); }

  // ── 입력 ──
  function onKey(e) {
    if (!dialog.open) return;
    if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); jump(); }
  }
  document.addEventListener("keydown", onKey);
  canvas.addEventListener("pointerdown", function (e) { e.preventDefault(); jump(); });

  startBtn.addEventListener("click", function () {
    readTheme();
    reset();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    canvas.focus();      // 닫기 버튼이 스페이스로 눌리지 않도록 캔버스에 포커스
    startLoop();
  });
  closeBtn.addEventListener("click", function () { dialog.close(); });
  dialog.addEventListener("close", stopLoop);
  dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
})();
