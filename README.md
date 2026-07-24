## 무엇을

저장소 루트에 `CLAUDE.md`를 추가했습니다. 코드 변경은 없고 문서 1개만 추가됩니다.

## 왜

빌드 도구가 없는 3파일 정적 사이트라 HTML·CSS·JS가 프레임워크 대신 암묵적 계약으로
묶여 있습니다. 한 파일만 고치면 조용히 깨지는 지점들이 있어, `test_site.py`가 검사하는
그 계약들을 문서로 정리했습니다.

- id 계약 — `script.js`의 `$("#id")` 참조와 HTML id
- theme-color 삼중 동기화 — meta 태그 · `syncThemeColor()` · CSS `--bg`
- 네비게이션 링크는 반드시 `#앵커` (스크롤 스파이가 역참조함)
- README의 "섹션 N개" 문구와 실제 `<section>` 개수

## 리뷰어 참고

- `python3 -m unittest test_site` 7개 모두 통과 확인했습니다.
- `CLAUDE.md`는 배포 대상이 아닙니다. 배포는 `index.html`·`styles.css`·`script.js` 세 개뿐입니다.

# 폴리텍전준옥 개인 홈페이지

Notion 사이트(`https://fuschia-station-2ad.notion.site`)의 내용을 기반으로 만든
정적 개인 홈페이지입니다. 빌드 도구 없이 파일만 올리면 바로 동작합니다.

## 파일 구성

| 파일 | 설명 |
|---|---|
| `index.html` | 전체 페이지 구조 (섹션 7개) |
| `styles.css` | 디자인 토큰 · 다크/라이트 테마 · 반응형 |
| `script.js` | 테마 전환, 모바일 메뉴, 스크롤 애니메이션, 이메일 복사 |

## 로컬에서 보기

```bash
python3 -m http.server 4321
```

브라우저에서 `http://localhost:4321` 을 엽니다.
(`index.html` 을 더블클릭해도 되지만, 일부 브라우저는 `file://` 에서
클립보드 복사가 동작하지 않습니다.)

## 배포

빌드 과정이 없는 정적 파일이라, **`index.html` · `styles.css` · `script.js` 세 개만**
올리면 어디서든 동작합니다. (`README.md` 와 `.claude/` 는 올릴 필요 없습니다.)

모든 경로가 상대경로라 `example.com/` 이든 `example.com/site/` 든 그대로 동작합니다.

### 방법 A — Netlify Drop (가장 빠름, 5분)

터미널도 계정 가입도 없이 시작할 수 있습니다.

1. <https://app.netlify.com/drop> 접속
2. Finder에서 이 폴더를 통째로 드래그앤드롭
3. 바로 `랜덤이름.netlify.app` 주소가 발급됨

이 상태로는 임시 주소입니다. 계정을 만들어 사이트를 claim 하면 영구 보존되고,
Site settings → Change site name 에서 주소를 `poly-jeonjunok.netlify.app` 처럼 바꿀 수 있습니다.

수정할 때마다 다시 드래그앤드롭하면 갱신됩니다.

### 방법 B — GitHub Pages (무료 · 영구 · 버전 관리)

**B-1. 웹에서 업로드 (git 명령 없이)**

1. GitHub에서 새 저장소 생성 (Public)
2. "uploading an existing file" 클릭 → 세 파일 드래그앤드롭 → Commit
3. Settings → Pages → Source를 `Deploy from a branch`, 브랜치 `main` / 폴더 `/ (root)` 로 지정
4. 1~2분 뒤 `아이디.github.io/저장소이름/` 에서 공개

**B-2. 터미널에서 (권장 — 이후 수정이 편함)**

```bash
cd "/Users/jeonjun-ok/Movies/Claude Code"
git init -b main
git add .
git commit -m "폴리텍전준옥 홈페이지"
git remote add origin https://github.com/<아이디>/<저장소이름>.git
git push -u origin main
```

이후 Settings → Pages 에서 위 3번과 동일하게 설정합니다.
다음부터는 수정 후 아래 3줄이면 반영됩니다.

```bash
git add . && git commit -m "내용 수정" && git push
```

> 저장소 이름을 `<아이디>.github.io` 로 만들면 주소가 `아이디.github.io` 로 짧아집니다.

### 방법 C — Cloudflare Pages / Vercel

빌드 설정을 물어보면 **빌드 명령은 비우고**, 출력 디렉터리는 루트(`.`)로 둡니다.
GitHub 저장소를 연결해두면 push할 때마다 자동 배포됩니다.

### 개인 도메인 연결

세 서비스 모두 무료로 개인 도메인을 붙일 수 있습니다.
도메인 구입처(가비아·후이즈·Cloudflare 등)의 DNS 설정에서:

- **GitHub Pages** — `CNAME` 레코드를 `<아이디>.github.io` 로 지정 후, Pages 설정에 도메인 입력
- **Netlify / Cloudflare Pages** — 대시보드에서 도메인 추가하면 필요한 레코드를 안내해 줌

HTTPS 인증서는 세 곳 모두 자동으로 발급·갱신됩니다.

### 배포 후 확인할 것

- 강의·자료실 카드 8개가 Notion 페이지로 열리는지
- 유튜브 채널·재생목록 링크가 새 탭에서 열리는지
- 휴대폰에서 열어 햄버거 메뉴가 뜨는지
- 수정했는데 안 바뀌면 강제 새로고침 (⌘+Shift+R) — 브라우저가 CSS를 캐시합니다

## 내용 수정하기

### 링크

모든 링크는 `index.html` 안에 직접 적혀 있습니다. 배포일 기준 전부 정상(200) 확인했습니다.

- 강의 4개 · 자료실 4개 → Notion 하위 페이지
- 유튜브 채널 → `https://www.youtube.com/@ok7724` (폴리텍전준옥 · 전기기능사 전문채널)
- 유튜브 재생목록 2개 → `전기기능사(시퀀스제어)`, `AutoCAD`
- 문의 → `ok7724@gmail.com`

채널 링크는 4곳에 걸려 있습니다 — 상단 네비게이션 "유튜브" 버튼, 소개 섹션 프로필 카드의
`@ok7724` 배지, 영상 섹션 하단 "채널 전체 영상 보기" 버튼, 푸터 "바로가기" 열.

### 색상 · 폰트

`styles.css` 최상단 `:root` 의 CSS 변수만 바꾸면 전체 톤이 바뀝니다.

```css
--accent:   #FFC24B;  /* 메인 강조색 (다크) */
--accent-2: #5EE7DF;  /* 보조 강조색 */
```

라이트 테마 값은 `[data-theme="light"]` 블록에 따로 있습니다.

폰트는 Pretendard를 CDN에서 불러오고, 실패하면 시스템 한글 폰트로 대체됩니다.

### 통계 숫자

히어로의 `4 / 4 / 100%` 는 `index.html` 의 `.hero__stats` 에 하드코딩되어 있습니다.
과정이나 자료가 늘면 함께 고쳐주세요.

## 적용된 사항

- 다크 / 라이트 테마 전환 (선택값은 브라우저에 저장, 최초 방문 시 OS 설정 따름)
- 스크롤 진행 표시줄, 현재 섹션 네비게이션 하이라이트
- 스크롤 등장 애니메이션 (JS 실패 시에도 콘텐츠는 항상 보이도록 안전장치 포함)
- 모바일 햄버거 메뉴, 375px까지 가로 스크롤 없음
- 키보드 접근성 (본문 건너뛰기 링크, 포커스 표시, `aria-*` 속성)
- `prefers-reduced-motion` 존중, 인쇄용 스타일
