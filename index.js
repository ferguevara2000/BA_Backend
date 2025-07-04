import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import cors from 'cors'

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

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`)
})
