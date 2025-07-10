// validateInitData.js
import crypto from 'crypto'

/**
 * Valida el initData recibido de Telegram Web App
 * @param {string} initData - Query string sin codificar
 * @param {string} botToken - Token de tu bot
 * @returns {boolean} true si válido, false si no
 */
export function validateInitData(initData, botToken) {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash') || params.get('signature') // ✅ Aceptar ambos

  if (!hash) {
    console.error("❌ No se encontró hash ni signature en initData")
    return false
  }

  // Crear dataCheckString excluyendo hash y signature
  const dataCheckArray = []
  for (const [key, value] of params.entries()) {
    if (key !== 'hash' && key !== 'signature') {
      dataCheckArray.push(`${key}=${value}`)
    }
  }
  dataCheckArray.sort()
  const dataCheckString = dataCheckArray.join('\n')

  // HMAC-SHA256 con secret key derivado del bot token
  const secretKey = crypto.createHash('sha256').update(botToken).digest()
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  console.error("🔹 hash recibido:", hash)
  console.error("🔹 hash calculado:", hmac)
  console.error("🔹 dataCheckString:\n", dataCheckString)

  return hmac === hash
}
