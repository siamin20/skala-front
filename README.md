# SKALA-FRONT

SKALA 과정 HTML · CSS · JavaScript 과제 저장소.
과제 페이지들을 개인 포털 하나로 묶는 중.

## 구조

```
index.html      진입점 (루트)
html/           과제 페이지
css/            스타일 — style.css가 @import로 모듈(tokens/base/layout/components/…) 통합
script/         JavaScript — 테마 토글, 네비, 스크롤 인터랙션
media/          로고·이미지 등
```

## 공통

- 디자인 토큰(`:root` CSS 변수)으로 색·타이포·간격 관리
- 다크 모드 — `data-theme` + `localStorage` + OS 선호 감지
- 반응형 — 786px 이하 1열 + 모바일 햄버거 네비
- 접근성 — 시맨틱 태그, 스킵 링크, `:focus-visible`, `prefers-reduced-motion` 존중
- 브랜드 — SKALA 로고 + `.신민서`

## 페이지

### index.html — 개인 포털 (진입점 · 바로가기)

과제 페이지를 하나로 묶는 허브. 루트에 위치(Live Server 편의).

- 필수 요소: `<nav>` `<main>` `<aside>` + 각 페이지 `<a>` 바로가기, 브라우저 title, 환영 `<h1>`
- 구성: 히어로(환영 헤딩), 섹션 점프 내비(scrollspy), 온보딩 대시보드, 바로가기 카드 그리드, 사이드바(미니 앱 마운트)
- 온보딩 대시보드(`script/dashboard.js`): 현재 상태·다음 일정 카운트다운, 출결 체크(날짜별 `localStorage`, 매일 리셋), 과정 진도 D-day·`<progress>`, 주소 복사, 슬랙 온보딩 문서 링크
- 사이드바: 라이브 시계(`<time>`), 미니게임·날씨 위젯 자리(JS 과제에서 연결 예정)
- 보안: WiFi·도어락·Zoom 등 민감 정보는 소스에 두지 않고 권한 필요한 슬랙 문서로 링크 → Public 클론 안전
- CSS: Flexbox 헤더·`portal-grid` 가로 배치, 카드 Grid, 다크 모드, 786px 반응형, 등장 애니메이션

### html/myHoliday.html — 나의 휴일 일과 (실습)

휴일 하루(러닝 → 공부 → 야구)를 시간순으로 정리한 페이지.

- 필수 요소: `<h1>` `<h2>` `<p>` `<br>` `<mark>`
- 추가 요소: `<time datetime>` (일과 시각), 시맨틱 `<header> <nav> <main> <section> <article>`
- CSS: 디자인 토큰, Flexbox·Grid 카드 배치, 786px 반응형, 다크 모드, 스크롤 등장 애니메이션
- JS: 테마 토글, 모바일 네비, 맨 위로 버튼 (`script/theme.js`, `script/app.js`)

### html/myProfile.html — 나의 소개 (과제)

프로필 사진 · 강점 요약 · 목록 · 대학 생활 · 일상 사진 · 약력 · FAQ로 구성한 개인 소개.

- 필수 요소: `<ul>`(음식) `<ol>`(할 일) `<dl>`/`<dt>`/`<dd>`(단어)
- 제약: **파일 내 CSS 0줄** — 외부 `style.css` + class 만으로 스타일링
- 추가: 프로필 아바타·일상 사진(`media/`), 포트폴리오·GitHub 링크(인라인 SVG 아이콘),
  `<details>` 약력 타임라인·FAQ 아코디언, CSS Grid 카드, 다크 모드, 반응형

### html/myClass.html — 나의 강의 일정 (과제)

SKALA 4반(205호) 주간 강의 시간표. 09:00–18:00 1시간 단위 격자에 실제 커리큘럼·담당 교수를 얹었다.

- 필수 요소: `<table>` `<thead>` `<tbody>` `<td>` + **셀 병합** — 오전 강의 `rowspan="3"`, 점심 `colspan="5"`
- 제약: **파일 내 CSS 0줄** — 스타일은 외부 `style.css`, 인터랙션은 외부 `script/schedule.js`
- 추가 요소: `<caption>` `<colgroup>` `<tfoot>` `<th scope>`, 색상 범례
- 점진적 향상: HTML `<tbody>`는 개강 첫 주(무JS·소스 열람용) 정적 폴백, `schedule.js`가 로드되면 현재 주로 다시 렌더
- JS(`script/schedule.js`): 진입 시 오늘이 속한 주 자동 표시, 좌우 화살표 주 이동, 오늘 열 현재 시각 가로줄(30초 갱신),
  과목 카테고리별 색 구분, 과목 마지막 날 오후에 '과제 실습' 블록(비중 큰 과목 2h/가벼운 과목 1h), 점심 클릭 시 그 주 중식 메뉴 `<dialog>` 모달
- CSS: 카테고리 색·오늘 열 강조(액센트 워시)·현재 시각 줄·주 이동 네비·중식 모달, 다크 모드, 786px 반응형

## 실행

`index.html`을 브라우저에서 열거나 VS Code Live Server로 실행.
