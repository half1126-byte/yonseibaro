#!/usr/bin/env python3
# 퍼플 브랜드 적용: Pretendard 폰트 + theme-color + favicon + 헤더 BR 로고 (6개 HTML, depth 대응)
import re, glob, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
files = []
for pat in ("index.html","*/index.html","*/*/index.html"):
    files += glob.glob(os.path.join(ROOT, pat))
files = sorted(set(files))

PRETENDARD = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendard-variable.min.css" />'
CORMORANT  = '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,600&display=swap" rel="stylesheet" />'
FONT_RE = re.compile(r'<link href="https://fonts\.googleapis\.com/css2\?family=DM\+Sans.*?rel="stylesheet" />', re.S)
MARK = 'aria-label="연세바로치과교정과의원 홈">'  # 헤더 워드마크 앵커

for f in files:
    rel = os.path.relpath(f, ROOT).replace(os.sep, "/")
    depth = rel.count("/")
    prefix = "../" * depth
    html = open(f, encoding="utf-8").read()
    orig = html

    # 1) 폰트: DM Sans/Noto → Pretendard + Cormorant
    html = FONT_RE.sub(PRETENDARD + "\n  " + CORMORANT, html)

    # 2) theme-color → 퍼플
    html = re.sub(r'(<meta name="theme-color" content=")#[0-9A-Fa-f]{6}(")', r'\g<1>#6768AB\g<2>', html)

    # 3) favicon (theme-color 메타 뒤) — 중복 방지
    if 'rel="icon"' not in html:
        html = html.replace(
            '<meta name="theme-color" content="#6768AB" />',
            '<meta name="theme-color" content="#6768AB" />\n  <link rel="icon" href="%sassets/brand/logo.svg" type="image/svg+xml" />' % prefix,
            1)

    # 4) 헤더 워드마크 앞에 BR 로고 삽입 (중복 방지)
    if "wordmark__logo" not in html and MARK in html:
        img = '<img class="wordmark__logo" src="%sassets/brand/logo.svg" alt="" width="30" height="26" />' % prefix
        html = html.replace(MARK, MARK + img, 1)

    if html != orig:
        open(f, "w", encoding="utf-8").write(html)
        print("updated  depth%d  %s" % (depth, rel))
    else:
        print("no-change %s" % rel)
