import api from './api'

export async function createSubscriptionLink(token, planId = 'monthly') {
  try {
    const response = await api.post(
      '/billing/subscription-link',
      { planId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    return response.data
  } catch (error) {
    throw new Error(
      error?.response?.data?.message ||
        'Nao foi possivel iniciar a assinatura agora. Tente novamente em instantes.',
    )
  }
}
