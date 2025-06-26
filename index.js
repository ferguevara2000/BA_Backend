import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import cors from 'cors' 

dotenv.config()

const app = express()
app.use(express.json())

// 👇 Usa CORS antes de las rutas
app.use(cors({
  origin: ['http://localhost:5173', 'https://bot-antirepasse-webapp.onrender.com'], // agrega tu frontend aquí
  methods: ['POST'],
  allowedHeaders: ['Content-Type'],
}))

const PORT = process.env.PORT || 3001
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY

if (!RECAPTCHA_SECRET_KEY) {
  throw new Error('Falta RECAPTCHA_SECRET_KEY en .env')
}

app.post('/api/recaptcha', async (req, res) => {
  const token = req.body.token

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

    if (data.success && data.score >= 0.5) {
      return res.json({ success: true, score: data.score })
    } else {
      return res.status(403).json({ success: false, score: data.score, message: 'reCAPTCHA fallido' })
    }
  } catch (error) {
    console.error('Error en verificación reCAPTCHA:', error)
    return res.status(500).json({ success: false, message: 'Error interno' })
  }
})

app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`)
})
