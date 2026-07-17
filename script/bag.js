/* =====================================================================
   bag.js — 내 가방 보기
   · myBag = 소지품 객체({ name, count })들의 배열.
   · showMyBag() 이 반복문으로 목록을 렌더한다(교재: "반복문으로 출력").
   · 교재 원형은 console.log/alert 지만 <dialog> 목록으로 리메이크.
   ===================================================================== */
(function () {
  "use strict";

  // 소지품 객체 배열 (품명 · 개수 · 이모지)
  var myBag = [
    { name: "노트북", count: 1, icon: "💻" },
    { name: "충전기", count: 2, icon: "🔌" },
    { name: "이어폰", count: 1, icon: "🎧" },
    { name: "텀블러", count: 1, icon: "🥤" },
    { name: "필기구", count: 3, icon: "🖊️" },
    { name: "간식", count: 4, icon: "🍫" }
  ];

  var openBtn = document.querySelector("[data-bag-open]");
  var dialog = document.getElementById("bagDialog");
  if (!openBtn || !dialog) return;

  var list = dialog.querySelector("[data-bag-list]");
  var totalEl = dialog.querySelector("[data-bag-total]");
  var closeBtn = dialog.querySelector("[data-bag-close]");
  var classicBtn = dialog.querySelector("[data-bag-classic]");

  // ── 교재 방식(반복문 + alert 출력) — 실제 실행되는 코드 ──
  function showMyBagClassic() {
    var text = "[내 가방 속 물품 목록]\n";
    for (var i = 0; i < myBag.length; i++) {          // 반복문으로 소지품 객체 출력
      text += "· " + myBag[i].name + " : " + myBag[i].count + "개\n";
    }
    alert(text);
  }

  // 반복문으로 가방 내용물 출력 (+ 총 개수 합산)
  function showMyBag() {
    list.innerHTML = "";
    var total = 0;
    for (var i = 0; i < myBag.length; i++) {
      var item = myBag[i];
      total += item.count;
      var li = document.createElement("li");
      li.className = "bag-item";
      li.innerHTML =
        '<span class="bag-item__icon" aria-hidden="true">' + item.icon + "</span>" +
        '<span class="bag-item__name">' + item.name + "</span>" +
        '<span class="bag-item__count">×' + item.count + "</span>";
      list.appendChild(li);
    }
    totalEl.textContent = "총 " + myBag.length + "종 · " + total + "개";
  }
  // 과제 명세 호환: 전역에서도 호출 가능하게 노출
  window.showMyBag = showMyBag;

  openBtn.addEventListener("click", function () {
    showMyBag();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  });
  closeBtn.addEventListener("click", function () { dialog.close(); });
  if (classicBtn) classicBtn.addEventListener("click", showMyBagClassic); // 교재 방식 실행
  dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
})();
