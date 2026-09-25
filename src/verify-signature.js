// HMAC signature verification for incoming webhooks.
import crypto from 'node:crypto'

// A fake local test secret. Never use a real secret here.
export const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'local-test-secret'

// Compute the HMAC-SHA256 signature for a raw payload string.
export function sign(payload, secret = WEBHOOK_SECRET) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

// Verify the `x-signature` header against the request body.
export function verifySignature(req, secret = WEBHOOK_SECRET) {
  const provided = req.header('x-signature') || ''
  const payload = JSON.stringify(req.body)
  const expected = sign(payload, secret)
  return provided === expected
}
