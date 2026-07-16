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

## 실행

`index.html`을 브라우저에서 열거나 VS Code Live Server로 실행.
