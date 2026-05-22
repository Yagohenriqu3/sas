import { useState } from 'react'
import { FiExternalLink, FiLogOut, FiZap } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuth, getSavedAuth } from '../services/authService'
import { createSubscriptionLink } from '../services/billingService'

const PLANS = [
  { id: 'monthly',    label: 'Mensal',     originalAmount: 'R$ 89,90',    amount: 'R$ 29,90',  cycleLabel: '/mês' },
  { id: 'quarterly',  label: 'Trimestral', originalAmount: 'R$ 269,70',   amount: 'R$ 79,90',  cycleLabel: '/trim.', highlight: true, badge: 'Mais escolhido' },
  { id: 'semiannual', label: 'Semestral',  originalAmount: 'R$ 539,40',   amount: 'R$ 149,90', cycleLabel: '/sem.' },
  { id: 'yearly',     label: 'Anual',      originalAmount: 'R$ 1.078,80', amount: 'R$ 269,90', cycleLabel: '/ano' },
]

function formatDate(dateValue) {
  if (!dateValue) return 'N/A'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

function Account() {
  const navigate = useNavigate()
  const session = getSavedAuth()
  const [subscriptionMessage, setSubscriptionMessage] = useState('')
  const [loadingPlanId, setLoadingPlanId] = useState('')
  const [plansOpen, setPlansOpen] = useState(false)

  if (!session?.token || !session?.user || !session?.store) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-soft">
          <h1 className="font-display text-4xl font-semibold text-[#1e1e1e]">Você ainda não está logado</h1>
          <p className="mt-3 text-slate-600">Faça login para acessar os dados da sua loja.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link to="/login" className="button-primary">Entrar</Link>
            <Link to="/cadastro" className="button-secondary">Criar conta</Link>
          </div>
        </div>
      </section>
    )
  }

  const { user, store } = session
  const isTrial = String(store.subscriptionStatus || '').toLowerCase() === 'trial'
  const isActive = String(store.subscriptionStatus || '').toLowerCase() === 'active'

  async function handleChoosePlan(planId) {
    setSubscriptionMessage('')
    setLoadingPlanId(planId)
    try {
      const data = await createSubscriptionLink(session.token, planId)
      if (data?.initPoint) {
        window.open(data.initPoint, '_blank', 'noopener,noreferrer')
        return
      }
      setSubscriptionMessage('Nao foi possivel iniciar a assinatura agora. Tente novamente.')
    } catch (error) {
      setSubscriptionMessage(error.message)
    } finally {
      setLoadingPlanId('')
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid gap-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.6rem] bg-[#1e1e1e] p-6 text-white">
          <p className="eyebrow text-[#ffd166]">Conta SaaS ativa</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">Olá, {user.fullName}</h1>
          <p className="mt-4 text-sm text-white/75">Sua loja já está provisionada com link exclusivo e período de teste gratuito.</p>

          <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Loja:</strong> {store.name}</p>
            <p><strong>Slug:</strong> {store.slug}</p>
            <p><strong>Status:</strong> {store.subscriptionStatus}</p>
            <p><strong>Fim do teste:</strong> {formatDate(store.trialEndsAt)}</p>
          </div>
        </div>

        <div className="grid content-start gap-3">
          <a href={store.cardapioUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Abrir meu cardápio
            <FiExternalLink className="ml-2 inline" />
          </a>

          <a href={store.adminUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Abrir painel da loja
            <FiExternalLink className="ml-2 inline" />
          </a>

          <div className="mt-1 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Assinatura</p>
            <p className="mt-2 text-sm text-slate-700">
              Status atual:{' '}
              <strong className={isActive ? 'text-green-600' : isTrial ? 'text-amber-600' : 'text-slate-700'}>
                {isActive ? 'Ativa ✓' : isTrial ? 'Período de teste' : store.subscriptionStatus}
              </strong>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {isActive
                ? 'Sua assinatura esta ativa. Aproveite todos os recursos da plataforma.'
                : `Seu periodo de teste vai ate ${formatDate(store.trialEndsAt)}. Assine agora para nao perder o acesso.`}
            </p>

            {/* Trial: botão em destaque */}
            {isTrial && (
              <button
                type="button"
                className="button-primary mt-3 w-full justify-center"
                onClick={() => setPlansOpen((v) => !v)}
              >
                <FiZap className="mr-1" />
                {plansOpen ? 'Fechar planos' : 'Assinar agora — ver planos'}
              </button>
            )}

            {/* Ativo: botão pequeno discreto */}
            {isActive && (
              <button
                type="button"
                className="mt-3 text-xs text-slate-400 underline hover:text-slate-600 transition"
                onClick={() => setPlansOpen((v) => !v)}
              >
                {plansOpen ? 'Fechar planos' : 'Ver planos disponíveis'}
              </button>
            )}

            {plansOpen && (
              <div className="mt-4 grid gap-3">
                {isTrial && (
                  <p className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700">
                    ⚠️ Voce esta no periodo de teste. Escolha um plano para manter o acesso apos o encerramento.
                  </p>
                )}
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`rounded-2xl border p-3 ${plan.highlight ? 'border-[#ff6b00] bg-[#fff8f2]' : 'border-slate-200 bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex gap-1 flex-wrap mb-1">
                          {plan.badge && (
                            <span className="inline-flex rounded-full bg-[#ff6b00] px-2 py-0.5 text-[10px] font-semibold text-white">{plan.badge}</span>
                          )}
                          <span className="inline-flex rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white">🔥 Promoção</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-500">Plano {plan.label}</p>
                        <div className="flex items-end gap-1 mt-0.5">
                          <span className="text-xs text-slate-400 line-through">{plan.originalAmount}</span>
                          <span className="font-display text-lg font-bold text-[#1e1e1e]">{plan.amount}</span>
                          <span className="text-xs text-slate-500 mb-0.5">{plan.cycleLabel}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="button-primary shrink-0 text-sm py-2 px-4"
                        onClick={() => handleChoosePlan(plan.id)}
                        disabled={Boolean(loadingPlanId)}
                      >
                        {loadingPlanId === plan.id ? 'Aguarde...' : 'Assinar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {subscriptionMessage ? (
              <p className="mt-3 text-xs font-semibold text-[#b94700]">{subscriptionMessage}</p>
            ) : null}
          </div>

          <button
            type="button"
            className="button-secondary mt-2 justify-center"
            onClick={() => {
              clearAuth()
              navigate('/login')
            }}
          >
            <FiLogOut />
            Sair
          </button>
        </div>
      </div>
    </section>
  )
}

export default Account
