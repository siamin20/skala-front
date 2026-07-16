/* =====================================================================
   auth.js — 브라우저 데모 로그인 (localStorage 기반, 서버 없음)
   · 유저 저장소(skala-users): { [id]: {id, pwHash, name, email, ...} }
   · 세션(skala-session): 로그인한 아이디 · 아이디 저장(skala-remember-id)
   · 비밀번호는 Web Crypto SHA-256으로 해시(비보안 컨텍스트는 단순 해시 폴백)
   ※ 실제 인증이 아니라 학습용 데모. fresh clone에선 비어서 시작하는 런타임 기능.
   전역 window.SkalaAuth 로 노출 → signup.js / login·myPage 에서 사용.
   ===================================================================== */
(function () {
  "use strict";
  var USERS = "skala-users", SESSION = "skala-session", REMEMBER = "skala-remember-id";

  // 페이지 위치에 따른 경로 (루트 index vs html/ 하위)
  var inHtml = /\/html\//.test(location.pathname);
  var P = inHtml ? "" : "html/";
  var HOME = inHtml ? "../index.html" : "index.html";
  var paths = { login: P + "login.html", mypage: P + "myPage.html", signup: P + "signUp.html", home: HOME };

  function getUsers() {
    try {
      var v = JSON.parse(localStorage.getItem(USERS));
      if (Array.isArray(v)) { var o = {}; v.forEach(function (id) { o[id] = { id: id }; }); return o; } // 구버전(배열) 호환
      return v && typeof v === "object" ? v : {};
    } catch (e) { return {}; }
  }
  function setUsers(o) { try { localStorage.setItem(USERS, JSON.stringify(o)); } catch (e) {} }
  function getUser(id) { return getUsers()[id] || null; }
  function userExists(id) { return !!getUsers()[id]; }
  function saveUser(u) { var all = getUsers(); all[u.id] = u; setUsers(all); }
  function deleteUser(id) { var all = getUsers(); delete all[id]; setUsers(all); }

  // 비밀번호 해시 (SHA-256, 폴백은 데모용 djb2)
  function hashPw(pw) {
    return new Promise(function (resolve) {
      try {
        if (window.crypto && crypto.subtle) {
          crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw)).then(function (buf) {
            resolve("sha256:" + Array.prototype.map.call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, "0"); }).join(""));
          }, fallback);
          return;
        }
      } catch (e) {}
      fallback();
      function fallback() {
        var h = 5381; for (var i = 0; i < pw.length; i++) { h = ((h << 5) + h + pw.charCodeAt(i)) >>> 0; }
        resolve("djb2:" + h.toString(16));
      }
    });
  }

  function getSession() { try { return localStorage.getItem(SESSION) || null; } catch (e) { return null; } }
  function currentUser() { var id = getSession(); return id ? getUser(id) : null; }
  function logout() { try { localStorage.removeItem(SESSION); } catch (e) {} }

  function login(id, pw) {
    return hashPw(pw).then(function (h) {
      var u = getUser(id);
      if (!u) return { ok: false, reason: "noid" };
      if (u.pwHash !== h) return { ok: false, reason: "pw" };
      try { localStorage.setItem(SESSION, id); } catch (e) {}
      return { ok: true };
    });
  }

  function rememberId(id) {
    try { if (id) localStorage.setItem(REMEMBER, id); else localStorage.removeItem(REMEMBER); } catch (e) {}
  }
  function getRememberedId() { try { return localStorage.getItem(REMEMBER) || ""; } catch (e) { return ""; } }

  // 로그인 필요한 페이지 가드 (마이페이지)
  function requireAuth() {
    if (!getSession()) { location.replace(paths.login + "?next=mypage"); return false; }
    return true;
  }

  // 헤더의 로그인 상태 UI 연결 ([data-auth-user] / [data-auth-btn] / [data-mypage-link])
  function initHeader() {
    var id = getSession(), user = id ? getUser(id) : null;
    var userEl = document.querySelector("[data-auth-user]");
    var authBtn = document.querySelector("[data-auth-btn]");
    if (userEl) {
      if (user) { userEl.hidden = false; userEl.textContent = (user.name || user.id) + "님"; }
      else { userEl.hidden = true; userEl.textContent = ""; }
    }
    if (authBtn) {
      if (id) {
        authBtn.textContent = "로그아웃";
        authBtn.onclick = function () { logout(); location.href = paths.home; };
      } else {
        authBtn.textContent = "로그인";
        authBtn.onclick = function () { location.href = paths.login; };
      }
    }
  }

  window.SkalaAuth = {
    getUsers: getUsers, getUser: getUser, userExists: userExists, saveUser: saveUser, deleteUser: deleteUser,
    hashPw: hashPw, login: login, logout: logout, getSession: getSession, currentUser: currentUser,
    rememberId: rememberId, getRememberedId: getRememberedId, requireAuth: requireAuth,
    initHeader: initHeader, paths: paths
  };

  // 헤더가 있으면 자동 연결
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initHeader);
  else initHeader();
})();
