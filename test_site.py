#!/usr/bin/env python3
"""정적 사이트 정합성 검사.

빌드 도구도 외부 의존성도 없이, 파일 세 개가 서로 어긋나지 않았는지만 확인합니다.

    python3 -m unittest test_site -v
"""

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "styles.css").read_text(encoding="utf-8")
JS = (ROOT / "script.js").read_text(encoding="utf-8")

HTML_IDS = set(re.findall(r'\bid="([^"]+)"', HTML))


def css_var(selector, name):
    """해당 선택자를 포함하는 규칙에서 CSS 변수 값을 꺼냅니다.

    `:root, [data-theme="dark"] { ... }` 처럼 선택자가 나열된 규칙도 찾습니다.
    """
    for selectors, body in re.findall(r"([^{}]+)\{([^{}]*)\}", CSS):
        if selector not in [s.strip() for s in selectors.split(",")]:
            continue
        value = re.search(r"--" + name + r":\s*([^;]+);", body)
        if value:
            return value.group(1).strip()
    raise AssertionError("변수를 찾지 못했습니다: --{} in {}".format(name, selector))


class TestAnchors(unittest.TestCase):
    def test_internal_anchors_resolve(self):
        """페이지 안의 #링크는 모두 실제 존재하는 id를 가리켜야 합니다."""
        for target in sorted(set(re.findall(r'href="#([^"]+)"', HTML))):
            with self.subTest(anchor="#" + target):
                self.assertIn(target, HTML_IDS)

    def test_nav_links_are_internal(self):
        """네비게이션 링크는 script.js가 섹션을 추적할 수 있도록 모두 #앵커여야 합니다."""
        nav = re.search(r'<nav class="nav__links".*?</nav>', HTML, re.S)
        self.assertIsNotNone(nav)
        hrefs = re.findall(r'href="([^"]+)"', nav.group(0))
        self.assertTrue(hrefs)
        for href in hrefs:
            with self.subTest(href=href):
                self.assertTrue(href.startswith("#"))


class TestScriptContract(unittest.TestCase):
    def test_referenced_ids_exist(self):
        """script.js가 찾는 요소가 HTML에 실제로 있어야 합니다."""
        referenced = set(re.findall(r'\$\("#([A-Za-z0-9_-]+)"\)', JS))
        self.assertTrue(referenced, "script.js에서 id 참조를 하나도 찾지 못했습니다")
        for element_id in sorted(referenced):
            with self.subTest(element_id=element_id):
                self.assertIn(element_id, HTML_IDS)


class TestThemeColor(unittest.TestCase):
    """meta[theme-color]는 브라우저 UI 색이라, 실제 배경색과 어긋나면 티가 납니다."""

    def _js_theme_colors(self):
        line = re.search(
            r'data-theme"\)\s*===\s*"light"\s*\?\s*"(#[0-9A-Fa-f]{3,8})"\s*:\s*"(#[0-9A-Fa-f]{3,8})"',
            JS,
        )
        self.assertIsNotNone(line, "script.js의 theme-color 분기를 찾지 못했습니다")
        return {"light": line.group(1), "dark": line.group(2)}

    def test_meta_matches_dark_background(self):
        meta = re.search(r'<meta name="theme-color" content="([^"]+)"', HTML)
        self.assertIsNotNone(meta)
        self.assertEqual(meta.group(1).upper(), css_var('[data-theme="dark"]', "bg").upper())

    def test_script_matches_css_backgrounds(self):
        colors = self._js_theme_colors()
        self.assertEqual(colors["dark"].upper(), css_var('[data-theme="dark"]', "bg").upper())
        self.assertEqual(
            colors["light"].upper(), css_var('[data-theme="light"]', "bg").upper()
        )


class TestExternalLinks(unittest.TestCase):
    def test_blank_targets_set_noopener(self):
        """새 탭으로 여는 링크는 rel="noopener"가 있어야 합니다."""
        for tag in re.findall(r"<a\b[^>]*>", HTML):
            if 'target="_blank"' not in tag:
                continue
            with self.subTest(tag=tag[:80]):
                rel = re.search(r'rel="([^"]*)"', tag)
                self.assertIsNotNone(rel, "rel 속성이 없습니다")
                self.assertIn("noopener", rel.group(1).split())


class TestReadme(unittest.TestCase):
    def test_section_count_matches_readme(self):
        """README가 적어 둔 섹션 개수와 실제 <section> 개수가 같아야 합니다."""
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        stated = re.search(r"섹션 (\d+)개", readme)
        self.assertIsNotNone(stated, "README에서 섹션 개수 문구를 찾지 못했습니다")
        self.assertEqual(int(stated.group(1)), len(re.findall(r"<section\b", HTML)))


if __name__ == "__main__":
    unittest.main(verbosity=2)
