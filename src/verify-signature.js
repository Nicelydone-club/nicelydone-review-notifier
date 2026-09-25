// Signature verification for incoming webhooks.
//
// On the default branch this is a placeholder that accepts everything — real
// HMAC verification (constant-time comparison + timestamp freshness) is added
// in the `feature/webhook-signatures` pull request.
export function verifySignature() {
  return true
}
