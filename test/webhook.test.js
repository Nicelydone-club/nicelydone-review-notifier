import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, join} from 'node:path'
import request from 'supertest'
import {app} from '../src/server.js'
import {sign, MAX_AGE_SECONDS} from '../src/verify-signature.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixture = JSON.parse(
  readFileSync(join(__dirname, '..', 'fixtures', 'review-completed.json'), 'utf8'),
)

const nowTs = () => Math.floor(Date.now() / 1000)

function signed(body, timestamp = nowTs()) {
  return request(app)
    .post('/webhooks/review-completed')
    .set('x-timestamp', String(timestamp))
    .set('x-signature', sign(timestamp, JSON.stringify(body)))
    .send(body)
}

test('accepts a correctly signed and timestamped event', async () => {
  const res = await signed(fixture)
  assert.equal(res.status, 200)
  assert.deepEqual(res.body, {received: true})
})

test('rejects a request with a bad signature', async () => {
  const ts = nowTs()
  const res = await request(app)
    .post('/webhooks/review-completed')
    .set('x-timestamp', String(ts))
    .set('x-signature', 'deadbeef')
    .send(fixture)
  assert.equal(res.status, 401)
})

test('rejects a stale timestamp (replay protection)', async () => {
  const stale = nowTs() - MAX_AGE_SECONDS - 60
  const res = await signed(fixture, stale)
  assert.equal(res.status, 401)
})

test('rejects a request with no timestamp', async () => {
  const res = await request(app)
    .post('/webhooks/review-completed')
    .set('x-signature', sign(nowTs(), JSON.stringify(fixture)))
    .send(fixture)
  assert.equal(res.status, 401)
})

test('rejects unknown event names with a JSON error', async () => {
  const body = {event: 'review.started', reviewId: 'rev-1', repository: 'nicelydone/x'}
  const res = await signed(body)
  assert.equal(res.status, 400)
  assert.match(res.body.error, /Unknown event/)
})
