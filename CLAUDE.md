# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

폴리텍전준옥(전기·제어 교육) 개인 홈페이지. **빌드 도구·의존성·프레임워크가 전혀 없는
정적 사이트**입니다. 두 외부 리소스로 연결되는 랜딩 페이지입니다 — 유튜브 채널
`@ok7724`(폴리텍전준옥 · 전기기능사 전문채널)와 전기기능사 실습실 `https://www.kopo.kr`
(로그인 없는 회로 시뮬레이터). 콘텐츠·링크는 전부 이 두 곳에서 나옵니다.

배포 대상은 `index.html` · `styles.css` · `script.js` + 에셋 `icon.png`(파비콘·프로필 사진) ·
`simulator-sample.html`(단독 실행 시뮬레이터, 의존성 없음)입니다. `.claude/`는
`.gitignore`에 있고, `README.md` · `test_site.py`는 배포에 포함되지 않습니다.
모든 경로가 상대경로라 서브디렉터리 배포(`example.com/site/`)도 그대로 동작합니다.

## 명령어

로컬 서버 (`.claude/launch.json`에 `site`로 등록되어 있어 preview 도구로도 실행 가능):

```bash
python3 -m http.server 4321
```

정합성 테스트 (외부 의존성 없음, 표준 unittest):

```bash
python3 -m unittest test_site -v
```

단일 테스트만:

```bash
python3 -m unittest test_site.TestThemeColor.test_meta_matches_dark_background
```

## 아키텍처

### 파일 간 암묵적 계약

세 파일이 프레임워크 없이 묶여 있어, 한 파일만 고치면 조용히 깨지는 지점들이 있습니다.
`test_site.py`는 정확히 그 지점들을 검사합니다 — **수정 후 반드시 실행하세요.**

- **id 계약** — `script.js`는 `$("#id")`로 요소를 찾습니다
  (`nav`, `navLinks`, `burger`, `themeToggle`, `progress`, `toTop`, `toast`,
  `copyMail`, `year`). HTML에서 id를 바꾸면 JS도 함께 고쳐야 합니다.
- **theme-color 삼중 동기화** — 브라우저 UI 색은 세 곳에 중복돼 있습니다:
  `index.html`의 `<meta name="theme-color">`, `script.js`의 `syncThemeColor()`
  하드코딩 분기, `styles.css`의 `--bg` (dark/light 각각). 셋 중 하나만 바꾸면 테스트가 실패합니다.
- **네비게이션 링크는 반드시 `#앵커`** — `script.js`가 `.nav__links a`의 href로
  섹션 엘리먼트를 역참조해 스크롤 스파이를 구성하기 때문에, 외부 링크를 넣으면 추적이 깨집니다.
  (유튜브 같은 외부 링크는 `.nav__links` 밖의 버튼으로 둡니다.)
- **`target="_blank"`에는 `rel="noopener"`** 필수 — 테스트가 강제합니다.
- **README의 "섹션 N개" 문구**와 실제 `<section>` 개수가 일치해야 합니다.
  섹션을 추가/삭제하면 README도 같이 고치세요.

### script.js

IIFE 하나에 `"use strict"`, ES5 문법(`var`, `function`), 빌드 단계 없음. 새 코드도
이 스타일을 따르세요. 모든 기능이 `if (element)` 가드로 감싸여 있어 요소가 없어도
페이지는 죽지 않습니다. 기능 블록은 주석 배너(`/* ---------- Theme ---------- */`)로 구분됩니다.

주의할 점:
- 테마 선택값은 `localStorage["pjo-theme"]`. 최초 방문 시에는 `prefers-color-scheme`를 따릅니다.
  `localStorage` 접근은 프라이빗 모드 대비로 항상 `try/catch`.
- 스크롤 애니메이션(`.reveal` → `.is-in`)에는 **안전장치가 있습니다**:
  IntersectionObserver 미지원 시 즉시 전부 표시, 1.2초 뒤 뷰포트 내 요소 강제 표시,
  그리고 `<noscript>` CSS 오버라이드. 콘텐츠가 보이지 않는 상태로 남는 일은 없어야 합니다.
- 이메일 복사는 `navigator.clipboard` → `document.execCommand` 폴백 →
  실패 시 주소를 토스트로 노출. `file://`에서는 클립보드가 막히므로 로컬 확인은 HTTP 서버로 하세요.

### styles.css

`:root`의 CSS 변수가 단일 소스입니다. 테마는 `<html data-theme="dark|light">`로 전환되고,
다크가 기본(`:root, [data-theme="dark"]`), 라이트는 `[data-theme="light"]`에서 토큰을 덮어씁니다.
**색·간격·모서리를 하드코딩하지 말고 토큰을 쓰세요.** 라이트 테마에서는 `--accent`도
대비를 위해 다른 값(`#E08A00`)으로 재정의된다는 점에 주의.

반응형은 mobile-first가 아니라 혼합입니다 — 카드/타일 그리드는 `min-width` 쿼리로
열을 늘리고, 네비게이션은 `max-width: 900px`에서 햄버거로 전환합니다. 375px에서
가로 스크롤이 없어야 합니다. `prefers-reduced-motion`과 인쇄용 스타일도 유지하세요.

### 콘텐츠 위치

링크·통계·문구는 전부 `index.html`에 하드코딩되어 있습니다 (데이터 파일 없음).

- **강의(#courses) 4개 카드** → 유튜브 재생목록(`youtube.com/playlist?list=...`):
  공개문제 해설 · 필기 기출 풀이 · 시퀀스제어 기초실습 · AutoCAD 따라하기.
- **실습실(#library) 4개 타일** → 전기기능사 실습실 `https://www.kopo.kr`(세부 URL이 없어 전부 루트로 연결).
- **채널(#youtube) 3개 카드** → 강의 외 재생목록(교육자료·일반동영상, 고사성어, 트레킹).
- 유튜브 채널 `@ok7724` 링크는 **4곳**: 상단 네비게이션, 소개 섹션 프로필 배지,
  채널 섹션 하단 버튼, 푸터. 하나만 바꾸면 불일치가 생깁니다.
- 히어로의 `349 / 58 / 100%` 통계는 `.hero__stats`에 하드코딩 — 영상/자료가 늘면 함께 수정.

## 언어

코드 주석, 커밋 메시지, 문서, UI 문자열 모두 한국어입니다. 유지하세요.
