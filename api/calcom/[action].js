export default async function handler(req, res) {
  const apiKey = (process.env.CALCOM_API_KEY || '').trim()
  const action = req.query?.action || req.url?.split('?')[0]?.split('/').pop()

  if (action === 'status' && req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      configured: Boolean(apiKey),
      apiVersion: 'v2',
    })
  }

  if (!apiKey) {
    return res.status(400).json({
      ok: false,
      error: 'CALCOM_API_KEY is not configured on the server.',
    })
  }

  try {
    if (action === 'slots' && req.method === 'GET') {
      const { eventTypeId, eventTypeSlug, username, start, end, timeZone = 'America/Chicago' } = req.query || {}
      const params = new URLSearchParams()
      if (eventTypeId) params.set('eventTypeId', eventTypeId)
      if (eventTypeSlug) params.set('eventTypeSlug', eventTypeSlug)
      if (username) params.set('username', username)
      if (start) params.set('start', start)
      if (end) params.set('end', end)
      params.set('timeZone', timeZone)

      const upstreamRes = await fetch(`https://api.cal.com/v2/slots?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'cal-api-version': '2024-09-04',
        },
      })
      const data = await upstreamRes.json().catch(() => ({}))
      if (!upstreamRes.ok) {
        return res.status(upstreamRes.status).json({
          ok: false,
          error: data?.error?.message || data?.message || `Cal.com v2 slots HTTP ${upstreamRes.status}`,
        })
      }
      return res.status(200).json({ ok: true, data })
    }

    if (action === 'book' && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
      const upstreamRes = await fetch('https://api.cal.com/v2/bookings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'cal-api-version': '2024-08-13',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const data = await upstreamRes.json().catch(() => ({}))
      if (!upstreamRes.ok) {
        return res.status(upstreamRes.status).json({
          ok: false,
          error: data?.error?.message || data?.message || `Cal.com v2 booking HTTP ${upstreamRes.status}`,
        })
      }
      return res.status(200).json({ ok: true, data })
    }

    if (action === 'cancel' && req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
      const bookingUid = (body?.bookingUid || '').trim()
      if (!bookingUid) {
        return res.status(400).json({ ok: false, error: 'Missing bookingUid to cancel.' })
      }
      const upstreamRes = await fetch(`https://api.cal.com/v2/bookings/${encodeURIComponent(bookingUid)}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'cal-api-version': '2024-08-13',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancellationReason: body?.cancellationReason || 'Rescheduled or cancelled from GHL Conversation Room',
        }),
      })
      const data = await upstreamRes.json().catch(() => ({}))
      if (!upstreamRes.ok) {
        return res.status(upstreamRes.status).json({
          ok: false,
          error: data?.error?.message || data?.message || `Cal.com v2 cancel HTTP ${upstreamRes.status}`,
        })
      }
      return res.status(200).json({ ok: true, data })
    }

    return res.status(404).json({ ok: false, error: 'Unknown /api/calcom endpoint.' })
  } catch (err) {
    return res.status(502).json({ ok: false, error: err?.message || 'Cal.com v2 proxy request failed.' })
  }
}