# 메이크업 클래스 → JJ 변신 영상 조립 (무음, 30fps)
# ────────────────────────────────────────────────────────────────────
# 구성: 훅(민낯+제목) → 단계 클립 N개(번호·제목·한 줄 팁) → 완성 홀드 → 엔딩(저장 유도 + kissinskin.net/class)
# 주소는 영상 내내 카드 바로 아래(위쪽은 정수리 머리카락에 묻혀 안 읽혔다). 글자는 틱톡 안전영역 0.60~0.75H 안.
# 입력: <dir>/step-0..N-9x16.jpg + clip-1..N.mp4 (gen-class-video.mjs)
# 출력(언어별):
#   <dir>/class-NN-<slug>-<lang>-tiktok.mp4  1080×1920 고화질 — 틱톡·쇼츠 업로드용(리포에 안 올림)
#   public/class/video/<slug>-<lang>.mp4      720×1280 웹용(~2MB) — 클래스 페이지
#   public/class/video/<slug>.webp            포스터(완성 얼굴) — 영상 로딩 전 첫 화면
# 사용: python3 scripts/build-class-video.py <lesson-slug> [--dir=...] [--lang=ko,en] [--no-web]
import json, re, subprocess, sys, os, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

args = sys.argv[1:]
slug = next(a for a in args if not a.startswith('--'))
opt = lambda k, d: next((a.split('=', 1)[1] for a in args if a.startswith(f'--{k}=')), d)
D = opt('dir', f'casting/class/{slug}')
LANGS = opt('lang', 'ko,en').split(',')
WEB = '--no-web' not in args

lessons = json.load(open('src/lib/class/lessons.json'))
cur = open('src/lib/class/curriculum.ts', encoding='utf8').read()
m = re.search(r"n: (\d+), slug: '" + re.escape(slug) + r"'.*?titleKo: '(.*?)', titleEn: '(.*?)'", cur, re.S)
N_CLASS, CUR_KO, CUR_EN = int(m.group(1)), m.group(2), m.group(3)
lesson = next(l for l in lessons if l['slug'] == slug)
steps = lesson['steps']

W, H, FPS = 1080, 1920, 30
A = 'scripts/assets/fonts/'
CREAM, VERM, INK = (245, 239, 227), (216, 80, 60), (33, 17, 20)

def fonts(lang):
    if lang == 'ko':  # DynaPuff 는 한글이 없다 → Pretendard
        return dict(title=lambda s: ImageFont.truetype(A + 'Pretendard-ExtraBold.otf', s),
                    body=lambda s: ImageFont.truetype(A + 'Pretendard-Medium.otf', s),
                    num=lambda s: ImageFont.truetype(A + 'DynaPuff.ttf', s))
    return dict(title=lambda s: ImageFont.truetype(A + 'DynaPuff.ttf', s),
                body=lambda s: ImageFont.truetype(A + 'IBMPlexMono-Medium.ttf', s),
                num=lambda s: ImageFont.truetype(A + 'DynaPuff.ttf', s))
mono = lambda s: ImageFont.truetype(A + 'IBMPlexMono-Medium.ttf', s)

def fit(d, txt, fnt, size, maxw, minsize=30):
    while size > minsize and d.textlength(txt, font=fnt(size)) > maxw: size -= 2
    return fnt(size), size

def centered(d, y, txt, f, fill):
    d.text(((W - d.textlength(txt, font=f)) / 2, y), txt, font=f, fill=fill)

def overlay(im, draw_fn, alpha=1.0):
    if alpha <= 0: return im
    layer = Image.new('RGBA', (W, H)); draw_fn(ImageDraw.Draw(layer))
    if alpha < 1: layer.putalpha(layer.getchannel('A').point(lambda v: int(v * alpha)))
    return Image.alpha_composite(im.convert('RGBA'), layer).convert('RGB')

def kb(img, t, z0, z1):
    z = z0 + (z1 - z0) * t; w, h = W / z, H / z
    x, y = (W - w) / 2, (H - h) * 0.35
    return img.resize((W, H), Image.LANCZOS, box=(x, y, x + w, y + h))

def clip_frames(path, n):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}',
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
    return [Image.fromarray(fr[i]) for i in np.linspace(0, len(fr) - 1, n).round().astype(int)]

CARD_Y = int(H * 0.60)

