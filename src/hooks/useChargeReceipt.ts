// 결제 복귀 영수증 상태 — ChargeReceiptToast 가 그린다(2026-11-09). 상태를 화면 쪽에 두어 단계가 바뀌어도 확인을 다시 하지 않는다.
import { useEffect, useRef, useState } from 'react'
import { waitForCharge, type ChargeReceipt } from '../lib/credits'

export type ChargeState = { k: 'checking' } | { k: 'ok'; r: ChargeReceipt } | { k: 'late' } | null

export const CREDITS_PAGE = '/mypage/credits/'

/** active = 결제 복귀로 들어왔을 때 true(마운트 때 한 번만 본다). onDone = 확인·포기 시 한 번(화면 잔액을 다시 읽게). */
export function useChargeReceipt(active: boolean, onDone?: () => void): [ChargeState, () => void] {
  const [res, setRes] = useState<ChargeState>(null)
  const [closed, setClosed] = useState(false)
  const doneRef = useRef(onDone)
  useEffect(() => { doneRef.current = onDone })
  useEffect(() => {
    if (!active) return
    let off = false
    void waitForCharge({ isCancelled: () => off }).then((r) => {
      if (off) return
      setRes(r ? { k: 'ok', r } : { k: 'late' })
      doneRef.current?.()
    })
    return () => { off = true }
  }, [active])
  const st: ChargeState = !active || closed ? null : res ?? { k: 'checking' }
  return [st, () => setClosed(true)]
}
