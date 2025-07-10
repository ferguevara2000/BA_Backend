// validateInitDataBasic.js
/**
 * Valida que el initDataRaw tenga un formato correcto y contenga campos requeridos.
 * @param {string} initDataRaw
 * @returns {boolean} true si es válido, false si no
 */
export function validateInitData(initDataRaw) {
    if (!initDataRaw || typeof initDataRaw !== 'string') {
        console.error('❌ initDataRaw vacío o no es string');
        return false;
    }

    const params = new URLSearchParams(initDataRaw);

    const requiredKeys = ['user', 'auth_date', 'hash'];
    for (const key of requiredKeys) {
        if (!params.has(key)) {
            console.error(`❌ Falta el parámetro requerido: ${key}`);
            return false;
        }
    }

    try {
        const userJson = params.get('user');
        const user = JSON.parse(userJson);

        if (typeof user.id !== 'number' || typeof user.first_name !== 'string') {
            console.error('❌ El objeto user no tiene el formato esperado');
            return false;
        }
    } catch (error) {
        console.error('❌ Error al parsear el campo user:', error);
        return false;
    }

    const authDate = params.get('auth_date');
    if (!/^\d+$/.test(authDate)) {
        console.error('❌ auth_date no es un número válido');
        return false;
    }

    const hash = params.get('hash');
    if (!/^[a-fA-F0-9]{32,}$/.test(hash)) { // hash hex largo
        console.error('❌ hash no tiene el formato esperado');
        return false;
    }

    console.log('✅ initDataRaw tiene un formato válido y contiene campos requeridos');
    return true;
}
