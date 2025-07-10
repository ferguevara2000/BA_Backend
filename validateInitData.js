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
  const hash = params.get('hash')
  console.log(params, "params");
  if (!hash) return false

  // Ordenar claves alfabéticamente y crear data_check_string
  const dataCheckArray = []
  for (const [key, value] of params.entries()) {
    if (key !== 'hash') {
      dataCheckArray.push(`${key}=${value}`)
    }
  }
  dataCheckArray.sort()
  const dataCheckString = dataCheckArray.join('\n')

  // HMAC-SHA256 con secret key derivado del bot token
  const secretKey = crypto.createHash('sha256').update(botToken).digest()
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  console.log("hash recibido:", hash);
  console.log("hash calculado:", hmac);
  console.log("dataCheckString:\n", dataCheckString);

  return hmac === hash
}
