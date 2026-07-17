/* =====================================================================
   upDown.js — Up & Down 숫자 맞히기 게임
   · 1~50 사이 Math.random 으로 정답을 정하고, 입력값과 비교해
     크면 "Down!", 작으면 "Up!", 같으면 정답(시도 횟수) 안내.
   · 완성도를 위해 <dialog> 모달로 리메이크(기본 경로)하고,
     교재 방식(prompt/while/alert)은 아래 classicUpDown()에 '실제 실행되는 코드'로
     남겨 '교재 방식으로 하기' 버튼에 연결한다(주석 아님 → 요구 문법 실사용).
   ===================================================================== */
(function () {
  "use strict";

  var startBtn = document.querySelector("[data-game-start]");
  var dialog = document.getElementById("upDownDialog");
  if (!startBtn || !dialog) return;

  var form = dialog.querySelector("[data-ud-form]");
  var input = dialog.querySelector("[data-ud-input]");
  var hint = dialog.querySelector("[data-ud-hint]");
  var log = dialog.querySelector("[data-ud-log]");
  var count = dialog.querySelector("[data-ud-count]");
  var resetBtn = dialog.querySelector("[data-ud-reset]");
  var closeBtn = dialog.querySelector("[data-ud-close]");
  var classicBtn = dialog.querySelector("[data-ud-classic]");

  // ── 교재 방식(prompt/while/alert) — 실제 실행되는 코드 ──
  function classicUpDown() {
    var num = Math.floor(Math.random() * 50) + 1; // 1~50 무작위
    var count = 0, guess;
    while (true) {                                 // 맞출 때까지 반복
      guess = Number(prompt("1~50 사이 숫자를 맞혀보세요"));
      if (isNaN(guess)) return;                    // 취소 시 종료
      count++;
      if (guess > num) alert("Down!");             // 정답보다 크면
      else if (guess < num) alert("Up!");          // 작으면
      else { alert("축하합니다! " + count + "번 만에 맞추셨습니다."); break; }
    }
  }

  var answer, tries, cleared;

  function newGame() {
    answer = Math.floor(Math.random() * 50) + 1; // 1 ~ 50
    tries = 0;
    cleared = false;
    log.innerHTML = "";
    count.textContent = "시도 0회";
    hint.textContent = "숫자를 입력하고 확인을 눌러요.";
    hint.dataset.state = "";
    input.value = "";
    input.disabled = false;
    input.focus();
  }

  // 시도 기록 한 줄 추가 (최근이 위로)
  function addLog(guess, dir) {
    var li = document.createElement("li");
    li.className = "ud-log__item";
    li.dataset.dir = dir; // up | down | hit
    var mark = dir === "hit" ? "✓" : dir === "up" ? "▲" : "▼";
    var word = dir === "hit" ? "정답!" : dir === "up" ? "Up! 더 큰 수" : "Down! 더 작은 수";
    li.innerHTML = '<span class="ud-log__num">' + guess + "</span>" +
      '<span class="ud-log__dir">' + mark + " " + word + "</span>";
    log.insertBefore(li, log.firstChild);
  }

  function guessOnce(value) {
    if (cleared) return;
    // 유효성: 1~50 정수
    if (!Number.isInteger(value) || value < 1 || value > 50) {
      hint.textContent = "1부터 50 사이 숫자만 넣어주세요.";
      hint.dataset.state = "warn";
      return;
    }
    tries++;
    count.textContent = "시도 " + tries + "회";

    if (value > answer) {
      hint.textContent = "Down! ⬇ 더 작은 수예요.";
      hint.dataset.state = "down";
      addLog(value, "down");
    } else if (value < answer) {
      hint.textContent = "Up! ⬆ 더 큰 수예요.";
      hint.dataset.state = "up";
      addLog(value, "up");
    } else {
      hint.textContent = "🎉 정답! " + tries + "번 만에 맞혔어요.";
      hint.dataset.state = "hit";
      addLog(value, "hit");
      cleared = true;
      input.disabled = true;
    }
    input.value = "";
    if (!cleared) input.focus();
  }

  startBtn.addEventListener("click", function () {
    newGame();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", ""); // 아주 옛 브라우저 폴백
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault(); // 기본 제출/닫힘 막고 게임 진행
    guessOnce(Number(input.value));
  });

  resetBtn.addEventListener("click", newGame);
  closeBtn.addEventListener("click", function () { dialog.close(); });
  if (classicBtn) classicBtn.addEventListener("click", classicUpDown); // 교재 방식 실행
  // 배경(백드롭) 클릭 시 닫기
  dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
})();
