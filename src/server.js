// Nicelydone Review Notifier — receives review-completed events from the API.
import express from 'express'
import {fileURLToPath} from 'node:url'
import {verifySignature} from './verify-signature.js'

export const app = express()
app.use(express.json())

app.post('/webhooks/review-completed', (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).json({error: 'Invalid signature'})
  }

  const event = req.body || {}
  if (event.event !== 'review.completed') {
    return res.status(400).json({error: `Unknown event: ${event.event ?? 'missing'}`})
  }

  console.log(
    `[notifier] review.completed — reviewId=${event.reviewId} repository=${event.repository}`,
  )

  res.json({received: true})
})

app.use((_req, res) => {
  res.status(404).json({error: 'Not found'})
})

const PORT = Number(process.env.PORT) || 3002

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`Nicelydone Review Notifier listening on http://localhost:${PORT}`)
  })
}
