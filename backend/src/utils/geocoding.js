const axios = require('axios')

function normalizeCep(value) {
  return String(value || '').replace(/\D/g, '')
}

function cleanText(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function buildAddressQueries({ cep, street, number, neighborhood, city, state }) {
  const normalizedCep = normalizeCep(cep)
  const s = cleanText(street)
  const n = cleanText(number)
  const nh = cleanText(neighborhood)
  const c = cleanText(city)
  const st = cleanText(state)

  const queries = []

  if (s || n || nh || c || st) {
    queries.push([s, n, nh, c, st, 'Brasil'].filter(Boolean).join(', '))
    queries.push([s, nh, c, st, 'Brasil'].filter(Boolean).join(', '))
    queries.push([nh, c, st, 'Brasil'].filter(Boolean).join(', '))
  }

  if (normalizedCep.length === 8) {
    queries.push(`${normalizedCep}, Brasil`)
  }

  return [...new Set(queries.filter(Boolean))]
}

async function geocodeWithNominatim(query) {
  const response = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q: query,
      format: 'jsonv2',
      limit: 1,
      countrycodes: 'br',
      addressdetails: 0,
    },
    headers: {
      'User-Agent': 'LacheON/1.0 (order geocoding)',
      Accept: 'application/json',
    },
    timeout: 8000,
  })

  const first = Array.isArray(response.data) ? response.data[0] : null
  if (!first) return null

  const latitude = Number(first.lat)
  const longitude = Number(first.lon)

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null
  }

  return {
    latitude,
    longitude,
    source: 'nominatim',
    query,
  }
}

async function geocodeCustomerAddress(address) {
  const queries = buildAddressQueries(address)

  for (const query of queries) {
    try {
      const result = await geocodeWithNominatim(query)
      if (result) {
        return result
      }
    } catch {
      // Tenta a próxima query para reduzir falhas por ambiguidade/rede.
    }
  }

  return null
}

module.exports = {
  geocodeCustomerAddress,
}
