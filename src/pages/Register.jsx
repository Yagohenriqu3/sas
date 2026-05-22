import { useState } from 'react'
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { registerOwner, saveAuth } from '../services/authService'
import { fetchAddressByCEP } from '../services/cepService'

function Register() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [storeName, setStoreName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [documentNumber, setDocumentNumber] = useState('')
  const [legalName, setLegalName] = useState('')
  const [billingZip, setBillingZip] = useState('')
  const [billingStreet, setBillingStreet] = useState('')
  const [billingNumber, setBillingNumber] = useState('')
  const [billingNeighborhood, setBillingNeighborhood] = useState('')
  const [billingCity, setBillingCity] = useState('')
  const [billingState, setBillingState] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCepLoading, setIsCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')

  async function handleCepBlur() {
    setCepError('')

    if (!billingZip.trim()) {
      return
    }

    setIsCepLoading(true)

    try {
      const address = await fetchAddressByCEP(billingZip)
      setBillingStreet(address.street)
      setBillingNeighborhood(address.neighborhood)
      setBillingCity(address.city)
      setBillingState(address.state)
    } catch (err) {
      setCepError(err.message)
    } finally {
      setIsCepLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (
      !fullName.trim() ||
      !storeName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !documentNumber.trim() ||
      !legalName.trim() ||
      !billingZip.trim() ||
      !billingStreet.trim() ||
      !billingNumber.trim() ||
      !billingNeighborhood.trim() ||
      !billingCity.trim() ||
      !billingState.trim() ||
      !password.trim()
    ) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem.')
      return
    }

    setIsLoading(true)

    try {
      const payload = await registerOwner({
        fullName,
        storeName,
        email,
        phone,
        documentNumber,
        legalName,
        billingZip,
        billingStreet,
        billingNumber,
        billingNeighborhood,
        billingCity,
        billingState,
        password,
      })
      saveAuth(payload)
      navigate('/minha-conta')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-5xl gap-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft lg:grid-cols-[1fr_1fr] lg:p-8">
        <div className="rounded-[1.6rem] bg-[linear-gradient(155deg,#ff6b00,#ff9f52)] p-6 text-white">
          <p className="eyebrow text-white/80">Teste grátis por 14 dias</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight">
            Crie sua conta e publique seu cardápio hoje
          </h1>
          <div className="mt-6 grid gap-3 text-sm text-white/90">
            <p className="inline-flex items-center gap-2"><FiCheckCircle /> Link exclusivo da sua loja</p>
            <p className="inline-flex items-center gap-2"><FiCheckCircle /> Painel para pedidos e produtos</p>
            <p className="inline-flex items-center gap-2"><FiCheckCircle /> WhatsApp integrado sem comissão</p>
          </div>
        </div>

        <form className="grid gap-3" onSubmit={handleSubmit}>
          <h2 className="font-display text-3xl font-semibold text-[#1e1e1e]">Cadastro do lojista</h2>

          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Seu nome
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Ex: João Silva"
              className="input-field"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Nome da loja
            <input
              type="text"
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
              placeholder="Ex: Burguer do Bairro"
              className="input-field"
            />
          </label>

          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@loja.com"
              className="input-field"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Telefone
              <input
                type="text"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="(11) 99999-0000"
                className="input-field"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              CPF/CNPJ
              <input
                type="text"
                value={documentNumber}
                onChange={(event) => setDocumentNumber(event.target.value)}
                placeholder="000.000.000-00"
                className="input-field"
              />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Razao social ou nome fiscal
            <input
              type="text"
              value={legalName}
              onChange={(event) => setLegalName(event.target.value)}
              placeholder="Ex: Burguer do Bairro LTDA"
              className="input-field"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              CEP
              <input
                type="text"
                value={billingZip}
                onChange={(event) => setBillingZip(event.target.value)}
                onBlur={handleCepBlur}
                disabled={isCepLoading}
                placeholder="00000-000"
                className="input-field"
              />
              {cepError && <span className="text-xs text-red-600">{cepError}</span>}
              {isCepLoading && <span className="text-xs text-blue-600">Buscando CEP...</span>}
            </label>

            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Numero
              <input
                type="text"
                value={billingNumber}
                onChange={(event) => setBillingNumber(event.target.value)}
                placeholder="123"
                className="input-field"
              />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Rua
            <input
              type="text"
              value={billingStreet}
              onChange={(event) => setBillingStreet(event.target.value)}
              placeholder="Rua das Flores"
              className="input-field"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Bairro
              <input
                type="text"
                value={billingNeighborhood}
                onChange={(event) => setBillingNeighborhood(event.target.value)}
                placeholder="Centro"
                className="input-field"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Cidade
              <input
                type="text"
                value={billingCity}
                onChange={(event) => setBillingCity(event.target.value)}
                placeholder="Sao Paulo"
                className="input-field"
              />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Estado (UF)
            <input
              type="text"
              value={billingState}
              onChange={(event) => setBillingState(event.target.value.toUpperCase())}
              maxLength={2}
              placeholder="SP"
              className="input-field"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Senha
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="input-field"
              />
            </label>

            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Confirmar senha
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repita sua senha"
                className="input-field"
              />
            </label>
          </div>

          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <button type="submit" disabled={isLoading} className="button-primary mt-2 justify-center disabled:opacity-60">
            {isLoading ? 'Criando conta...' : 'Criar conta e iniciar teste'}
            <FiArrowRight />
          </button>

          <p className="text-sm text-slate-600">
            Já possui conta?{' '}
            <Link className="font-bold text-[#ff6b00]" to="/login">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </section>
  )
}

export default Register
