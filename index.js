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
  const { token, mode } = req.body

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
        message: 'Verificación reCAPTCHA fallida',
        errorCodes: data['error-codes'] || [],
      })
    }

    // Flujo para reCAPTCHA v3
    if (mode === 'v3') {
      const score = data.score ?? 0
      if (score >= 0.5) {
        // Aprobado automáticamente
        return res.json({ success: true, mode: 'v3', score })
      } else {
        // Score bajo, pedir v2 en frontend
        return res.status(200).json({
          success: false,
          requireV2: true,
          message: 'Score bajo, requiere reCAPTCHA v2',
          score,
        })
      }
    }

    // Flujo para reCAPTCHA v2 (no se considera score)
    if (mode === 'v2') {
      return res.json({ success: true, mode: 'v2', message: 'Verificación exitosa con reCAPTCHA v2' })
    }

    // Si no se especifica modo, considerar error de flujo
    return res.status(400).json({ success: false, message: 'Modo de verificación no especificado' })
  } catch (error) {
    console.error('Error en verificación reCAPTCHA:', error)
    return res.status(500).json({ success: false, message: 'Error interno en la verificación' })
  }
})

app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`)
})
