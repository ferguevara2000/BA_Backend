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
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

if (!RECAPTCHA_SECRET_KEY) {
  throw new Error('Falta RECAPTCHA_SECRET_KEY en .env')
}

app.post('/api/recaptcha', async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token requerido' })
  }

  try {
    const params = new URLSearchParams()
    params.append('secret', RECAPTCHA_SECRET_KEY)
    params.append('response', token)

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: params,
    })

    const data = await response.json()

    if (!data.success) {
      return res.status(403).json({
        success: false,
        message: 'reCAPTCHA verification failed',
        errorCodes: data['error-codes'] || [],
      })
    }

    const score = data.score ?? 0

    if (score < 0.2) {
      return res.status(403).json({
        success: false,
        message: 'Suspicious activity detected (low score)',
        score,
      })
    }

    return res.json({
      success: true,
      message: 'reCAPTCHA verification passed',
      score,
    })
  } catch (error) {
    console.error('Error en verificación reCAPTCHA:', error)
    return res.status(500).json({ success: false, message: 'Internal verification error' })
  }
})

app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`)
})