def build(lang):
    F = fonts(lang); ko = lang == 'ko'
    title = lesson.get('videoTitleKo' if ko else 'videoTitleEn') or (CUR_KO if ko else CUR_EN)
    title = title if ko else title.upper()

    def watermark(d):
        y = CARD_Y + 268; f = mono(34); w = d.textlength('kissinskin.net', font=f)
        d.rounded_rectangle(((W - w) / 2 - 18, y - 4, (W + w) / 2 + 18, y + 46), 25, fill=CREAM + (215,))
        centered(d, y, 'kissinskin.net', f, INK + (170,))

    def card(d):
        d.rounded_rectangle((70, CARD_Y, W - 70, CARD_Y + 250), 36, fill=CREAM + (238,))

    def hook(d):
        card(d)
        centered(d, CARD_Y + 34, f'클래스 {N_CLASS}편 · {len(steps)}단계' if ko else f'CLASS {N_CLASS:02d} · {len(steps)} STEPS',
                 F['body'](38) if ko else mono(36), VERM + (255,))
        f, _ = fit(d, title, F['title'], 96, W - 200)
        centered(d, CARD_Y + 96, title, f, INK + (255,))

    def step_card(k, s):
        def draw(d):
            card(d)
            d.ellipse((110, CARD_Y + 50, 260, CARD_Y + 200), fill=VERM + (255,))
            fn = F['num'](92); num = str(k)
            d.text((185 - d.textlength(num, font=fn) / 2, CARD_Y + 62), num, font=fn, fill=(255, 255, 255, 255))
            t = s['titleKo'] if ko else s['titleEn']
            f, size = fit(d, t, F['title'], 64 if not ko else 60, W - 70 - 295 - 40)
            d.text((295, CARD_Y + 54 + (64 - size) // 2), t, font=f, fill=INK + (255,))
            tip = s.get('shortKo' if ko else 'shortEn', '')
            if tip:
                f, _ = fit(d, tip, F['body'], 40 if ko else 36, W - 70 - 298 - 40)
                d.text((298, CARD_Y + 150), tip, font=f, fill=INK + (200,))
        return draw

    def end_card(d):
        d.rectangle((0, 0, W, H), fill=CREAM + (215,))
        y = int(H * 0.36)
        centered(d, y, f'클래스 {N_CLASS}편' if ko else f'CLASS {N_CLASS:02d}', F['body'](42) if ko else mono(40), VERM + (255,))
        f, _ = fit(d, title, F['title'], 100, W - 160)
        centered(d, y + 60, title, f, INK + (255,))
        centered(d, y + 230, '다음 메이크업 때 보려면 저장' if ko else 'Save this for your next makeup', F['body'](42) if ko else mono(40), INK + (230,))
        centered(d, y + 330, '전체 클래스 무료 →' if ko else 'Full class, free →', F['body'](46) if ko else mono(44), INK + (255,))
        centered(d, y + 395, 'kissinskin.net/class', F['num'](84), VERM + (255,))
        centered(d, y + 540, 'AI 생성 모델' if ko else 'AI-generated model', F['body'](30) if ko else mono(28), INK + (150,))

    out = f'{D}/class-{N_CLASS:02d}-{slug}-{lang}-tiktok.mp4'
    enc = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    def emit(im, mark=True):
        if mark: im = overlay(im, watermark)
        enc.stdin.write(np.asarray(im).tobytes())

    s0 = Image.open(f'{D}/step-0-9x16.jpg').convert('RGB')
    for i in range(48): emit(overlay(kb(s0, i / 47, 1.0, 1.04), hook, min(1, i / 6)))           # 훅 1.6초
    z = 1.04
    for k, s in enumerate(steps, 1):                                                              # 단계 3초씩
        for i, fr in enumerate(clip_frames(f'{D}/clip-{k}.mp4', 90)):
            emit(overlay(kb(fr, 0, z, z), step_card(k, s), min(1, i / 5)))
    last = Image.open(f'{D}/step-{len(steps)}-9x16.jpg').convert('RGB')
    for i in range(30): emit(kb(last, i / 29, z, z + 0.02))                                       # 완성 홀드 1초
    blur = kb(last, 1, z + 0.02, z + 0.02).filter(ImageFilter.GaussianBlur(6))
    for i in range(72): emit(overlay(blur, end_card, min(1, i / 8)), mark=False)                 # 엔딩 2.4초
    enc.stdin.close(); enc.wait()
    print('ok', out)

    if WEB:
        os.makedirs('public/class/video', exist_ok=True)
        web = f'public/class/video/{slug}-{lang}.mp4'
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', out, '-vf', 'scale=720:1280:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow',
                        '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', web], check=True)
        print('web', web, f'{os.path.getsize(web) / 1e6:.1f}MB')

for lang in LANGS: build(lang)
if WEB:  # 포스터 = 완성 얼굴(글자 없음 — 두 언어 공용)
    Image.open(f'{D}/step-{len(steps)}-9x16.jpg').convert('RGB').resize((720, 1280), Image.LANCZOS).save(f'public/class/video/{slug}.webp', quality=80)
    print('poster ok')
