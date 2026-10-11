# 메이크업 클래스 → 단계 사진을 "부위 마스크 합성"으로 만든다 (비용 0)
# ────────────────────────────────────────────────────────────────────
# 사진 모델로 한 단계씩 이어 수정하면 단계마다 피부가 주황으로 쏠리고 거칠어졌다(2026-10-11 실측).
# → AI 사진은 3장만(gen-class-media.mjs): 민낯 bare · 베이스 base · 완성 final.
#   중간 단계는 MediaPipe 얼굴 랜드마크로 부위 마스크를 만들어, 단계의 area/crop 순서대로 완성 사진을 얹는다.
#   - 피부(skin) 단계: 민낯 → 베이스(베이스 편이면 → 완성)로 얼굴 전체가 단계 수만큼 나눠 변한다
#   - 같은 부위가 여러 단계면(눈 섀도 → 라인 → 마스카라) 그 부위가 단계마다 조금씩 진해진다
#   - final 이 옅게 나오는 경향 → 피부 외 부위는 (final - base) 차이를 GAIN 배로 키운다(눈썹은 원본)
# 사용: python3 scripts/class-steps-composite.py <lesson-slug> [--dir=casting/class/<slug>] [--gain=1.8] [--model=casting/face_landmarker.task]
# 결과: <dir>/step-0..N.png
import sys, json, numpy as np, cv2, mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

args = sys.argv[1:]
slug = next(a for a in args if not a.startswith('--'))
opt = lambda k, d: next((a.split('=', 1)[1] for a in args if a.startswith(f'--{k}=')), d)
D = opt('dir', f'casting/class/{slug}')
GAIN = float(opt('gain', '1.8'))
MODEL = opt('model', 'casting/face_landmarker.task')
steps = next(l for l in json.load(open('src/lib/class/lessons.json')) if l['slug'] == slug)['steps']

det = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(base_options=BaseOptions(model_asset_path=MODEL), num_faces=1))
def lm(img):
    r = det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB)))
    if not r.face_landmarks: raise SystemExit('얼굴 인식 실패')
    h, w = img.shape[:2]
    return np.array([[p.x * w, p.y * h] for p in r.face_landmarks[0]], np.float32)

def align(src, ref_pts):  # 생성 사진끼리 몇 px 씩 밀린다 → base 랜드마크에 유사변환으로 맞춤
    M, _ = cv2.estimateAffinePartial2D(lm(src), ref_pts)
    return cv2.warpAffine(src, M, (src.shape[1], src.shape[0]), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)

bare = cv2.imread(f'{D}/bare.png'); base = cv2.imread(f'{D}/base.png'); final = cv2.imread(f'{D}/final.png')
P = lm(base)
bare, final = align(bare, P), align(final, P)
same_base = np.abs(bare.astype(int) - base.astype(int)).mean() < 2   # 베이스 편: base == 민낯
H, W = base.shape[:2]
face_w = np.linalg.norm(P[234] - P[454])

def soft(m, blur): k = int(face_w * blur) | 1; return cv2.GaussianBlur(m, (k, k), 0).astype(np.float32) / 255
def hull(idx, dilate=0.0, blur=0.03):
    m = np.zeros((H, W), np.uint8)
    cv2.fillConvexPoly(m, cv2.convexHull(P[idx].astype(np.int32)), 255)
    if dilate: m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(face_w * dilate) | 1,) * 2))
    return soft(m, blur)
def ellipse(c, toward, rx, ry, blur=.12, w=.4):
    m = np.zeros((H, W), np.uint8)
    ctr = (P[c] * (1 - w) + P[toward] * w).astype(int)
    cv2.ellipse(m, tuple(int(v) for v in ctr), (int(face_w * rx), int(face_w * ry)), 0, 0, 360, 255, -1)
    return soft(m, blur)
U = lambda *ms: np.clip(np.maximum.reduce(ms), 0, 1)

R_BROW = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]; L_BROW = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276]
R_EYE = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
L_EYE = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249]
LIPS = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146]
OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
JAW = [234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323, 454]

MASK = {
    'brows': U(hull(R_BROW, .02, .02), hull(L_BROW, .02, .02)),
    'eyes': U(hull(R_EYE + [46, 53, 52, 65, 55], .015, .035), hull(L_EYE + [276, 283, 282, 295, 285], .015, .035)),
    'cheeks': U(ellipse(50, 117, .17, .12), ellipse(280, 346, .17, .12)),
    'lips': hull(LIPS, .01, .02),
    'skin': hull(OVAL, 0, .05),
    'underEye': U(ellipse(230, 23, .12, .05, .06, .5), ellipse(450, 253, .12, .05, .06, .5)),
    'jaw': hull(JAW, .05, .08) * (1 - hull(LIPS, .06, .05)),
}
MASK['eyeLid'] = MASK['eyeOuter'] = MASK['eyes']; MASK['lipLine'] = MASK['lips']
MASK['cheekTemple'] = MASK['cheekBlend'] = MASK['cheeks']

b, f, z = base.astype(np.float32), final.astype(np.float32), bare.astype(np.float32)
boosted = np.clip(b + GAIN * (f - b), 0, 255)
skin_to = f if same_base else b        # 피부 단계가 향하는 사진
def key(s):
    if s['area'] == 'skin': return s.get('crop') if s.get('crop') in ('underEye', 'jaw') and same_base else 'skin'
    return s['area']
keys = [key(s) for s in steps]
total = {k: keys.count(k) for k in set(keys)}

# 피부 단계가 없는 편(눈·입술만 다루는 편)은 베이스를 바른 얼굴에서 시작한다 — 안 그러면 1단계에 베이스까지 같이 생긴다
if 'skin' not in total and not same_base: z = b
out = [z]
cur = z.copy(); seen = {}
for s, k in zip(steps, keys):
    seen[k] = seen.get(k, 0) + 1
    a = seen[k] / total[k]
    if k == 'hair' or k not in MASK: out.append(cur.copy()); continue
    m = MASK[k][..., None] * a
    if k in ('skin', 'underEye', 'jaw'):
        tgt = skin_to
        if k == 'skin' and not same_base: m = np.ones_like(m) * a   # 베이스 이전 단계(스킨케어 등)는 얼굴 전체가 고르게
    else:
        tgt = f if k == 'brows' else boosted
    cur = cur * (1 - m) + tgt * m
    out.append(cur.copy())
for k, s in enumerate(out):
    cv2.imwrite(f'{D}/step-{k}.png', np.clip(s, 0, 255).astype(np.uint8))
print('ok', len(out) - 1, 'steps', keys, 'gain', GAIN, 'same_base', same_base)
