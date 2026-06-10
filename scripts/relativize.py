#!/usr/bin/env python3
"""
루트절대경로(/css/, /about/ ...)를 파일 깊이에 맞는 상대경로로 변환.
상대경로는 루트 배포·서브패스 배포 양쪽에서 모두 동작한다(이식성 ↑).
href/src 만 대상. https:// · // · tel: · mailto: · 앵커(#..) 는 건드리지 않음.
멱등(idempotent): 다시 돌려도 남은 루트절대경로가 없으면 무변경.
사용: python scripts/relativize.py
"""
import re, glob, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
files = []
for pat in ("index.html", "*/index.html", "*/*/index.html"):
    files += glob.glob(os.path.join(ROOT, pat))
files = sorted(set(files))

ATTR = re.compile(r'(\b(?:href|src)=")(/[^"]*)(")')

def relativize(path):
    rel = os.path.relpath(path, ROOT).replace(os.sep, "/")
    depth = rel.count("/")            # index.html=0, about/index.html=1, treatment/x/index.html=2
    prefix = "../" * depth
    changed = 0
    html = open(path, encoding="utf-8").read()

    def repl(m):
        nonlocal changed
        val = m.group(2)
        if val.startswith("//"):      # protocol-relative: leave alone
            return m.group(0)
        rest = val[1:]                # strip leading "/"
        if rest == "":                # value was exactly "/"
            new = "index.html" if depth == 0 else prefix
        else:
            new = prefix + rest
        changed += 1
        return m.group(1) + new + m.group(3)

    out = ATTR.sub(repl, html)
    if out != html:
        open(path, "w", encoding="utf-8").write(out)
    return depth, changed

total = 0
for f in files:
    d, c = relativize(f)
    total += c
    print(f"  depth {d}  {c:3d} refs  {os.path.relpath(f, ROOT)}")
print(f"\n변환 완료: {total} refs across {len(files)} files")
