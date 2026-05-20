/**
 * Calcula a distância em km entre dois pontos usando a fórmula Haversine
 * @param {number} lat1 - Latitude do ponto 1
 * @param {number} lon1 - Longitude do ponto 1
 * @param {number} lat2 - Latitude do ponto 2
 * @param {number} lon2 - Longitude do ponto 2
 * @returns {number} Distância em quilômetros
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Raio da Terra em km

  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 100) / 100 // Retorna arredondado a 2 casas decimais
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Verifica se o cliente está dentro do raio de entrega
 * @param {number} storeLatitude - Latitude da loja
 * @param {number} storeLongitude - Longitude da loja
 * @param {number} customerLatitude - Latitude do cliente
 * @param {number} customerLongitude - Longitude do cliente
 * @param {number} deliveryRadius - Raio de entrega em km
 * @returns {object} { isWithinRadius, distance }
 */
function isWithinDeliveryRadius(storeLatitude, storeLongitude, customerLatitude, customerLongitude, deliveryRadius) {
  if (!storeLatitude || !storeLongitude || !customerLatitude || !customerLongitude) {
    return {
      isWithinRadius: true, // Se falta geolocalização, permite por padrão
      distance: null,
    }
  }

  const distance = calculateDistance(
    Number(storeLatitude),
    Number(storeLongitude),
    Number(customerLatitude),
    Number(customerLongitude),
  )

  const radiusKm = Number(deliveryRadius) || 15

  return {
    isWithinRadius: distance <= radiusKm,
    distance: distance,
  }
}

module.exports = {
  calculateDistance,
  isWithinDeliveryRadius,
}
