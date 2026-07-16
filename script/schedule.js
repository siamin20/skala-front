/* =====================================================================
   schedule.js — 강의 시간표 (스펙 초과 기능)
   · 진입 시 오늘이 속한 이번 주 자동 표시 · 좌우 화살표로 주 이동
   · 오늘 열에만 현재 시각 "가로줄" (시간대 칸 안에서 이동)
   · 과목 카테고리별 색 구분 · 점심 클릭 → 그 주 중식 메뉴 모달(7월)
   · 오전/오후가 다른 날은 칸 분리, 한 과목의 '마지막 날'(다음 수업일에 과목이 바뀜)
     오후에 '과제 실습' 블록 — 실습 비중 큰 과목 2h / 가벼운 과목 1h
   표의 기본 구조(table/thead/tbody/rowspan/colspan)는 HTML 소스에도 존재 →
   JS는 주별 텍스트·구조·현재선만 갱신 (파일 내 CSS 0줄 규칙과 무관)
   ===================================================================== */
(function () {
  "use strict";

  // ── 4반(205호) 일별 시간표 ──
  // 값: [과목, 교수]  또는  [오전과목, 오전교수, 오후과목, 오후교수]
  // 과목 문자열의 " / " 는 셀에서 줄바꿈으로 표시됨
  var SCHED = {
    "2026-07-13": ["과정 시작 전", ""],
    "2026-07-14": ["생활 안내 · Q&A / 출결 · FAQ / 반별 자기소개", "심요한", "Git 이해 및 활용", "엄진영"],
    "2026-07-15": ["HTML · CSS · JavaScript", "엄진영"],
    "2026-07-16": ["HTML · CSS · JavaScript", "엄진영"],
    "2026-07-17": ["대체휴일 (제헌절)", ""],
    "2026-07-20": ["데이터 분석을 위한 Python 이해", "류홍걸"],
    "2026-07-21": ["데이터 분석을 위한 Python 이해", "류홍걸"],
    "2026-07-22": ["스마트 데이터 이해 및 활용", "류홍걸"],
    "2026-07-23": ["스마트 데이터 이해 및 활용", "류홍걸"],
    "2026-07-24": ["스마트 데이터 이해 및 활용", "류홍걸"],
    "2026-07-27": ["데이터 분석 개요 및 기초통계", "박병선"],
    "2026-07-28": ["데이터 분석 개요 및 기초통계", "박병선"],
    "2026-07-29": ["Prompt 설계와 Context", "한성훈"],
    "2026-07-30": ["LLM과 Transformer 아키텍처", "한성훈"],
    "2026-07-31": ["LLM과 Transformer 아키텍처", "한성훈"],
    "2026-08-03": ["Java · SpringBoot · Rest API 구현", "류홍걸"],
    "2026-08-04": ["Java · SpringBoot · Rest API 구현", "류홍걸"],
    "2026-08-05": ["Java · SpringBoot · Rest API 구현", "류홍걸"],
    "2026-08-06": ["Java · SpringBoot · Rest API 구현", "류홍걸"],
    "2026-08-07": ["Java · SpringBoot · Rest API 구현", "류홍걸"],
    "2026-08-10": ["Agile 방법론 및 MSA 개발", "류홍걸"],
    "2026-08-11": ["Agile 방법론 및 MSA 개발", "류홍걸"],
    "2026-08-12": ["sLLM 구현 및 Fine Tuning", "임성열"],
    "2026-08-13": ["sLLM 구현 및 Fine Tuning", "임성열"],
    "2026-08-14": ["실전 Feature Engineering", "이은호"],
    "2026-08-17": ["대체휴일 (광복절)", ""],
    "2026-08-18": ["Front-framework: Vue.js", "김일한"],
    "2026-08-19": ["Front-framework: Vue.js", "김일한"],
    "2026-08-20": ["Front-framework: Vue.js", "김일한"],
    "2026-08-21": ["Front-framework: Vue.js", "김일한"],
    "2026-08-24": ["컨테이너 이해 및 애플리케이션 컨테이너화", "신인철"],
    "2026-08-25": ["컨테이너 이해 및 애플리케이션 컨테이너화", "신인철"],
    "2026-08-26": ["쿠버네티스 이해 및 애플리케이션 배포", "신인철"],
    "2026-08-27": ["쿠버네티스 이해 및 애플리케이션 배포", "신인철"],
    "2026-08-28": ["특강 (취업특강)", "최헌영"],
    "2026-08-31": ["Spring AI", "정윤석"],
    "2026-09-01": ["Spring AI", "정윤석"],
    "2026-09-02": ["웹 서비스 개발 mini-Project", "윤재성"],
    "2026-09-03": ["웹 서비스 개발 mini-Project", "윤재성"],
    "2026-09-04": ["웹 서비스 개발 mini-Project", "윤재성"],
    "2026-09-07": ["머신러닝 및 딥러닝 이해", "김준범"],
    "2026-09-08": ["머신러닝 및 딥러닝 이해", "김준범"],
    "2026-09-09": ["머신러닝 및 딥러닝 이해", "김준범"],
    "2026-09-10": ["모델 개발 및 최적화", "김준범"],
    "2026-09-11": ["모델 개발 및 최적화", "김준범"],
    "2026-09-14": ["쿠버네티스 실무 심화", "박보경"],
    "2026-09-15": ["쿠버네티스 실무 심화", "박보경"],
    "2026-09-16": ["쿠버네티스 실무 심화", "박보경"],
    "2026-09-17": ["특강 (도메인특강 · 프로젝트 현장 사례)", ""],
    "2026-09-18": ["생성형 AI 서비스 개발 (LangChain)", "김경난"],
    "2026-09-21": ["생성형 AI 서비스 개발 (LangChain)", "김경난"],
    "2026-09-22": ["생성형 AI 서비스 개발 (LangChain)", "김경난"],
    "2026-09-23": ["자체휴강", ""],
    "2026-09-24": ["추석연휴", ""],
    "2026-09-25": ["추석연휴", ""],
    "2026-09-28": ["RAG Pipeline 설계 및 구축", "김경난"],
    "2026-09-29": ["RAG Pipeline 설계 및 구축", "김경난"],
    "2026-09-30": ["RAG Pipeline 설계 및 구축", "김경난"],
    "2026-10-01": ["데이터 분석 mini-Project", "박보경"],
    "2026-10-02": ["데이터 분석 mini-Project", "박보경"],
    "2026-10-05": ["대체휴일 (개천절)", ""],
    "2026-10-06": ["모델 서빙 및 AIOps 구성", "임성열"],
    "2026-10-07": ["모델 서빙 및 AIOps 구성", "임성열"],
    "2026-10-08": ["모델 서빙 및 AIOps 구성", "임성열"],
    "2026-10-09": ["한글날", ""],
    "2026-10-12": ["AI Agent 설계 및 구축", "김경난"],
    "2026-10-13": ["AI Agent 설계 및 구축", "김경난"],
    "2026-10-14": ["Vector DB", "김경난"],
    "2026-10-15": ["AI Agent Capstone", "김경난"],
    "2026-10-16": ["AI Agent Capstone", "김경난"],
    "2026-10-19": ["AI Agent Capstone", "김경난"],
    "2026-10-20": ["AI 서비스 개발 Mini-project", "김경난"],
    "2026-10-21": ["AI 서비스 개발 Mini-project", "김경난"],
    "2026-10-22": ["AI 서비스 개발 Mini-project", "김경난"],
    "2026-10-23": ["DevOps 이해 및 활용", "김경난"],
    "2026-10-26": ["DevOps 이해 및 활용", "김경난"],
    "2026-10-27": ["AI 프로젝트 방법론", ""],
    "2026-10-28": ["팀프로젝트", "백정열"],
    "2026-10-29": ["팀프로젝트", "박병선"],
    "2026-10-30": ["팀프로젝트", "박병선"],
    "2026-11-02": ["팀프로젝트", "이용우"],
    "2026-11-03": ["팀프로젝트", "이용우"],
    "2026-11-04": ["팀프로젝트", "이용우"],
    "2026-11-05": ["팀프로젝트", "박창렴"],
    "2026-11-06": ["팀프로젝트", "박창렴"],
    "2026-11-09": ["팀프로젝트", "류홍걸"],
    "2026-11-10": ["팀프로젝트", "류홍걸"],
    "2026-11-11": ["팀프로젝트", "임성열"],
    "2026-11-12": ["팀프로젝트 (중간점검)", "임성열"],
    "2026-11-13": ["팀프로젝트", "임성열"],
    "2026-11-16": ["팀프로젝트", "강병호"],
    "2026-11-17": ["팀프로젝트", "강병호"],
    "2026-11-18": ["팀프로젝트", "강병호"],
    "2026-11-19": ["팀프로젝트", "강병호"],
    "2026-11-20": ["팀프로젝트", "강병호"],
    "2026-11-23": ["팀프로젝트", "이현민"],
    "2026-11-24": ["팀프로젝트", "이현민"],
    "2026-11-25": ["팀프로젝트", "임성열"],
    "2026-11-26": ["팀프로젝트", "임성열"],
    "2026-11-27": ["팀프로젝트", "임성열"],
    "2026-11-30": ["팀프로젝트", "강병호"],
    "2026-12-01": ["팀프로젝트", "강병호"],
    "2026-12-02": ["팀프로젝트", "강병호"],
    "2026-12-03": ["팀프로젝트", "강병호"],
    "2026-12-04": ["팀프로젝트", "강병호"],
    "2026-12-07": ["팀프로젝트", "류홍걸"],
    "2026-12-08": ["팀프로젝트", "류홍걸"],
    "2026-12-09": ["팀프로젝트", "류홍걸"],
    "2026-12-10": ["최종평가 (예선)", "류홍걸"],
    "2026-12-11": ["최종평가 (본선)", "류홍걸", "수료식 · 16시 종료", ""]
  };

  // ── 7월 중식(점심) 메뉴 (평일, 광주 캠퍼스 식단표) ──
  var MENU = {
    "2026-07-01": "백미밥 · 어묵무국 · 치킨까스 · 쫄면무침 · 요구르트 · 배추김치",
    "2026-07-02": "백미밥 · 들깨미역국 · 닭감자조림 · 꽃맛살샐러드 · 치커리무침 · 섞박지",
    "2026-07-03": "흑미밥 · 건새우된장국 · 제육볶음 · 양배추/강된장 · 아삭고추무침 · 배추김치",
    "2026-07-06": "잡곡밥 · 장어탕 · 파채언양식불고기 · 도토리묵/양념장 · 숙주나물무침 · 배추김치",
    "2026-07-07": "백미밥 · 꽃게탕 · 제육고추장불고기 · 상추쌈장 · 유부맛살무침 · 섞박지",
    "2026-07-08": "쇠고기콩나물밥 · 얼갈이들깨국 · 닭치즈떡볶음 · 해초무침 · 건파래볶음 · 배추김치",
    "2026-07-09": "백미밥 · 건새우미역국 · 치킨가라아게 · 참치야채볶음 · 오이부추무침 · 깍두기",
    "2026-07-10": "잡곡밥 · 맑은등뼈탕 · 코다리무조림 · 잡채어묵조림 · 알마늘마늘쫑 · 열무김치",
    "2026-07-13": "흑미밥 · 황태미역국 · 파채불고기 · 건새우볶음 · 깻순겉절이 · 석박지",
    "2026-07-14": "백미밥 · 옥수수스프 · 토마토스파게티 · 돈육찹스테이크 · 망고양상추샐러드 · 배추김치",
    "2026-07-15": "🔥초복🔥 닭다리 닭죽 · 메밀전병 · 아삭이고추무침 · 쌈배추겉절이 · 수박 · 열무김치",
    "2026-07-16": "백미밥 · 참치김치찌개 · 어니언돈까스 · 돈나물초무침 · 자반볶음 · 깍두기",
    "2026-07-17": "흑미밥 · 잔치국수 · 김치전 · 브로컬리두부무침 · 과일사라다 · 열무김치",
    "2026-07-20": "백미밥 · 게살스프 · 함박스테이크 · 마카로니샐러드 · 양념깻잎지 · 배추김치",
    "2026-07-21": "백미밥 · 김치콩나물국 · 제육볶음 · 양배추쌈/강된장 · 파래자반무침 · 배추김치",
    "2026-07-22": "백미밥 · 소고기미역국 · 닭감자조림 · 아몬드지리멸치볶음 · 연두부양념장 · 배추김치",
    "2026-07-23": "야채비빔밥 · 얼갈이된장국 · 소고기약고추장 · 도시락김 · 핫도그케찹 · 열무김치",
    "2026-07-24": "🔥중복🔥 삼계탕 · 새우살애호박전 · 콩나물무침 · 무생채 · 갓김치",
    "2026-07-27": "백미밥 · 유부우동국 · 바싹불고기 · 총알새송이볶음 · 깻잎순겉절이 · 배추김치",
    "2026-07-28": "백미밥 · 배추된장국 · 아비꼬카레라이스 · 파채돈까스 · 오이피클 · 배추김치",
    "2026-07-29": "🥩수육특식 · 근대된장국 · 보쌈수육 · 쌈채소/쌈장 · 들기름막국수 · 보쌈김치",
    "2026-07-30": "백미밥 · 바지락칼국수 · 고등어구이 · 청포묵김가루무침 · 무생채 · 갓김치",
    "2026-07-31": "흑미밥 · 파송송계란국 · 베이컨크림파스타 · 함박스테이크 · 오이피클 · 배추김치"
  };
  var DOW = ["월", "화", "수", "목", "금"];

  function cat(subj) {
    if (/휴일|휴강|추석|한글날|시작 전|없음/.test(subj)) return "off";
    if (/특강/.test(subj)) return "special";
    if (/평가|수료/.test(subj)) return "eval";
    if (/프로젝트|Project|Capstone|mini|Mini|실습|Feature Engineering/.test(subj)) return "lab";
    return "lecture";
  }

  var wrap = document.querySelector("[data-timetable]");
  if (!wrap) return;
  var table = wrap.querySelector("table");
  var caption = table.querySelector("caption");
  var line = wrap.querySelector("[data-now-line]");
  var tbody = table.tBodies[0];
  var prevBtn = document.querySelector("[data-week-prev]");
  var nextBtn = document.querySelector("[data-week-next]");
  var weekLabel = document.querySelector("[data-week-label]");
  var dialog = document.querySelector("[data-lunch-dialog]");

  var START = 9 * 60, END = 18 * 60;
  var weekOffset = 0;
  var currentMon = null;

  var SLOTS = [
    [540, 600, 0],   // 09:00–10:00
    [600, 660, 1],   // 10:00–11:00
    [660, 720, 2],   // 11:00–12:00
    [720, 780, 3],   // 12:00–13:00 (점심)
    [780, 840, 4],   // 13:00–14:00
    [840, 900, 5],   // 14:00–15:00
    [900, 960, 6],   // 15:00–16:00
    [960, 1020, 7],  // 16:00–17:00
    [1020, 1080, 8]  // 17:00–18:00
  ];

  function pad(n) { return String(n).padStart(2, "0"); }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function md(d) { return (d.getMonth() + 1) + "/" + d.getDate(); }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function isClassDay(subj) { return !/휴일|휴강|추석|한글날|시작 전|없음/.test(subj); }
  // 셀 HTML: 과목( " / " → 줄바꿈 ) + 교수(작게)
  function cellHtml(s, p) {
    var main = esc(s).split(" / ").join("<br />");
    return main + (p ? "<br /><small>" + esc(p) + "</small>" : "");
  }
  // 다음 '수업일'의 오전 과목 (없으면 null) — '과목 마지막 날' 판별용
  function nextSubj(date) {
    var d = new Date(date);
    for (var k = 0; k < 21; k++) {
      d.setDate(d.getDate() + 1);
      var e = SCHED[ymd(d)];
      if (e && isClassDay(e[0])) return e[0];
    }
    return null;
  }
  // 과제 실습 길이(시간): 구현·개발·프로젝트 등 실습 비중 큰 과목 2h, 이론·개요·특강 1h
  function labHours(subj) {
    if (/개요|기초|방법론|특강|이론|Q&A/.test(subj)) return 1;   // 이론·개요·특강 우선 1h
    var heavy = /구현|개발|프로젝트|Project|Capstone|실습|Vue|SpringBoot|Spring AI|쿠버네티스|컨테이너|Python|Java|RAG|Agent|Fine Tuning|sLLM|LangChain|HTML|Transformer|머신러닝|딥러닝|최적화|Feature Engineering|MSA|DevOps|Vector DB|서빙|스마트 데이터/;
    return heavy.test(subj) ? 2 : 1;
  }

  function mondayOf(date) {
    var d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var day = d.getDay();
    d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
    return d;
  }
  var baseMonday = mondayOf(new Date());

  function render() {
    var mon = new Date(baseMonday);
    mon.setDate(mon.getDate() + weekOffset * 7);
    currentMon = new Date(mon);
    var fri = new Date(mon); fri.setDate(fri.getDate() + 4);
    caption.textContent = "SKALA AI 개발 과정 · 4반(205호) 주간 시간표 · " + md(mon) + "–" + md(fri);
    weekLabel.textContent = weekOffset === 0 ? "이번 주"
      : weekOffset < 0 ? (-weekOffset) + "주 전" : weekOffset + "주 후";

    var todayStr = ymd(new Date());
    var days = [];
    for (var i = 0; i < 5; i++) {
      var d = new Date(mon); d.setDate(d.getDate() + i);
      var e = SCHED[ymd(d)];
      var amS = e ? e[0] : "수업 없음";
      var amP = e ? e[1] : "";
      var pmS = e && e.length >= 4 ? e[2] : amS;
      var pmP = e && e.length >= 4 ? e[3] : amP;
      var classDay = !!e && isClassDay(amS);
      var split = !!e && e.length >= 4;                       // 오전/오후 과목이 다른 날
      var next = nextSubj(d);
      // 한 과목의 '마지막 날'(다음 수업일에 과목이 바뀜) 오후에 '과제 실습'.
      // 오전·오후가 갈리는 날(split)은 이미 두 과목이라 제외.
      var lab = classDay && !split && next !== null && next !== pmS;
      var labH = labHours(pmS);                               // 과목 성격에 따라 1~2h
      days.push({
        idx: i + 1, amS: amS, amP: amP, pmS: pmS, pmP: pmP,
        catAm: cat(amS), catPm: cat(pmS), lab: lab, labH: labH,
        today: ymd(d) === todayStr && weekOffset === 0
      });
      var head = table.querySelector('thead th[data-day="' + (i + 1) + '"]');
      head.querySelector("[data-date]").textContent = md(d);
      head.classList.toggle("is-today", days[i].today);
    }

    function td(attrs, html) { return "<td " + attrs + ">" + html + "</td>"; }
    var LUNCH = '<td colspan="5"><button class="lunch-btn" type="button" data-lunch>점심시간 <small>이번 주 중식 보기 ↗</small></button></td>';
    var h = "";
    // 오전 09:00–12:00 (3시간, rowspan 3)
    h += '<tr><th scope="row">09:00–10:00</th>';
    days.forEach(function (x) {
      h += td('rowspan="3" data-col="' + x.idx + '" data-slot="am" data-cat="' + x.catAm + '"' + (x.today ? " data-today" : ""), cellHtml(x.amS, x.amP));
    });
    h += "</tr>";
    h += '<tr><th scope="row">10:00–11:00</th></tr>';
    h += '<tr><th scope="row">11:00–12:00</th></tr>';
    // 점심 12:00–13:00 (colspan 5)
    h += '<tr><th scope="row">12:00–13:00</th>' + LUNCH + "</tr>";
    // 오후 13:00–18:00 (5시간). 강의 rowspan = 과제실습 있으면 5-labH, 없으면 5
    h += '<tr><th scope="row">13:00–14:00</th>';
    days.forEach(function (x) {
      var span = x.lab ? (5 - x.labH) : 5;
      h += td('rowspan="' + span + '" data-col="' + x.idx + '" data-slot="pm" data-cat="' + x.catPm + '"' + (x.today ? " data-today" : ""), cellHtml(x.pmS, x.pmP));
    });
    h += "</tr>";
    h += '<tr><th scope="row">14:00–15:00</th></tr>';
    h += '<tr><th scope="row">15:00–16:00</th></tr>';
    // 16:00–17:00: 과제실습 2h 인 날 시작 (rowspan 2, 16~18시)
    h += '<tr><th scope="row">16:00–17:00</th>';
    days.forEach(function (x) { if (x.lab && x.labH === 2) h += td('rowspan="2" data-cat="lab"' + (x.today ? " data-today" : ""), "과제 실습"); });
    h += "</tr>";
    // 17:00–18:00: 과제실습 1h 인 날 (rowspan 1, 17~18시)
    h += '<tr><th scope="row">17:00–18:00</th>';
    days.forEach(function (x) { if (x.lab && x.labH === 1) h += td('data-cat="lab"' + (x.today ? " data-today" : ""), "과제 실습"); });
    h += "</tr>";

    tbody.innerHTML = h;
    bindLunch();
    positionNow();
  }

  function positionNow() {
    if (!line) return;
    var now = new Date();
    var dow = now.getDay();
    var mins = now.getHours() * 60 + now.getMinutes();
    var ok = weekOffset === 0 && dow >= 1 && dow <= 5 && mins >= START && mins <= END;
    if (!ok) { line.hidden = true; return; }
    var head = table.querySelector('thead th[data-day="' + dow + '"]');
    if (!head || !tbody) { line.hidden = true; return; }
    var slot = SLOTS[SLOTS.length - 1];
    for (var i = 0; i < SLOTS.length; i++) {
      if (mins >= SLOTS[i][0] && mins < SLOTS[i][1]) { slot = SLOTS[i]; break; }
    }
    var row = tbody.rows[slot[2]];
    if (!row) { line.hidden = true; return; }
    var prog = (mins - slot[0]) / (slot[1] - slot[0]);
    line.hidden = false;
    line.style.left = (table.offsetLeft + head.offsetLeft) + "px";
    line.style.width = head.offsetWidth + "px";
    line.style.top = (table.offsetTop + row.offsetTop + row.offsetHeight * prog) + "px";
  }

  // 점심 클릭 → 그 주 중식 메뉴 모달 (tbody 재생성 때마다 버튼 새로 바인딩)
  function bindLunch() {
    var btn = document.querySelector("[data-lunch]");
    if (!btn || !dialog) return;
    btn.onclick = function () {
      var mon = currentMon || baseMonday;
      var fri = new Date(mon); fri.setDate(fri.getDate() + 4);
      var rows = [];
      for (var i = 0; i < 5; i++) {
        var d = new Date(mon); d.setDate(d.getDate() + i);
        var m = MENU[ymd(d)];
        if (m) rows.push('<li><span class="menu-list__day">' + md(d) + ' (' + DOW[i] + ')</span><span class="menu-list__items">' + esc(m) + '</span></li>');
      }
      document.querySelector("[data-menu-title]").textContent = md(mon) + "–" + md(fri) + " 중식";
      document.querySelector("[data-menu-body]").innerHTML = rows.length
        ? '<ul class="menu-list">' + rows.join("") + "</ul>"
        : '<p class="text-muted">이 주 식단은 아직 없어요.<br />지금은 <strong>7월 식단</strong>만 등록돼 있어요.</p>';
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    };
  }
  if (dialog) {
    var closeBtn = document.querySelector("[data-menu-close]");
    if (closeBtn) closeBtn.addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  }

  if (prevBtn) prevBtn.addEventListener("click", function () { weekOffset--; render(); });
  if (nextBtn) nextBtn.addEventListener("click", function () { weekOffset++; render(); });

  render();
  setInterval(positionNow, 30 * 1000);
  window.addEventListener("resize", positionNow);
})();
