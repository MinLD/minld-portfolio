import express from 'express'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
