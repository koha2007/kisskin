# 룩 카드 비포/애프터

`scripts/gen-look-models.mjs` 산출물. 비포=Imagen 민낯 모델(또는 `--before-dir` 로 넘긴 캐스팅 파일), 애프터=비포를 라이브와 동일한 gpt-image-2 + promptWholeFace() 로 편집한 실제 결과.
규격 1024×1536 (2:3), 비포/애프터 동일 크기.

재생성: `set -a && . ./.dev.vars && set +a && node scripts/gen-look-models.mjs --force`
민낯을 직접 캐스팅했다면: `node scripts/gen-look-models.mjs --before-dir=./casting --force`

⚠ 애프터를 사이트 결과 화면에서 저장해 쓰지 말 것 — 그 저장 버튼은 공유용 카드(1080×1920 + 흰 테두리·제목·로고, `src/lib/makeup/composite.ts`)를 만든다. 여기 필요한 건 원본 사진이다.
