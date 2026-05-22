import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSavedAuth } from '../services/authService'
import { createSubscriptionLink } from '../services/billingService'

const PLANS = [
  {
    id: 'monthly',
    name: 'Plano Mensal',
    originalAmount: 89.9,
    amount: 29.9,
    cycleLabel: 'por mês',
    subtitle: 'Organize seu delivery hoje e teste no seu negocio sem risco',
    promo: true,
    perks: [
      'Comece rapido com operacao mais organizada no dia a dia',
      'Custo previsivel para voce planejar e crescer com seguranca',
    ],
  },
  {
    id: 'quarterly',
    name: 'Plano Trimestral',
    originalAmount: 269.7,
    amount: 79.9,
    cycleLabel: 'a cada 3 meses',
    subtitle: 'Mais controle da operacao com economia para manter constancia',
    badge: 'Mais escolhido',
    promo: true,
    perks: [
      'Melhor relacao custo-beneficio para consolidar resultados',
      'Renovacao automatica para nao perder ritmo de vendas',
    ],
  },
  {
    id: 'semiannual',
    name: 'Plano Semestral',
    originalAmount: 539.4,
    amount: 149.9,
    cycleLabel: 'a cada 6 meses',
    subtitle: 'Economia consistente para quem quer crescer com previsibilidade',
    promo: true,
    perks: [
      'Seis meses de operacao organizada com custo reduzido',
      'Ideal para consolidar vendas e fidelizar clientes',
    ],
  },
  {
    id: 'yearly',
    name: 'Plano Anual',
    originalAmount: 1078.8,
    amount: 269.9,
    cycleLabel: 'por ano',
    subtitle: 'Cresca com previsibilidade e foco total no lucro da loja',
    promo: true,
    perks: [
      'Economia maxima para investir mais no seu negocio',
      'Visao de longo prazo com operacao profissional e estavel',
    ],
  },
]

function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function Plans() {
  const navigate = useNavigate()
  const session = getSavedAuth()
  const [loadingPlanId, setLoadingPlanId] = useState('')
  const [message, setMessage] = useState('')

  if (!session?.token) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-soft">
          <h1 className="font-display text-4xl font-semibold text-[#1e1e1e]">Acesse para iniciar seu teste</h1>
          <p className="mt-3 text-slate-600">Entre na sua conta para ativar o plano ideal e testar no seu proprio delivery.</p>
          <button type="button" className="button-primary mt-6" onClick={() => navigate('/login')}>
            Entrar e continuar
          </button>
        </div>
      </section>
    )
  }

  async function handleChoosePlan(planId) {
    setMessage('')
    setLoadingPlanId(planId)

    try {
      const data = await createSubscriptionLink(session.token, planId)

      if (data?.initPoint) {
        window.location.href = data.initPoint
        return
      }

      setMessage('Nao foi possivel iniciar seu teste agora. Tente novamente em instantes.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoadingPlanId('')
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="text-center">
        <p className="eyebrow text-[#ff6b00]">Planos e teste gratuito</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-[#1e1e1e]">Assuma o controle do seu delivery com previsibilidade de custo</h1>
        <p className="mt-3 text-slate-600">Teste na sua loja antes de pagar, sem cartao, e veja na pratica como organizar pedidos e vender com mais seguranca.</p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`relative rounded-3xl border p-6 shadow-soft ${
              plan.badge ? 'border-[#ff6b00] bg-[#fff8f2]' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="mb-2 flex flex-wrap gap-2">
              {plan.badge ? (
                <p className="inline-flex rounded-full bg-[#ff6b00] px-3 py-1 text-xs font-semibold text-white">{plan.badge}</p>
              ) : null}
              {plan.promo ? (
                <p className="inline-flex rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">🔥 Promoção</p>
              ) : null}
            </div>
            <h2 className="font-display text-2xl font-semibold text-[#1e1e1e]">{plan.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{plan.subtitle}</p>
            <div className="mt-6">
              {plan.originalAmount ? (
                <p className="text-sm text-slate-400 line-through">{formatPrice(plan.originalAmount)}</p>
              ) : null}
              <p className="font-display text-4xl font-semibold text-[#ff6b00]">{formatPrice(plan.amount)}</p>
            </div>
            <p className="text-sm text-slate-500">{plan.cycleLabel}</p>

            <ul className="mt-5 grid gap-2 text-sm text-slate-700">
              {plan.perks.map((perk) => (
                <li key={perk}>- {perk}</li>
              ))}
            </ul>

            <button
              type="button"
              className="button-primary mt-7 w-full justify-center"
              onClick={() => handleChoosePlan(plan.id)}
              disabled={Boolean(loadingPlanId)}
            >
              {loadingPlanId === plan.id ? 'Iniciando seu teste...' : 'Comecar agora gratis'}
            </button>
          </article>
        ))}
      </div>

      {message ? <p className="mt-5 text-center text-sm font-semibold text-[#b94700]">{message}</p> : null}
    </section>
  )
}

export default Plans
