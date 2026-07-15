/* =====================================================================
   theme.js — 다크/라이트 테마 토글 (전체 관통 기능)
   - localStorage 로 선택 기억
   - 저장값 없으면 OS 선호(prefers-color-scheme) 따름
   - 깜빡임(FOUC) 방지용 초기화 스니펫은 각 페이지 <head> 에 인라인으로 둔다.
   ===================================================================== */
(function () {
  "use strict";

  const STORAGE_KEY = "skala-theme";
  const root = document.documentElement;

  /** 현재 적용 테마를 반환 (data-theme 우선, 없으면 OS 선호) */
  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  /** 테마 적용 + 저장 + 버튼 상태 갱신 */
  function applyTheme(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      const isDark = theme === "dark";
      btn.setAttribute("aria-pressed", String(isDark));
      btn.setAttribute("aria-label", isDark ? "라이트 모드로 전환" : "다크 모드로 전환");
      btn.setAttribute("title", isDark ? "라이트 모드" : "다크 모드");
    });
  }

  function toggle() {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(currentTheme());
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) =>
      btn.addEventListener("click", toggle)
    );
  });

  // OS 테마가 바뀌고 사용자가 아직 명시 선택을 안 했다면 따라 바뀜
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) {}
    if (!saved) applyTheme(e.matches ? "dark" : "light");
  });
})();
