import { usePageContext } from 'vike-react/usePageContext'
import { ClassLessonHead } from '../../../../src/lib/class/ClassHead'

export default function Head() {
  const ctx = usePageContext()
  const slug = (ctx.routeParams?.slug ?? '').toString()
  return <ClassLessonHead slug={slug} isEn={true} />
}
