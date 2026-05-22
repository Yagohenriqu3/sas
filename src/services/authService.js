import api from './api'

const AUTH_STORAGE_KEY = 'lacheon-saas-auth'

function normalizeAuthPayload(payload) {
  return {
    token: payload?.token || '',
    user: payload?.user
      ? {
          ...payload.user,
          isMaster: Boolean(payload.user?.isMaster),
        }
      : null,
    store: payload?.store || null,
  }
}

export function saveAuth(payload) {
  const normalized = normalizeAuthPayload(payload)
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function getSavedAuth() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    return normalizeAuthPayload(JSON.parse(raw))
  } catch {
    return null
  }
}

export function clearAuth() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

export async function registerOwner(input) {
  try {
    const response = await api.post('/auth/register', input)
    return response.data
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Nao foi possivel cadastrar agora.')
  }
}

export async function loginOwner(input) {
  try {
    const response = await api.post('/auth/login', input)
    return response.data
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Nao foi possivel entrar agora.')
  }
}

export async function getCurrentAccount(token) {
  try {
    const response = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Sessao invalida. Faça login novamente.')
  }
}
