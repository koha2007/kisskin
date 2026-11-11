// 사진이 모이기 전까지 검색에 내보내지 않는다(빈 페이지 색인 방지)
export default function Head() {
  return (
    <>
      <meta name="robots" content="noindex, follow" />
      <title>고객 메이크업 갤러리 · kissinskin</title>
    </>
  )
}
