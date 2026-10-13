# 메이크업 클래스 → JJ 변신 영상 조립 (무음, 30fps)
# ────────────────────────────────────────────────────────────────────
# 구성: 훅(민낯+제목) → 단계 클립 N개(번호·제목·한 줄 팁) → 완성 홀드 → 엔딩(저장 유도 + kissinskin.net/class)
# 주소는 영상 내내 카드 바로 아래(위쪽은 정수리 머리카락에 묻혀 안 읽혔다). 글자는 턱(≈0.57H) 아래 0.60~0.80H.
# 입력: <dir>/step-0..N-9x16.jpg + clip-1..N.mp4 (gen-class-video.mjs)
# 출력(언어별):
#   <dir>/class-NN-<slug>-<lang>-tiktok.mp4  1080×1920 고화질 — 틱톡·쇼츠 업로드용(리포에 안 올림)
#   public/class/video/<slug>-<lang>.mp4      720×1280 웹용(~2MB) — 클래스 페이지
#   public/class/video/<slug>.webp            포스터(완성 얼굴) — 영상 로딩 전 첫 화면
# 사용: python3 scripts/build-class-video.py <lesson-slug> [--dir=...] [--lang=ko,en] [--no-web]
import math
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

CARD_Y = int(H * 0.64)  # 단계 바(CARD_Y-74)가 턱 아래로 — 0.60 이면 바가 턱·입술 테두리를 덮었다(2026-10-11 운영자)

# ── 부위 표시(2026-10-11 운영자: "번호만으론 어디를 하는지 모르겠다") ─────────────────────
# 사이트 '메이크업 맵'과 같은 디자인: 지금 부위 = 핑크 점선 테두리(그려지며 등장) + 핑크 번호 핀,
# 끝낸 부위 = 네이비 번호 핀이 남는다. 카드 위 단계 바 = 끝냄(네이비)·지금(핑크)·다음(흐림).
# 위치는 프레임마다 MediaPipe 로 얼굴을 다시 찾아 따라간다(JJ 가 숨 쉬고 눈 감아도 맞게).
import cv2, mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions
PINK, NAVY = (235, 71, 99), (7, 9, 83)
_det = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=opt('model', 'casting/face_landmarker.task')), num_faces=1))
_last = [None]
def face_pts(im):
    small = np.asarray(im.resize((W // 2, H // 2)))
    r = _det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(small)))
    if r.face_landmarks:
        P = np.array([[p.x * W, p.y * H] for p in r.face_landmarks[0]], np.float32)
        _last[0] = P if _last[0] is None else _last[0] * .4 + P * .6   # 떨림 줄이기
    return _last[0]

R_BROW = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]; L_BROW = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276]
R_EYE = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
L_EYE = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249]
LIPS = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146]
OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
JAW = [234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323, 454]

def regions(P, key):  # → [(cx, cy, ax, ay, angle)]  ax/ay = 반지름
    fw = np.linalg.norm(P[234] - P[454])
    def fe(idx, sc, minr=.05):
        (cx, cy), (w, h), a = cv2.fitEllipse(P[idx]); return (cx, cy, max(w / 2 * sc, fw * minr), max(h / 2 * sc, fw * minr), a)
    def at(c, t, wgt, rx, ry):
        x, y = P[c] * (1 - wgt) + P[t] * wgt; return (x, y, fw * rx, fw * ry, 0)
    return {
        'skin': lambda: [fe(OVAL, 1.04)],
        'brows': lambda: [fe(R_BROW, 1.3, .045), fe(L_BROW, 1.3, .045)],
        'eyes': lambda: [fe(R_EYE + [46, 53, 52, 65, 55], 1.15), fe(L_EYE + [276, 283, 282, 295, 285], 1.15)],
        'cheeks': lambda: [at(50, 117, .4, .17, .12), at(280, 346, .4, .17, .12)],
        'lips': lambda: [fe(LIPS, 1.3)],
        'underEye': lambda: [at(230, 23, .5, .12, .05), at(450, 253, .5, .12, .05)],
        'jaw': lambda: [fe(JAW, 1.0)],
    }.get(key, lambda: [])()

PART = re.search(r"slug: '" + re.escape(slug) + r"', part: '(\w+)'", cur).group(1)
def step_key(st):  # 피부 단계의 눈밑·턱 크롭은 '베이스' 파트에서만 그 자리를 뜻한다(1편 베이스는 얼굴 전체)
    return st.get('crop') if PART == 'base' and st['area'] == 'skin' and st.get('crop') in ('underEye', 'jaw') else st['area']
KEYS = [step_key(st) for st in steps]
AREA_KO = {'skin': '피부', 'brows': '눈썹', 'eyes': '눈', 'cheeks': '볼', 'lips': '입술', 'hair': '헤어'}
AREA_EN = {'skin': 'Skin', 'brows': 'Brows', 'eyes': 'Eyes', 'cheeks': 'Cheeks', 'lips': 'Lips', 'hair': 'Hair'}

def pin_anchor(key, regs):  # 부위 바로 오른쪽(모델의 왼쪽) — 핀끼리 세로로 쌓이지 않게 부위마다 높이가 다르다
    cx, cy, ax, ay, a = max(regs, key=lambda r: r[0])
    if key == 'skin': return cx + ax * .78, cy - ay * .62          # 이마 오른쪽
    if key == 'brows': return cx + max(ax, ay) + 26, cy - 14
    return cx + max(ax, ay) * (1.0 if key != 'lips' else 1.05) + 30, cy

