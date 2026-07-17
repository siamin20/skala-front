/* =====================================================================
   grade.js — 성적 계산기
   · subjects 배열의 각 과목 점수를 for 문으로 합산(total) → 평균 계산.
   · 60점 이상 합격, 평균으로 등급(A/B/C/D/F) 산정.
   · <dialog>+입력폼+<meter>로 리메이크(기본 경로)하고, 교재 방식(prompt/for/alert)은
     classicGrade()에 실제 실행 코드로 남겨 '교재 방식' 버튼에 연결한다.
   ===================================================================== */
(function () {
  "use strict";

  var subjects = ["HTML", "CSS", "JavaScript"]; // 과제 지정 3과목
  var openBtn = document.querySelector("[data-grade-open]");
  var dialog = document.getElementById("gradeDialog");
  if (!openBtn || !dialog) return;

  var form = dialog.querySelector("[data-grade-form]");
  var result = dialog.querySelector("[data-grade-result]");
  var calcBtn = dialog.querySelector("[data-grade-calc]");
  var resetBtn = dialog.querySelector("[data-grade-reset]");
  var closeBtn = dialog.querySelector("[data-grade-close]");
  var classicBtn = dialog.querySelector("[data-grade-classic]");

  // ── 교재 방식(prompt/for/alert) — 실제 실행되는 코드 ──
  function classicGrade() {
    var total = 0;                                   // 총점
    for (var i = 0; i < subjects.length; i++) {      // 과목 수만큼 반복 입력
      var input = prompt(subjects[i] + " 점수를 입력하세요.");
      if (input === null) return;                    // '취소' → 종료 (null 먼저 체크!)
      total += Number(input) || 0;                   // 빈값·숫자 아님은 0점 처리 후 합산
    }
    var avg = total / subjects.length;               // 평균
    var avgText = Math.round(avg * 10) / 10;          // 소수 1자리로 깔끔하게
    var pass = avg >= 60 ? "합격" : "불합격";
    alert("총점: " + total + "점, 평균: " + avgText + "점, 등급: " + toGrade(avg) + ", 결과: " + pass + "입니다!");
  }

  // 평균 → 등급 (강의록 "등급을 정한다")
  function toGrade(avg) {
    if (avg >= 90) return "A";
    if (avg >= 80) return "B";
    if (avg >= 70) return "C";
    if (avg >= 60) return "D";
    return "F";
  }

  // subjects 배열로 입력 행을 동적 생성 (과목명 + 점수 input + meter)
  function buildRows() {
    form.innerHTML = "";
    subjects.forEach(function (name, i) {
      var row = document.createElement("div");
      row.className = "grade-row";
      var id = "grade-" + i;
      row.innerHTML =
        '<label for="' + id + '">' + name + "</label>" +
        '<input class="input" id="' + id + '" type="number" min="0" max="100" ' +
        'inputmode="numeric" placeholder="0~100" data-score />' +
        '<meter min="0" max="100" value="0" data-score-meter></meter>';
      form.appendChild(row);
    });
    // 입력하는 즉시 각 과목 meter 반영
    form.querySelectorAll("[data-score]").forEach(function (input) {
      input.addEventListener("input", function () {
        var m = input.parentNode.querySelector("[data-score-meter]");
        var v = clamp(Number(input.value));
        m.value = v;
      });
    });
  }

  function clamp(n) {
    if (isNaN(n)) return 0;
    return Math.min(100, Math.max(0, n));
  }

  function calculate() {
    var inputs = form.querySelectorAll("[data-score]");
    var total = 0;           // 합계
    var filled = 0;
    var lines = [];
    // for 문으로 각 과목 점수 합산
    for (var i = 0; i < inputs.length; i++) {
      var v = clamp(Number(inputs[i].value));
      if (inputs[i].value !== "") filled++;
      total += v;
      lines.push({ name: subjects[i], score: v });
    }
    if (filled === 0) {
      result.hidden = false;
      result.dataset.state = "warn";
      result.innerHTML = "점수를 먼저 입력해 주세요.";
      return;
    }

    var avg = total / subjects.length;
    var pass = avg >= 60;
    var grade = toGrade(avg);

    var rowsHtml = lines.map(function (l) {
      return '<li><span>' + l.name + "</span><b>" + l.score + "</b></li>";
    }).join("");

    result.hidden = false;
    result.dataset.state = pass ? "pass" : "fail";
    result.innerHTML =
      '<ul class="grade-scores">' + rowsHtml + "</ul>" +
      '<div class="grade-avg">' +
        '<span class="grade-avg__label">평균</span>' +
        '<span class="grade-avg__num">' + avg.toFixed(1) + "</span>" +
        '<span class="grade-badge" data-grade="' + grade + '">' + grade + "</span>" +
      "</div>" +
      '<meter class="grade-avg__meter" min="0" max="100" low="60" high="80" optimum="100" value="' + avg + '"></meter>' +
      '<p class="grade-verdict">' + (pass ? "🎉 합격이에요 (60점 이상)" : "😢 아쉽게 불합격 (60점 미만)") + "</p>";
  }

  function reset() {
    buildRows();
    result.hidden = true;
    result.innerHTML = "";
    result.dataset.state = "";
  }

  openBtn.addEventListener("click", function () {
    reset();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    var first = form.querySelector("[data-score]");
    if (first) first.focus();
  });

  calcBtn.addEventListener("click", calculate);
  resetBtn.addEventListener("click", reset);
  closeBtn.addEventListener("click", function () { dialog.close(); });
  if (classicBtn) classicBtn.addEventListener("click", classicGrade); // 교재 방식 실행
  dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });

  buildRows(); // 초기 1회
})();
