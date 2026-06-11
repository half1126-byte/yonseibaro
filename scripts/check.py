# -*- coding: utf-8 -*-
"""연세바로 사이트 무결성 검사기 — 푸시 전 실행.

  python scripts/check.py            # 시안(draft) 모드 검사
  python scripts/check.py --launch   # 개원 전환(launch) 검사 — LAUNCH.md의 16개 수동 교체 검증

검사 항목
  1. 내부 앵커(#id) 전수 해상 — 페이지 내/크로스 페이지(../#contact 등)
  2. JS 계약 셀렉터 존재 — widgets.js가 기대하는 훅이 마크업에 있는지
  3. 6페이지 공통 크롬 — float-cta / footer-info--legal / site-config+widgets 로드
  4. draft: 더미(031-000-0000)·noindex·draftInfo:true 일관성
     launch: 더미 0건·noindex 0건·draftInfo:false·JSON-LD/og 교체 확인
  5. git 추적 파일에 내부 문서(개선진단/검수) 유출 없음
"""
import io, os, re, sys, subprocess

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(errors='replace')  # cp949 콘솔에서 특수문자 크래시 방지

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ['index.html', 'about/index.html', 'cases/index.html',
         'treatment/invisalign/index.html', 'treatment/bracket/index.html',
         'treatment/children/index.html']
LAUNCH = '--launch' in sys.argv
errors, warns = [], []

def read(rel):
    return io.open(os.path.join(ROOT, rel), encoding='utf-8').read()

docs = {p: read(p) for p in PAGES}
ids = {p: set(re.findall(r'\bid="([^"]+)"', s)) for p, s in docs.items()}

# ---- 1. 내부 앵커 해상 ----
for p, s in docs.items():
    base = os.path.dirname(p)
    for href in re.findall(r'href="([^"]+)"', s):
        if href.startswith(('http', 'mailto:', 'tel:', 'javascript:')):
            continue
        path, _, frag = href.partition('#')
        if not frag:
            continue
        if path in ('', '.'):
            target = p
        else:
            norm = os.path.normpath(os.path.join(base, path)).replace('\\', '/')
            if norm in ('.', ''):
                norm = '.'
            target = (norm.rstrip('/') + '/index.html').lstrip('./') if not norm.endswith('.html') else norm
            target = 'index.html' if target == '/index.html' or target == 'index.html' else target
        if target not in ids:
            warns.append('%s: 앵커 대상 페이지 미검사 — %s' % (p, href))
        elif frag not in ids[target]:
            errors.append('%s: 깨진 앵커 %s (대상 %s에 id 없음)' % (p, href, target))

# ---- 2. JS 계약 셀렉터 (widgets.js가 querySelector하는 훅) ----
CONTRACT = {
    'index.html': ['data-notice-pop', 'class="map-card"', 'class="contact-info"',
                   'data-config-address', 'id="contact"'],
}
ALL_PAGES = ['data-cta="tel"', 'data-config-tel', 'class="footer-bottom"', 'class="float-cta"']
for p, s in docs.items():
    for token in ALL_PAGES + CONTRACT.get(p, []):
        if token not in s:
            errors.append('%s: JS 계약 훅 누락 — %s' % (p, token))

# ---- 3. 공통 크롬 + 스크립트 매트릭스 ----
for p, s in docs.items():
    for token in ['footer-info--legal', 'site-config.js', 'js/widgets.js', 'js/nav.js']:
        if token not in s:
            errors.append('%s: 공통 크롬 누락 — %s' % (p, token))
    if 'data-cover' in s and 'cover.js' not in s:
        errors.append('%s: data-cover 있는데 cover.js 미로드' % p)
    if 'data-cover' not in s and 'cover.js' in s:
        warns.append('%s: data-cover 없는데 cover.js 로드 (불필요)' % p)
    if 'ux.js' in s:
        errors.append('%s: 삭제된 ux.js 참조 잔존' % p)

# ---- 4. 모드별 정보 일관성 ----
cfg = read('js/site-config.js')
dummy_pat = re.compile(r'000-0000|0310000000|\+82-31-000-0000')
if LAUNCH:
    for p, s in docs.items():
        if dummy_pat.search(s):
            errors.append('%s: 더미 전화 잔존 (launch)' % p)
        if 'noindex' in s:
            errors.append('%s: noindex 잔존 (launch)' % p)
        if '개원 시 기재' in s or '개원 시 게시' in s:
            warns.append('%s: "개원 시 기재" placeholder 잔존' % p)
    if 'draftInfo: true' in cfg:
        errors.append('site-config.js: draftInfo가 아직 true (launch)')
    if dummy_pat.search(cfg):
        errors.append('site-config.js: 더미 전화 잔존 (launch)')
    if re.search(r'tel:\s*""', cfg):
        errors.append('site-config.js: tel이 비어 있음 (launch)')
    robots = read('robots.txt')
    if 'Disallow: /' in robots.replace('Disallow: /$', ''):
        warns.append('robots.txt: 차단 규칙 확인 필요')
else:
    for p, s in docs.items():
        if 'noindex' not in s:
            errors.append('%s: 시안 단계인데 noindex 없음 — 검색 노출 위험' % p)
    if 'draftInfo: true' not in cfg:
        warns.append('site-config.js: draft 모드인데 draftInfo true 아님 — 시안 고지 미표시')
    if 'showPopup: true' in cfg:
        warns.append('site-config.js: 팝업이 켜져 있음 — 의도 확인')

# ---- 5. 내부 문서 유출 ----
try:
    tracked = subprocess.check_output(['git', 'ls-files'], cwd=ROOT).decode('utf-8', 'replace')
    for line in tracked.splitlines():
        if ('개선진단' in line) or ('검수' in line) or line.endswith('.md'):
            errors.append('git 추적 중인 내부 문서: ' + line)
except Exception as e:
    warns.append('git ls-files 실패: %s' % e)

# ---- 결과 ----
mode = 'LAUNCH' if LAUNCH else 'DRAFT'
out = sys.stdout
for w in warns:
    out.write('[warn] %s\n' % w)
for e in errors:
    out.write('[FAIL] %s\n' % e)
out.write('%s check: %d errors / %d warnings\n' % (mode, len(errors), len(warns)))
sys.exit(1 if errors else 0)
