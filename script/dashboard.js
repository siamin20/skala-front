/* =====================================================================
   dashboard.js — 온보딩 대시보드 (교육 중 실사용)
   - 오늘의 상태(시계 기반) + 다음 일정 카운트다운
   - 출결 체크리스트 (날짜별 localStorage, 매일 리셋) — 런타임 상호작용용
   - 과정 진도 D-day
   - 복사 버튼 헬퍼
   ※ 민감정보(WiFi/도어락/Zoom)는 코드에 저장하지 않고, 권한이 필요한
     Slack 온보딩 문서로 링크만 제공한다. (Public 저장소 노출 방지)
   ===================================================================== */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = (n) => String(n).padStart(2, "0");
  if (!$("#onboarding")) return;

  /* ------- 교육 일정 설정 (비민감) ------------------------------- */
  const COURSE_START = new Date(2026, 6, 14); // 2026-07-14
  const COURSE_END = new Date(2026, 11, 11);  // 2026-12-11
  const SCHED = { start: 9 * 60, lunchS: 12 * 60, lunchE: 13 * 60 + 10, end: 18 * 60 };
  // 비수업일(공휴일·휴강) — 시간표(schedule.js)와 동일 기준. 이날은 '수업 중'으로 뜨지 않게.
  const HOLIDAYS = {
    "2026-07-17": "제헌절",
    "2026-08-17": "광복절 대체",
    "2026-09-23": "자체 휴강",
    "2026-09-24": "추석 연휴",
    "2026-09-25": "추석 연휴",
    "2026-10-05": "개천절 대체",
    "2026-10-09": "한글날"
  };
  const dateKey = (d) => [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join("-");
  const isHoliday = (d) => HOLIDAYS[dateKey(d)];

  /* ------- 1) 오늘의 상태 ---------------------------------------- */
  function statusFor(now) {
    const day = now.getDay();
    const m = now.getHours() * 60 + now.getMinutes();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (day === 0 || day === 6) return { label: "오늘은 수업이 없어요.", tone: "muted", next: null };
    if (isHoliday(now)) return { label: "오늘은 수업이 없어요.", tone: "muted", next: null };
    if (midnight < COURSE_START) return { label: "과정 시작 전", tone: "muted", next: null };
    if (midnight > COURSE_END) return { label: "과정 종료 🎓", tone: "muted", next: null };
    if (m < SCHED.start) return { label: "등원 전", tone: "muted", next: { t: SCHED.start, name: "수업 시작" } };
    if (m < SCHED.lunchS) return { label: "오전 수업 중", tone: "live", next: { t: SCHED.lunchS, name: "점심시간" } };
    if (m < SCHED.lunchE) return { label: "점심시간 🍚", tone: "warn", next: { t: SCHED.lunchE, name: "오후 수업" } };
    if (m < SCHED.end) return { label: "오후 수업 중", tone: "live", next: { t: SCHED.end, name: "퇴실" } };
    return { label: "일과 종료", tone: "muted", next: null };
  }
  function renderStatus() {
    const now = new Date();
    const s = statusFor(now);
    const pill = $("#status-pill"), cd = $("#status-countdown"), live = $("#status-live");
    if (pill) { pill.textContent = s.label; pill.dataset.tone = s.tone; }
    if (live) {                                  // 수업 중이면 초록 live, 아니면 회색 OFF
      const on = s.tone === "live";
      live.hidden = false;
      live.className = "badge " + (on ? "badge--live" : "badge--off");
      live.innerHTML = '<span class="dot" aria-hidden="true"></span> ' + (on ? "live" : "OFF");
    }
    if (cd) {
      if (!s.next) { cd.hidden = true; cd.textContent = ""; return; }  // 다음 일정 없으면 줄 자체를 숨김
      cd.hidden = false;
      const left = s.next.t - (now.getHours() * 60 + now.getMinutes());
      const h = Math.floor(left / 60), mm = left % 60;
      cd.innerHTML = `${s.next.name}까지 <b>${h > 0 ? h + "시간 " : ""}${mm}분</b>`;
    }
  }

  /* ------- 2) 출결 체크리스트 (런타임 상호작용) ------------------ */
  const now0 = new Date();
  const todayKey = "skala-attend-" + [now0.getFullYear(), pad(now0.getMonth() + 1), pad(now0.getDate())].join("");
  const loadAttend = () => { try { return JSON.parse(localStorage.getItem(todayKey)) || {}; } catch (_) { return {}; } };
  const saveAttend = (d) => { try { localStorage.setItem(todayKey, JSON.stringify(d)); } catch (_) {} };

  function bindAttendance() {
    const data = loadAttend();
    $$(".check-item input").forEach((box) => {
      const type = box.dataset.check;
      if (data[type]) box.checked = true;
      box.addEventListener("change", () => {
        const d = loadAttend();
        // 실제 출석 시스템이 아닌 개인용 체크 → 시간 스탬프 없이 체크 여부만 저장
        if (box.checked) {
          d[type] = true;
          window.showToast && window.showToast((type === "in" ? "입실" : "퇴실") + " 체크 완료");
        } else {
          delete d[type];
        }
        saveAttend(d);
        checkWarn();
      });
    });
    checkWarn();
    setInterval(checkWarn, 60 * 1000);
  }
  function checkWarn() {
    const warn = $("#attend-warn");
    if (!warn) return;
    const data = loadAttend(), now = new Date();
    const day = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    let msg = "";
    if (day >= 1 && day <= 5 && !isHoliday(now)) {  // 공휴일·휴강엔 출결 독촉 안 함
      if (m >= SCHED.start + 5 && !data.in) msg = "아직 입실 체크가 안 됐어요. 지금 확인하세요!";
      else if (m >= SCHED.end - 15 && data.in && !data.out) msg = "퇴실 체크 잊지 마세요! (하루 1회만 가능)";
    }
    warn.textContent = msg ? "⚠️ " + msg : "";
    warn.dataset.show = String(!!msg);
  }

  /* ------- 3) 과정 진도 (D-day) --------------------------------- */
  function renderProgress() {
    const now = new Date(), dayMs = 86400000;
    const elapsed = Math.floor((now - COURSE_START) / dayMs) + 1;
    const totalCal = Math.round((COURSE_END - COURSE_START) / dayMs) + 1;
    const remain = Math.max(0, Math.ceil((COURSE_END - now) / dayMs));
    const pct = Math.min(100, Math.max(0, (elapsed / totalCal) * 100));
    const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
    set("#dday-elapsed", "D+" + Math.max(1, elapsed));
    set("#dday-remain", "D-" + remain);
    const bar = $("#progress-bar");
    if (bar) { bar.value = pct; bar.textContent = pct.toFixed(0) + "%"; }
    set("#progress-pct", pct.toFixed(0) + "%");
  }

  /* ------- 4) 복사 버튼 (이벤트 위임) --------------------------- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    const text = b.getAttribute("data-copy");
    const done = () => window.showToast && window.showToast("복사됐어요: " + text);
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  });
  function fallbackCopy(text, cb) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); cb(); } catch (_) {}
    document.body.removeChild(ta);
  }

  /* ------- init ------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderStatus(); setInterval(renderStatus, 30 * 1000);
    bindAttendance();
    renderProgress();
  });
})();
