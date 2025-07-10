import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import cors from 'cors'
import { validateInitData } from "./validateInitData.js"

dotenv.config()

const app = express()
app.use(express.json())
app.use(cors({
  origin: ['http://localhost:5173', 'https://bot-antirepasse-webapp.onrender.com'],
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
}))

const PORT = process.env.PORT || 3001
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY

app.post('/api/turnstile', async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token required' })
  }

  try {
    const params = new URLSearchParams()
    params.append('secret', TURNSTILE_SECRET_KEY)
    params.append('response', token)

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: params,
    })

    const data = await response.json()

    if (data.success) {
      return res.json({ success: true })
    } else {
      return res.status(403).json({ success: false, message: 'Turnstile verification failed' })
    }
  } catch (error) {
    console.error('Error verifying Turnstile:', error)
    return res.status(500).json({ success: false, message: 'Internal verification error' })
  }
})

const BOT_TOKEN = process.env.BOT_TOKEN

app.post('/api/validate-init-data', (req, res) => {
  const { initData } = req.body
  if (!initData) {
    return res.status(400).json({ success: false, message: 'Missing initData' })
  }

  const isValid = validateInitData(initData, BOT_TOKEN)
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid initData' })
  }

  return res.json({ success: true, message: 'initData validated successfully' })
})

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`)
})
