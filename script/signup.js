/* =====================================================================
   signup.js — 회원가입 폼 인터랙션 & 검증
   · 진행률 바 · 아이디 중복(localStorage) · 비밀번호 규칙/강도/일치 · 보기토글
   · CapsLock 경고 · 희망직군 커스텀 드롭다운 · 경력 라벨(신입/10년 이상)
   · 테마색 프리셋+피커 · 프로필 이미지 미리보기/제약 · 약관 스크롤-투-동의
   · 제출 전 요약 모달 → 확인 시 아이디 저장 후 GET 전송
   ===================================================================== */
(function () {
  "use strict";
  var form = document.querySelector("[data-signup-form]");
  if (!form) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  // ── 요소 참조 ──
  var userId = $("#userId"), userPw = $("#userPw"), userPw2 = $("#userPw2");
  var userEmail = $("#userEmail"), emailDomain = $("#emailDomain"), userName = $("#userName");
  var userBirth = $("#userBirth"), userTel = $("#userTel");
  var jobSelect = $("[data-job-select]"), jobCustom = $("[data-job-custom]"), jobValue = $("[data-job-value]");
  var exp = $("#exp"), expOut = $("#exp-out");
  var meter = $("#pw-meter"), pwOut = $("#pw-out"), pwRules = $("[data-pw-rules]"), capsWarn = $("[data-caps-warn]");
  var idStatus = $("[data-id-status]"), pwMatch = $("[data-pw-match]");
  var colorPicker = $("[data-color-custom]"), customRadio = $("[data-swatch-custom]"), customDot = $("[data-swatch-custom-dot]");
  var avatar = $("#avatar"), fileName = $("[data-file-name]"), filePreview = $("[data-file-preview]"), fileStatus = $("[data-file-status]");
  var intro = $("#intro"), counterNow = $("[data-counter-now]");
  var progressBar = $("[data-progress-bar]"), progressPct = $("[data-progress-pct]");
  var summaryDialog = $("[data-summary-dialog]"), summaryBody = $("[data-summary-body]");

  // ── 아이디 중복 확인 (auth.js 유저 저장소, 런타임 동작) ──
  function idTaken(id) { return !!(window.SkalaAuth && SkalaAuth.userExists(id)); }
  var ID_RE = /^[A-Za-z0-9]{4,15}$/;

  // ── 1) 아이디 실시간 상태 ──
  function updateIdStatus() {
    var v = userId.value.trim();
    if (!v) { setStatus(idStatus, "", ""); return; }
    if (!ID_RE.test(v)) { setStatus(idStatus, "아이디는 영문·숫자 4~15자예요", "bad"); return; }
    if (idTaken(v)) { setStatus(idStatus, "이미 사용 중인 아이디예요 (이 PC에서 가입됨)", "bad"); return; }
    setStatus(idStatus, "사용 가능한 아이디예요", "good");
  }
  function setStatus(el, msg, state) { if (!el) return; el.textContent = msg; el.dataset.state = state || ""; }

  // ── 2) 비밀번호 강도 + 규칙 체크리스트 ──
  var PW_LABELS = ["", "매우 약함", "약함", "보통", "강함"];
  function pwEval(v) {
    var rules = {
      len: v.length >= 8,
      case: /[a-z]/.test(v) && /[A-Z]/.test(v),
      num: /\d/.test(v),
      special: /[^A-Za-z0-9]/.test(v)
    };
    var score = (rules.len ? 1 : 0) + (rules.case ? 1 : 0) + (rules.num ? 1 : 0) + (rules.special ? 1 : 0);
    return { score: score, rules: rules };
  }
  function onPwInput() {
    var v = userPw.value, r = pwEval(v), score = v ? r.score : 0;
    if (meter) meter.value = score;
    if (pwOut) { pwOut.textContent = PW_LABELS[score]; pwOut.dataset.level = String(score); }
    if (pwRules) {
      pwRules.dataset.active = v ? "true" : "false"; // 입력 있을 때만 미충족을 빨갛게
      Object.keys(r.rules).forEach(function (k) {
        var li = pwRules.querySelector('[data-rule="' + k + '"]');
        if (li) li.dataset.ok = String(v ? r.rules[k] : false);
      });
    }
    updatePwMatch();
    updateProgress();
  }

  // ── 3) 비밀번호 일치 ──
  function updatePwMatch() {
    if (!pwMatch) return;
    var b = userPw2.value;
    // setCustomValidity → 네이티브 :invalid 로 만들어 기존 빨간 테두리 규칙이 적용되게 함
    if (!b) { setStatus(pwMatch, "", ""); userPw2.removeAttribute("aria-invalid"); userPw2.setCustomValidity(""); return; }
    if (b === userPw.value) {
      setStatus(pwMatch, "비밀번호가 일치해요", "good");
      userPw2.removeAttribute("aria-invalid"); userPw2.setCustomValidity("");
    } else {
      setStatus(pwMatch, "비밀번호가 일치하지 않아요", "bad");
      userPw2.setAttribute("aria-invalid", "true"); userPw2.setCustomValidity("비밀번호가 일치하지 않습니다");
    }
  }

  // ── 4) 비밀번호 보기 토글 ──
  $$("[data-pw-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var input = document.getElementById(btn.dataset.pwToggle);
      if (!input) return;
      var show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute("aria-pressed", String(show));
      btn.classList.toggle("is-on", show);
    });
  });

  // ── 5) CapsLock 경고 ──
  function capsCheck(e) { if (capsWarn && e.getModifierState) capsWarn.hidden = !e.getModifierState("CapsLock"); }
  [userPw, userPw2].forEach(function (el) {
    if (!el) return;
    el.addEventListener("keydown", capsCheck);
    el.addEventListener("keyup", capsCheck);
    el.addEventListener("blur", function () { if (capsWarn) capsWarn.hidden = true; });
  });

  // ── 6) 희망 직군 커스텀 드롭다운 (직접 입력 시 칸 노출) ──
  function syncJob() {
    if (jobSelect.value === "__custom__") {
      jobCustom.hidden = false;
      jobValue.value = jobCustom.value.trim();
    } else {
      jobCustom.hidden = true;
      jobValue.value = jobSelect.value; // "" = 선택 안 함
    }
  }
  if (jobSelect) jobSelect.addEventListener("change", function () {
    syncJob();
    if (jobSelect.value === "__custom__") jobCustom.focus();
  });
  if (jobCustom) jobCustom.addEventListener("input", function () { jobValue.value = jobCustom.value.trim(); });

  // ── 7) 개발 경력 라벨 (0=신입, 10=10년 이상) ──
  function expLabel(v) { v = +v; return v === 0 ? "신입" : v === 10 ? "10년 이상" : v + "년"; }
  if (exp) { exp.addEventListener("input", function () { expOut.textContent = expLabel(exp.value); }); expOut.textContent = expLabel(exp.value); }

  // ── 8) 테마색: 프리셋 + 직접 선택(피커) ──
  function themeVal() { var r = form.querySelector('input[name="themeColor"]:checked'); return r ? r.value : ""; }
  if (customRadio && colorPicker) {
    customRadio.addEventListener("change", function () {
      if (customRadio.checked) { colorPicker.hidden = false; try { colorPicker.click(); } catch (e) {} }
    });
    colorPicker.addEventListener("input", function () {
      customRadio.value = colorPicker.value;
      customRadio.checked = true;
      customDot.style.setProperty("--sw", colorPicker.value);
      customDot.classList.add("has-color");
      updateProgress();
    });
    $$('input[name="themeColor"]').forEach(function (r) {
      r.addEventListener("change", function () { if (!r.hasAttribute("data-swatch-custom")) colorPicker.hidden = true; });
    });
  }

  // ── 9) 프로필 이미지: 미리보기 + 형식/용량 제약 ──
  var MAX_BYTES = 5 * 1024 * 1024;
  if (avatar) avatar.addEventListener("change", function () {
    setStatus(fileStatus, "", "");
    var f = avatar.files && avatar.files[0];
    var clear = function () { fileName.textContent = "선택된 파일 없음"; filePreview.hidden = true; filePreview.removeAttribute("src"); avatar.value = ""; };
    if (!f) { clear(); updateProgress(); return; }
    if (!/^image\/(png|jpeg|webp)$/.test(f.type)) { setStatus(fileStatus, "JPG · PNG · WEBP 형식만 올릴 수 있어요", "bad"); clear(); return; }
    if (f.size > MAX_BYTES) { setStatus(fileStatus, "5MB 이하만 올릴 수 있어요 (" + (f.size / 1048576).toFixed(1) + "MB)", "bad"); clear(); return; }
    fileName.textContent = f.name;
    filePreview.src = URL.createObjectURL(f);
    filePreview.hidden = false;
    setStatus(fileStatus, "이미지를 확인했어요 ✓", "good");
  });

  // ── 10) 자기소개 글자수 ──
  if (intro && counterNow) intro.addEventListener("input", function () { counterNow.textContent = intro.value.length; });

  // ── 11) 약관 모달: 끝까지 스크롤해야 '동의' 활성화 ──
  function openDialog(d) { if (!d) return; if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
  function closeDialog(d) { if (!d) return; if (d.close) d.close(); else d.removeAttribute("open"); }

  $$("[data-terms-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.dataset.termsOpen;
      var dlg = $('[data-terms-dialog="' + key + '"]');
      var body = $("[data-terms-scroll]", dlg);
      var agreeBtn = $("[data-terms-agree]", dlg);
      openDialog(dlg);
      var check = function () {
        var atBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 4;
        agreeBtn.disabled = !atBottom;
      };
      body.scrollTop = 0;
      // 내용이 짧아 스크롤이 없으면 바로 활성화
      requestAnimationFrame(check);
      body.onscroll = check;
    });
  });
  $$("[data-terms-agree]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cb = form.querySelector('[data-consent="' + btn.dataset.termsAgree + '"]');
      if (cb) { cb.disabled = false; cb.checked = true; }
      closeDialog(btn.closest("dialog"));
      updateProgress();
    });
  });
  $$("[data-terms-close]").forEach(function (b) { b.addEventListener("click", function () { closeDialog(b.closest("dialog")); }); });
  $$("dialog").forEach(function (d) { d.addEventListener("click", function (e) { if (e.target === d) closeDialog(d); }); });

  // ── 12) 진행률 ──
  function fieldValid(el) {
    if (el === userId) { var v = userId.value.trim(); return ID_RE.test(v) && !idTaken(v); }
    if (el === userPw) { return userPw.value.length >= 8 && userPw.checkValidity(); }
    if (el === userPw2) { return userPw2.value !== "" && userPw2.value === userPw.value; }
    return el.value.trim() !== "" && el.checkValidity();
  }
  function updateProgress() {
    var reqs = $$("[data-req]", form);
    var total = reqs.length + 2;
    var done = 0;
    reqs.forEach(function (el) { if (fieldValid(el)) done++; });
    if (form.querySelector('[data-consent="tos"]').checked) done++;
    if (form.querySelector('[data-consent="privacy"]').checked) done++;
    var pct = Math.round((done / total) * 100);
    if (progressBar) progressBar.style.width = pct + "%";
    if (progressPct) progressPct.textContent = pct;
  }

  // 진행률/상태 갱신 이벤트 연결
  userId.addEventListener("input", function () { updateIdStatus(); updateProgress(); });
  userPw.addEventListener("input", onPwInput);
  userPw2.addEventListener("input", function () { updatePwMatch(); updateProgress(); });
  userName.addEventListener("input", updateProgress);
  $$('[data-consent]').forEach(function (c) { c.addEventListener("change", updateProgress); });

  // ── 13) 제출 → 검증 → 요약 모달 → 확인 시 실제 전송 ──
  function validateAll() {
    var idv = userId.value.trim();
    var problems = [];
    if (!ID_RE.test(idv)) problems.push([userId, "아이디는 영문·숫자 4~15자예요"]);
    else if (idTaken(idv)) problems.push([userId, "이미 사용 중인 아이디예요"]);
    if (!userPw.checkValidity() || userPw.value.length < 8) problems.push([userPw, "비밀번호 규칙(8자↑·대소문자·숫자·특수문자)을 확인하세요"]);
    if (!userPw2.value || userPw2.value !== userPw.value) problems.push([userPw2, "비밀번호가 일치하지 않아요"]);
    if (!userName.value.trim()) problems.push([userName, "이름을 입력하세요"]);
    if (userTel.value && !userTel.checkValidity()) problems.push([userTel, "전화번호 형식을 확인하세요"]);
    if (!form.querySelector('[data-consent="tos"]').checked) problems.push([null, "이용약관에 동의해 주세요 (전문 보기 → 끝까지 스크롤)"]);
    if (!form.querySelector('[data-consent="privacy"]').checked) problems.push([null, "개인정보 수집·이용에 동의해 주세요"]);
    if (problems.length) {
      var first = problems[0];
      if (window.showToast) window.showToast(first[1]);
      if (first[0]) { first[0].focus(); first[0].scrollIntoView({ block: "center", behavior: "smooth" }); }
      return false;
    }
    return true;
  }

  function buildSummary() {
    var rows = [];
    var add = function (k, v) { if (v) rows.push("<dt>" + k + "</dt><dd>" + v + "</dd>"); };
    add("아이디", esc(userId.value.trim()));
    var email = userEmail.value.trim(), dom = emailDomain.value;
    add("이메일", email ? esc(email) + (dom ? "@" + esc(dom) : "") : "");
    add("이름", esc(userName.value.trim()));
    add("생년월일", esc(userBirth.value));
    add("전화번호", esc(userTel.value));
    add("희망 직군", esc(jobValue.value));
    var gender = form.querySelector('input[name="gender"]:checked');
    add("성별", gender ? esc(gender.value) : "");
    var ints = $$('input[name="interest"]:checked').map(function (c) { return esc(c.parentNode.textContent.trim()); }).join(", ");
    add("관심 분야", ints);
    add("개발 경력", expLabel(exp.value));
    var tc = themeVal();
    add("프로필 색상", '<span class="swatch-inline" style="background:' + esc(tc) + '"></span>');
    var f = avatar.files && avatar.files[0];
    add("프로필 이미지", f ? esc(f.name) : "");
    add("자기소개", esc(intro.value.trim()));
    add("동의", "이용약관 · 개인정보 수집·이용");
    summaryBody.innerHTML = '<dl class="summary-dl">' + rows.join("") + "</dl>";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateAll()) return;
    buildSummary();
    openDialog(summaryDialog);
  });
  $("[data-summary-confirm]").addEventListener("click", function () {
    var proceed = function () { closeDialog(summaryDialog); form.submit(); }; // GET 전송
    if (!window.SkalaAuth) { proceed(); return; }
    this.disabled = true;
    buildAndSaveUser().then(proceed, proceed); // 프로필 저장 후 전송(실패해도 전송은 진행)
  });

  // 가입 프로필을 auth 저장소에 저장 (비번 해시 + 아바타 썸네일 dataURL)
  function buildAndSaveUser() {
    return SkalaAuth.hashPw(userPw.value).then(function (hash) {
      return avatarDataUrl().then(function (avatarUrl) {
        var email = userEmail.value.trim(), dom = emailDomain.value;
        SkalaAuth.saveUser({
          id: userId.value.trim(),
          pwHash: hash,
          name: userName.value.trim(),
          email: email ? (email + (dom ? "@" + dom : "")) : "",
          birth: userBirth.value,
          tel: userTel.value,
          job: jobValue.value,
          gender: (form.querySelector('input[name="gender"]:checked') || {}).value || "",
          interest: $$('input[name="interest"]:checked').map(function (c) { return c.parentNode.textContent.trim(); }),
          exp: expLabel(exp.value),
          themeColor: themeVal(),
          avatar: avatarUrl,
          intro: intro.value.trim()
        });
      });
    });
  }
  // 프로필 이미지를 256px 정사각 썸네일 dataURL로 (localStorage 용량 대비)
  function avatarDataUrl() {
    var f = avatar.files && avatar.files[0];
    if (!f) return Promise.resolve("");
    return new Promise(function (resolve) {
      var img = new Image(), url = URL.createObjectURL(f);
      img.onload = function () {
        var size = 256, c = document.createElement("canvas"); c.width = c.height = size;
        var ctx = c.getContext("2d"), s = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        URL.revokeObjectURL(url);
        try { resolve(c.toDataURL("image/jpeg", 0.85)); } catch (e) { resolve(""); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(""); };
      img.src = url;
    });
  }
  $("[data-summary-cancel]").addEventListener("click", function () { closeDialog(summaryDialog); });

  // ── 14) 리셋 시 커스텀 UI 초기화 ──
  form.addEventListener("reset", function () {
    setTimeout(function () {
      jobCustom.hidden = true; jobValue.value = "";
      if (colorPicker) colorPicker.hidden = true;
      if (customDot) { customDot.classList.remove("has-color"); customDot.style.removeProperty("--sw"); }
      filePreview.hidden = true; filePreview.removeAttribute("src"); fileName.textContent = "선택된 파일 없음";
      setStatus(fileStatus, "", ""); setStatus(idStatus, "", ""); setStatus(pwMatch, "", "");
      if (meter) meter.value = 0; if (pwOut) { pwOut.textContent = ""; pwOut.dataset.level = "0"; }
      userPw2.removeAttribute("aria-invalid");
      if (pwRules) pwRules.dataset.active = "false";
      $$("[data-rule]", pwRules).forEach(function (li) { li.dataset.ok = "false"; });
      $$("[data-consent]").forEach(function (c) { c.checked = false; c.disabled = true; });
      $$("[data-terms-agree]").forEach(function (b) { b.disabled = true; });
      if (capsWarn) capsWarn.hidden = true;
      expOut.textContent = "신입";
      counterNow.textContent = "0";
      updateProgress();
    }, 0);
  });

  // 초기화
  syncJob();
  updateProgress();
})();
