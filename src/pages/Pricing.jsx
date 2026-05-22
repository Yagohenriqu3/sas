import { FiArrowRight, FiCheck, FiShield, FiZap } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const PLANS = [
  {
    id: 'monthly',
    label: 'Mensal',
    cycleLabel: '/mês',
    originalAmount: 'R$ 89,90',
    amount: 'R$ 29,90',
    description: 'Mensalidade fixa com alto custo-beneficio: voce testa gratis, sem cartao, e decide com seguranca.',
  },
  {
    id: 'quarterly',
    label: 'Trimestral',
    cycleLabel: '/trimestre',
    originalAmount: 'R$ 269,70',
    amount: 'R$ 79,90',
    description: 'Tres meses com economia real: mais tempo de operacao organizada por muito menos.',
    highlight: true,
    badge: 'Mais escolhido',
  },
  {
    id: 'semiannual',
    label: 'Semestral',
    cycleLabel: '/semestre',
    originalAmount: 'R$ 539,40',
    amount: 'R$ 149,90',
    description: 'Seis meses com o menor custo mensal: estabilidade para crescer com previsibilidade.',
  },
  {
    id: 'yearly',
    label: 'Anual',
    cycleLabel: '/ano',
    originalAmount: 'R$ 1.078,80',
    amount: 'R$ 269,90',
    description: 'Custo anual com economia maxima: invista mais no crescimento da sua loja.',
  },
]

const planFeatures = [
  'Receba e organize pedidos automaticamente sem erro ou confusao',
  'Tenha o link proprio da sua loja e controle total da operacao',
  'Venda mais com cardapio profissional, promoções e adicionais',
  'Acompanhe cada pedido do inicio ao fim com mais previsibilidade',
  'Ofereca formas de pagamento que facilitam a compra do cliente',
  'Veja com clareza quanto esta faturando para decidir com seguranca',
  'Defina horarios e disponibilidade para operar do seu jeito',
]

const guarantees = [
  '14 dias de teste gratis com risco zero e sem cartao',
  '0% de comissao por pedido para proteger sua margem',
  'Sem contrato preso: voce fica porque funciona',
]

function Pricing() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">Plano para controle e crescimento real</p>
        <h1 className="font-display text-5xl font-semibold tracking-tight text-[#1e1e1e] sm:text-6xl">
          Organize seu delivery, ganhe tempo no dia a dia e cresca com previsibilidade
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          Teste no seu proprio negocio antes de pagar e veja na pratica como sair da desorganizacao para uma operacao profissional.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col rounded-[2rem] border p-6 shadow-soft ${
              plan.highlight ? 'border-[#ff6b00] bg-[#fff8f2]' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex flex-wrap gap-2">
              {plan.badge && (
                <span className="inline-flex rounded-full bg-[#ff6b00] px-3 py-1 text-xs font-semibold text-white">{plan.badge}</span>
              )}
              <span className="inline-flex rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">🔥 Promoção</span>
            </div>

            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">Plano {plan.label}</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-[#1e1e1e]">Plataforma completa para profissionalizar seu delivery</h2>

            <div className="mt-5">
              <p className="text-sm text-slate-400 line-through">{plan.originalAmount}</p>
              <div className="flex items-end gap-1">
                <span className="font-display text-4xl font-bold text-[#1e1e1e]">{plan.amount}</span>
                <span className="mb-1 text-sm text-slate-500">{plan.cycleLabel}</span>
              </div>
            </div>

            <p className="mt-2 text-sm text-slate-500">{plan.description}</p>

            <div className="mt-6 flex-1 grid gap-3">
              {planFeatures.map((feature) => (
                <div key={feature} className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff6b00]/10 text-[#ff6b00]">
                    <FiCheck size={11} />
                  </div>
                  <span className="text-sm text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-2">
              <Link to="/cadastro" className="button-primary justify-center">
                Comecar agora gratis
                <FiArrowRight />
              </Link>
              <Link to="/contato" className="button-secondary justify-center">
                Tirar duvidas e ativar
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="rounded-[2rem] bg-[#1e1e1e] p-6 text-white shadow-[0_24px_60px_rgba(30,30,30,0.14)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#ffd166]">
            <FiShield size={22} />
          </div>
          <h3 className="mt-6 font-display text-3xl font-semibold">Modelo transparente</h3>
          <div className="mt-6 space-y-4">
            {guarantees.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-white/80">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffd166]" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#ff6b00]/10 bg-[#fff3e8] p-6 shadow-soft">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff6b00] text-white">
            <FiZap size={22} />
          </div>
          <h3 className="mt-6 font-display text-3xl font-semibold text-[#1e1e1e]">Pronto para evoluir</h3>
          <p className="mt-4 text-base leading-7 text-slate-700">
            Voce comeca hoje com um sistema pronto, confiavel e validado, que continua evoluindo para apoiar o crescimento da sua loja.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Pricing
