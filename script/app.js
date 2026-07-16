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
    const setActive = (chip) => {
      chips.forEach((c) => c.setAttribute("aria-current", "false"));
      if (chip) chip.setAttribute("aria-current", "true");
    };
    // 클릭 즉시 활성화 + 스크롤 정착 동안 스파이 억제(섹션이 세로로 겹쳐도 바로 반응)
    let spyLock = 0;
    const prefersReducedNav = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"), 10) || 64;
    const jumpNavEl = document.querySelector(".jump-nav");
    // 점프 내비를 JS로 직접 스크롤 처리:
    //  · #game/#weather 는 position:sticky 사이드바 '안'에 있어 기본 앵커 점프가
    //    고정되며 움직이는 대상을 쫓아 '슬금슬금' 밀리고, 페이지 하단에선 아예 못 감.
    //  · 클릭 순간의 실측 위치(getBoundingClientRect)로 목적지를 한 번에 계산 → 창 스크롤.
    //  · 더 내려갈 데가 없으면(하단) 대상 위젯을 잠깐 하이라이트해 눌린 걸 알림.
    chips.forEach((c) => {
      c.addEventListener("click", (e) => {
        const id = (c.getAttribute("href") || "").slice(1);
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        setActive(c); spyLock = Date.now() + 900;
        const offset = navH + (jumpNavEl ? jumpNavEl.offsetHeight : 0) + 14;
        const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const dest = Math.max(0, Math.min(window.scrollY + el.getBoundingClientRect().top - offset, max));
        window.scrollTo({ top: dest, behavior: prefersReducedNav ? "auto" : "smooth" });
        history.replaceState(null, "", "#" + id);
        // 스크롤이 거의 없을 때(이미 그 자리·하단)도 피드백: 위젯 잠깐 강조
        el.classList.remove("is-jumped");
        void el.offsetWidth; // 리플로우 강제 → 애니메이션 재시작
        el.classList.add("is-jumped");
      });
    });
    const spy = new IntersectionObserver(
      (entries) => {
        if (Date.now() < spyLock) return; // 클릭 직후엔 관찰자가 덮어쓰지 않음
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(byId[en.target.id]);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    targets.forEach((t) => spy.observe(t));
  }

  /* ---- 6.5) 점프 내비 '고정' 감지 → 고정될 때만 배경 부여 -------- */
  // 평소(문서 흐름)엔 투명해서 모눈 배경 위에 빈 박스가 안 보이고,
  // 스크롤로 상단에 sticky 고정되면 .is-stuck 로 프로스티드 배경을 줘
  // 아래 콘텐츠가 칩 사이로 비쳐 보이지 않게 한다.
  const jumpNav = document.querySelector(".jump-nav");
  if (jumpNav && "IntersectionObserver" in window) {
    const stickyTop = parseInt(getComputedStyle(jumpNav).top, 10) || 0;
    const stuckIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          jumpNav.classList.toggle("is-stuck", en.intersectionRatio < 1);
        });
      },
      { rootMargin: "-" + (stickyTop + 1) + "px 0px 0px 0px", threshold: [1] }
    );
    stuckIO.observe(jumpNav);
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
