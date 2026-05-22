import { useState } from 'react'
import { FiArrowRight, FiLogIn } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { loginOwner, saveAuth } from '../services/authService'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Preencha email e senha para continuar.')
      return
    }

    setIsLoading(true)
    try {
      const payload = await loginOwner({ email, password })
      saveAuth(payload)
      navigate(payload?.user?.isMaster ? '/master/usuarios' : '/minha-conta')
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-4xl gap-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft md:grid-cols-[1.1fr_0.9fr] md:p-8">
        <div className="rounded-[1.6rem] bg-[linear-gradient(135deg,#1e1e1e,#303030)] p-6 text-white">
          <p className="eyebrow text-[#ffd166]">Acesso do lojista</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight">
            Entre na sua conta e gerencie seu cardápio
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/75">
            Seu painel centraliza pedidos, produtos, promoções, horários e impressão em um só lugar.
          </p>
          <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/80">
            Ainda não tem conta? Cadastre sua loja e teste grátis por 14 dias.
          </div>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <h2 className="font-display text-3xl font-semibold text-[#1e1e1e]">Login</h2>

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

          <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              className="input-field"
            />
          </label>

          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <button type="submit" disabled={isLoading} className="button-primary mt-1 justify-center disabled:opacity-60">
            <FiLogIn />
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-sm text-slate-600">
            Não tem conta?{' '}
            <Link className="font-bold text-[#ff6b00]" to="/cadastro">
              Criar conta grátis
            </Link>
          </p>
        </form>
      </div>
    </section>
  )
}

export default Login
