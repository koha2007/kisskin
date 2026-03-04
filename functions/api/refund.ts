interface Env {
  POLAR_ACCESS_TOKEN: string
}

interface RefundRequest {
  checkoutId: string
  reason?: string
  comment?: string
}

interface Order {
  id: string
  status: string
  total_amount: number
  refunded_amount: number
}

interface OrdersListResponse {
  items: Order[]
}

interface RefundResponse {
  id: string
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  amount: number
  currency: string
  reason: string
  order_id: string
  created_at: string
}

const VALID_REASONS = [
  'duplicate',
  'fraudulent',
  'customer_request',
  'service_disruption',
  'satisfaction_guarantee',
  'dispute_prevention',
  'other',
]

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context

  if (!env.POLAR_ACCESS_TOKEN) {
    return new Response(JSON.stringify({ error: 'Payment not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { checkoutId, reason, comment } = (await request.json()) as RefundRequest

    if (!checkoutId) {
      return new Response(JSON.stringify({ error: 'Missing checkoutId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const refundReason = reason && VALID_REASONS.includes(reason) ? reason : 'customer_request'

    // 1. checkoutId로 주문(order) 조회
    const ordersRes = await fetch(
      `https://api.polar.sh/v1/orders/?checkout_id=${checkoutId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${env.POLAR_ACCESS_TOKEN}`,
        },
      }
    )

    if (!ordersRes.ok) {
      const errText = await ordersRes.text()
      return new Response(JSON.stringify({ error: `Order lookup failed: ${errText}` }), {
        status: ordersRes.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const ordersData = await ordersRes.json() as OrdersListResponse
    const order = ordersData.items?.[0]

    if (!order) {
      return new Response(JSON.stringify({ error: 'No order found for this checkout' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (order.status === 'refunded') {
      return new Response(JSON.stringify({ error: 'Order is already refunded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. 환불 요청
    const refundAmount = order.total_amount - order.refunded_amount
    if (refundAmount <= 0) {
      return new Response(JSON.stringify({ error: 'No refundable amount remaining' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const refundBody: Record<string, unknown> = {
      order_id: order.id,
      reason: refundReason,
      amount: refundAmount,
      revoke_benefits: true,
    }
    if (comment) {
      refundBody.comment = comment
    }

    const refundRes = await fetch('https://api.polar.sh/v1/refunds/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.POLAR_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(refundBody),
    })

    if (!refundRes.ok) {
      const errText = await refundRes.text()
      return new Response(JSON.stringify({ error: `Refund failed: ${errText}` }), {
        status: refundRes.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const refund = await refundRes.json() as RefundResponse

    return new Response(JSON.stringify({
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount,
      currency: refund.currency,
      reason: refund.reason,
      orderId: refund.order_id,
      createdAt: refund.created_at,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({
      error: `Server error: ${e instanceof Error ? e.message : String(e)}`,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
