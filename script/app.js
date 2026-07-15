/* =====================================================================
   app.js — 사이트 공통 인터랙션 (전체 관통 기능)
   모바일 네비 토글 / 현재 페이지 활성화 / 스크롤 등장 /
   맨 위로 버튼 / 현재 연도 / 토스트 헬퍼
   접근성: 키보드 지원, prefers-reduced-motion 존중, aria 갱신
   ===================================================================== */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 1) 모바일 네비 토글 -------------------------------------- */
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  if (nav && navToggle) {
    const closeNav = () => {
      nav.dataset.open = "false";
      navToggle.setAttribute("aria-expanded", "false");
    };
    navToggle.addEventListener("click", () => {
      const open = nav.dataset.open === "true";
      nav.dataset.open = String(!open);
      navToggle.setAttribute("aria-expanded", String(!open));
    });
    // 링크 클릭·ESC·바깥 클릭 시 닫기
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) closeNav(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });
  }

  /* ---- 2) 현재 페이지 네비 활성화 ------------------------------- */
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__link").forEach((link) => {
    const target = (link.getAttribute("href") || "").split("/").pop();
    if (target === here) link.setAttribute("aria-current", "page");
  });

  /* ---- 3) 스크롤 진입 애니메이션 -------------------------------- */
  const revealables = document.querySelectorAll(".reveal, .stagger");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => (el.dataset.visible = "true"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.dataset.visible = "true";
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealables.forEach((el) => io.observe(el));
  }

  /* ---- 4) 맨 위로 버튼 ------------------------------------------ */
  const toTop = document.querySelector("[data-to-top]");
  if (toTop) {
    const onScroll = () => (toTop.dataset.show = String(window.scrollY > 500));
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" })
    );
  }

  /* ---- 5) 푸터 현재 연도 ---------------------------------------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---- 6) 점프 내비 스크롤 추적 (scrollspy) --------------------- */
  const chips = $$(".jump-nav .chip");
  if (chips.length && "IntersectionObserver" in window) {
    const byId = {};
    chips.forEach((c) => { byId[c.getAttribute("href").slice(1)] = c; });
    const targets = Object.keys(byId).map((id) => document.getElementById(id)).filter(Boolean);
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            chips.forEach((c) => c.setAttribute("aria-current", "false"));
            byId[en.target.id] && byId[en.target.id].setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    targets.forEach((t) => spy.observe(t));
  }
  function $$(s, r = document) { return Array.prototype.slice.call(r.querySelectorAll(s)); }

  /* ---- 7) 토스트 헬퍼 (전역 노출) ------------------------------- */
  let toastEl = null, toastTimer = null;
  window.showToast = function (msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.dataset.show = "true";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toastEl.dataset.show = "false"), 2600);
  };
})();
