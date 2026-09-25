import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import {dirname, join} from 'node:path'
import request from 'supertest'
import {app} from '../src/server.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const fixture = JSON.parse(
  readFileSync(join(__dirname, '..', 'fixtures', 'review-completed.json'), 'utf8'),
)

test('POST /webhooks/review-completed accepts the review.completed fixture', async () => {
  const res = await request(app).post('/webhooks/review-completed').send(fixture)
  assert.equal(res.status, 200)
  assert.deepEqual(res.body, {received: true})
})

test('rejects unknown event names with a JSON error', async () => {
  const res = await request(app)
    .post('/webhooks/review-completed')
    .send({event: 'review.started', reviewId: 'rev-1', repository: 'nicelydone/x'})
  assert.equal(res.status, 400)
  assert.match(res.body.error, /Unknown event/)
})

test('rejects a missing event field', async () => {
  const res = await request(app).post('/webhooks/review-completed').send({reviewId: 'rev-1'})
  assert.equal(res.status, 400)
  assert.ok(res.body.error)
})
