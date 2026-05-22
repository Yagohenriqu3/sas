export async function fetchAddressByCEP(cep) {
  const cleanCep = String(cep || '').replace(/\D/g, '')

  if (cleanCep.length !== 8) {
    throw new Error('CEP deve conter 8 dígitos')
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)

    if (!response.ok) {
      throw new Error('Erro ao buscar CEP')
    }

    const data = await response.json()

    if (data.erro) {
      throw new Error('CEP não encontrado')
    }

    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
    }
  } catch (error) {
    throw new Error(error.message || 'Erro ao buscar o CEP. Preencha manualmente.')
  }
}
