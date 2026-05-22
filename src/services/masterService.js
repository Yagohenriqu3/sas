import api from './api'

export async function listAllUsers(token) {
  try {
    const response = await api.get('/master/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data?.users || []
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Nao foi possivel carregar usuarios.')
  }
}

export async function updateUserByMaster(token, userId, input) {
  try {
    const response = await api.patch(`/master/users/${userId}`, input, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data
  } catch (error) {
    throw new Error(error?.response?.data?.message || 'Nao foi possivel atualizar o usuario.')
  }
}