def face_marks(im, k_now, prog, done_upto, F):
    """k_now: 지금 단계 번호(0=없음). prog: 테두리 그려진 정도 0~1. done_upto: 여기까지 끝난 단계."""
    P = face_pts(im)
    if P is None: return im
    arr = np.zeros((H, W, 4), np.uint8)
    if k_now:
        for (cx, cy, ax, ay, a) in regions(P, KEYS[k_now - 1]):
            pts = cv2.ellipse2Poly((int(cx), int(cy)), (int(ax), int(ay)), int(a), -90, 270, 3)
            n = max(2, int(len(pts) * prog))
            for i in range(0, n - 1, 6):            # 점선: 4칸 그리고 2칸 쉼
                seg = pts[i:min(i + 4, n)]
                cv2.polylines(arr, [seg], False, (255, 255, 255, 170), 10, cv2.LINE_AA)
            for i in range(0, n - 1, 6):
                seg = pts[i:min(i + 4, n)]
                cv2.polylines(arr, [seg], False, PINK + (255,), 5, cv2.LINE_AA)
    layer = Image.fromarray(arr, 'RGBA'); d = ImageDraw.Draw(layer)
    # 핀: 같은 부위는 번호를 묶는다("1·2") — 사이트 맵과 같은 표기
    groups = {}
    for k in range(1, max(done_upto, k_now) + 1):
        groups.setdefault(KEYS[k - 1], []).append(k)
    placed = []
    for key, ks in groups.items():
        regs = regions(P, key)
        if not regs: continue
        x, y = pin_anchor(key, regs)
        for px, py in placed:                       # 그래도 겹치면 오른쪽으로 비켜 놓기
            if abs(px - x) < 60 and abs(py - y) < 52: x += 62
        placed.append((x, y))
        now = k_now in ks
        label = '·'.join(map(str, ks)); r = 34 if now else 25
        fnt = F['num'](34 if now else 25)
        w = max(2 * r, d.textlength(label, font=fnt) + 30)
        # 정수로 맞춘다 — 소수 좌표에 w == 2r(동그란 핀)이면 Pillow 내부 사각형이 부동소수 오차로
        # x1 < x0 가 돼 ValueError (2026-10-13 5편 EN 빌드에서 터짐)
        x, y, w = round(x), round(y), 2 * math.ceil(w / 2)
        d.rounded_rectangle((x - w / 2 + 2, y - r + 4, x + w / 2 + 2, y + r + 4), r, fill=(0, 0, 0, 50))
        d.rounded_rectangle((x - w / 2, y - r, x + w / 2, y + r), r, fill=(PINK if now else NAVY) + (255,), outline=(255, 255, 255, 255), width=3)
        d.text((x - d.textlength(label, font=fnt) / 2, y - r * .78), label, font=fnt, fill=(255, 255, 255, 255))
    return Image.alpha_composite(im.convert('RGBA'), layer).convert('RGB')

def stepper(d, k_now, done_upto, F, ko):
    """카드 바로 위 단계 바."""
    labels = [f'{k} {(AREA_KO if ko else AREA_EN)[st["area"]]}' for k, st in enumerate(steps, 1)]
    size = 34
    while True:
        fnt = F['body'](size); ws = [d.textlength(t, font=fnt) + 34 for t in labels]
        if sum(ws) + 10 * (len(ws) - 1) <= W - 140 or size <= 20: break
        size -= 2
    x = (W - (sum(ws) + 10 * (len(ws) - 1))) / 2; y0 = CARD_Y - 74
    for k, (t, w) in enumerate(zip(labels, ws), 1):
        if k == k_now: bg, fg = PINK + (255,), (255, 255, 255, 255)
        elif k <= done_upto: bg, fg = NAVY + (240,), (255, 255, 255, 255)
        else: bg, fg = CREAM + (200,), INK + (120,)
        d.rounded_rectangle((x, y0 - 4, x + w, y0 + 58), 31, fill=bg)
        d.text((x + 17, y0 + 27 - size * .62), t, font=fnt, fill=fg)
        x += w + 10

def build(lang):
    F = fonts(lang); ko = lang == 'ko'
    title = lesson.get('videoTitleKo' if ko else 'videoTitleEn') or (CUR_KO if ko else CUR_EN)
    title = title if ko else title.upper()

    def watermark(d):
        y = CARD_Y + 262; f = mono(34); w = d.textlength('kissinskin.net', font=f)
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

    bar = lambda k_now, done: (lambda d: stepper(d, k_now, done, F, ko))
    _last[0] = None
    s0 = Image.open(f'{D}/step-0-9x16.jpg').convert('RGB')
    for i in range(48):                                                                           # 훅 1.6초
        emit(overlay(overlay(kb(s0, i / 47, 1.0, 1.04), hook, min(1, i / 6)), bar(0, 0), min(1, i / 6)))
    z = 1.04
    for k, s in enumerate(steps, 1):                                                              # 단계 3초씩
        for i, fr in enumerate(clip_frames(f'{D}/clip-{k}.mp4', 90)):
            im = face_marks(kb(fr, 0, z, z), k, min(1, i / 12), k - 1, F)
            emit(overlay(overlay(im, step_card(k, s), min(1, i / 5)), bar(k, k - 1)))
    last = Image.open(f'{D}/step-{len(steps)}-9x16.jpg').convert('RGB')
    for i in range(24):                                                                           # 완성 0.8초 — 모든 핀 + 바 완료
        emit(overlay(face_marks(kb(last, i / 89, z, z + 0.02), 0, 0, len(steps), F), bar(0, len(steps))))
    for i in range(24, 90):                                                                       # 완성 얼굴만 2.2초 — 핀·바·주소가 사라진다
        a = max(0, 1 - (i - 24) / 9); im = kb(last, i / 89, z, z + 0.02)
        if a: im = Image.blend(im, overlay(overlay(face_marks(im.copy(), 0, 0, len(steps), F), bar(0, len(steps))), watermark), a)
        emit(im, mark=False)
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
