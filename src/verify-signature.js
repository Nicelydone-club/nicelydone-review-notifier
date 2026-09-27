// HMAC signature verification for incoming webhooks, with a replay window.
import crypto from 'node:crypto'

// A fake local test secret. Never use a real secret here.
export const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'local-test-secret'

// Reject anything signed more than five minutes ago (replay protection).
export const MAX_AGE_SECONDS = 5 * 60

// Compute the HMAC-SHA256 signature over "<timestamp>.<payload>".
export function sign(timestamp, payload, secret = WEBHOOK_SECRET) {
  return crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex')
}

// Verify the `x-signature` header against the body, requiring a fresh
// `x-timestamp` and using a constant-time comparison.
export function verifySignature(req, secret = WEBHOOK_SECRET) {
  const provided = req.header('x-signature') || ''
  const timestamp = Number(req.header('x-timestamp'))

  // Require a signed timestamp within the replay window.
  if (!Number.isFinite(timestamp)) return false
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - timestamp) > MAX_AGE_SECONDS) return false

  const payload = JSON.stringify(req.body)
  const expected = sign(timestamp, payload, secret)

  const a = Buffer.from(provided, 'hex')
  const b = Buffer.from(expected, 'hex')
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
