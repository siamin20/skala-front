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

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  // 도트 캐릭터 아바타 SVG (선호 색상으로 tint) — 마이페이지 아바타와 동일 디자인
  function characterSVG(color) {
    return '<svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden="true">'
      + '<g fill="' + color + '">'
      +   '<rect x="15" y="3" width="2" height="4" rx="1"/><circle cx="16" cy="3" r="1.6"/>'
      +   '<rect x="6" y="8" width="20" height="17" rx="6"/>'
      +   '<rect x="9" y="24" width="4" height="3" rx="1.5"/><rect x="19" y="24" width="4" height="3" rx="1.5"/>'
      + '</g>'
      + '<circle cx="12.5" cy="16" r="2.7" fill="#fff"/><circle cx="19.5" cy="16" r="2.7" fill="#fff"/>'
      + '<circle cx="13" cy="16.5" r="1.25" fill="#1c1f36"/><circle cx="20" cy="16.5" r="1.25" fill="#1c1f36"/>'
      + '<path d="M13 20 Q16 22.5 19 20" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/>'
      + '</svg>';
  }
  function avatarPic(user) {
    if (user.avatar) return '<span class="auth-user__pic"><img src="' + user.avatar + '" alt="" /></span>';
    var color = user.themeColor || "#4338ca";
    return '<span class="auth-user__pic" style="background:color-mix(in srgb, ' + color + ' 16%, var(--surface-2))">' + characterSVG(color) + '</span>';
  }

  // 헤더의 로그인 상태 UI 연결 ([data-auth-user] / [data-auth-btn] / [data-mypage-link])
  function initHeader() {
    var id = getSession(), user = id ? getUser(id) : null;
    var userEl = document.querySelector("[data-auth-user]");
    var authBtn = document.querySelector("[data-auth-btn]");
    var onMyPage = /mypage\.html/i.test(location.pathname); // 마이페이지 헤더엔 아바타 생략(카드에 이미 있음)
    if (userEl) {
      if (user) {
        userEl.hidden = false;
        userEl.innerHTML = (onMyPage ? "" : avatarPic(user)) + "<span>" + esc(user.name || user.id) + "님</span>";
      } else { userEl.hidden = true; userEl.innerHTML = ""; }
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
