# nicelydone-review-notifier

Express service (Node.js 22) that **receives `review.completed` events** for the
Nicelydone review demo system.

## Data flow

- **`nicelydone-review-api`** owns the review records.
- **`nicelydone-review-dashboard`** reads those records from the API.
- **The API can send a `review.completed` event to this notifier**, which logs it.

> ⚠️ These repositories are **disposable** demo repositories. The intentionally
> flawed pull-request branches must **not** be deployed.

## Endpoint

| Method | Path | Description |
| --- | --- | --- |
| POST | `/webhooks/review-completed` | Accepts a `review.completed` event, logs the review id + repository, returns `{"received":true}` |

- Unknown event names are rejected with a JSON error.
- The server listens on port **3002**.
- Real HMAC signature verification (constant-time comparison + a five-minute
  replay window) is added in the `feature/webhook-signatures` pull request. Use
  a **fake local test secret only** — never a real secret.

## Run

```bash
npm install
npm test
npm start
```

Verify:

```bash
curl -s -X POST http://localhost:3002/webhooks/review-completed \
  -H 'Content-Type: application/json' \
  -d @fixtures/review-completed.json
# {"received":true}  and the server logs: reviewId=rev-103 repository=nicelydone/notifications
```
