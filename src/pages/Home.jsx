import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiMapPin,
  FiMessageCircle,
  FiShield,
  FiSmartphone,
  FiTrendingUp,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const proofStats = [
  { value: '14 dias', label: 'para testar grátis e validar no dia a dia' },
  { value: '100%', label: 'de controle da operação em um único painel' },
  { value: '0%', label: 'de comissão por pedido: venda mais, sem taxas extras' },
]

const readyNow = [
  'Cadastro rápido do lojista com acesso protegido e confiável.',
  'Link próprio da loja para vender com marca e identidade profissional.',
  'Cardápio moderno no celular com promoções e adicionais que aumentam ticket médio.',
  'Organização de complementos e extras pagos sem confusão no preparo.',
  'Pedido completo com endereço, localização e observações para reduzir erros.',
  'Bloqueio automático fora do horário para evitar pedidos fora da operação.',
  'Painel em tempo real com status do pedido e impressão térmica padronizada.',
  'Relatórios claros por período para entender faturamento e evolução.',
  'Visual da loja personalizável com logo e cores para passar mais confiança.',
]

const pillars = [
  {
    icon: FiSmartphone,
    title: 'Mais agilidade no atendimento',
    description:
      'Seu cliente faz o pedido no link da sua loja e tudo já entra organizado para preparar, entregar e concluir sem retrabalho.',
  },
  {
    icon: FiMessageCircle,
    title: 'WhatsApp sem bagunça',
    description:
      'Você continua vendendo no canal que o cliente já usa, mas com itens, endereço e pagamento registrados de forma correta.',
  },
  {
    icon: FiBarChart2,
    title: 'Decisão com números reais',
    description:
      'Acompanhe pedidos, ticket e crescimento com dados simples para decidir com segurança e aumentar resultado.',
  },
]

const roadmap = [
  {
    icon: FiTrendingUp,
    title: 'Evolução financeira inteligente',
    description: 'Automação de cobrança e renovação para manter previsibilidade e reduzir inadimplência.',
  },
  {
    icon: FiMapPin,
    title: 'Logística local mais eficiente',
    description: 'Regras por bairro, previsão de entrega mais precisa e operação cada vez mais organizada.',
  },
  {
    icon: FiShield,
    title: 'Gestão profissional multiunidade',
    description: 'Controles avançados para crescer com segurança e manter padrão mesmo com mais de uma loja.',
  },
]

function Home() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-16 -z-10 h-72 bg-[radial-gradient(circle,_rgba(255,107,0,0.17)_0%,_transparent_60%)] blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-[#ff6b00]/15 bg-[#ff6b00]/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">
              Plataforma validada no dia a dia do delivery
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-none tracking-tight text-[#1e1e1e] sm:text-6xl">
              Venda mais, organize seus pedidos e pare de depender de WhatsApp bagunçado
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              O LacheON coloca sua operação em ordem: cardápio próprio, pedidos em tempo real, pagamentos, impressão e
              relatórios em um só lugar. Você começa rápido, sem complicação, com 0% de comissão por pedido.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/cadastro" className="button-primary justify-center sm:justify-start">
                Começar agora com teste grátis
                <FiArrowRight />
              </Link>
              <Link to="/planos" className="button-secondary justify-center sm:justify-start">
                Ver planos e como funciona
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {proofStats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-soft">
                  <p className="font-display text-3xl font-semibold text-[#1e1e1e]">{stat.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-8 h-28 w-28 rounded-full bg-[#ffd166]/50 blur-3xl" />
            <div className="absolute -right-6 bottom-8 h-28 w-28 rounded-full bg-[#ff6b00]/20 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/80 bg-[#1e1e1e] p-4 shadow-[0_30px_80px_rgba(30,30,30,0.18)] sm:p-6">
              <div className="rounded-[1.6rem] bg-white p-5">
                <div className="flex items-center justify-between rounded-[1.4rem] bg-[#fff3e8] px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6b00]">
                      Operação pronta para vender
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold text-[#1e1e1e]">
                      Do pedido ao caixa fechado sem estresse
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#ff6b00] px-3 py-2 text-sm font-semibold text-white">
                    Ativo
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {[
                    'Cardápio profissional com promoções e adicionais para vender mais',
                    'Pedidos organizados automaticamente por etapa da operação',
                    'Pagamento simples no fluxo do pedido para agilizar o atendimento',
                    'Relatórios simples para enxergar resultado e crescer com controle',
                  ].map((line) => (
                    <div key={line} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff6b00]/10 text-[#ff6b00]">
                        <FiCheckCircle />
                      </div>
                      <p className="text-sm font-medium text-slate-700">{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="rounded-[2rem] border border-[#1e1e1e]/8 bg-white/80 p-6 shadow-soft sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="eyebrow">Funcionalidades já entregues</p>
            <h2 className="section-title">Tudo que você precisa para operar com segurança desde o primeiro dia</h2>
            <p className="section-copy">
              Não é promessa: o sistema já está pronto, validado e usado no dia a dia para dar mais controle e menos erro.
            </p>
          </div>

          <div className="mt-8 grid gap-3 lg:grid-cols-2">
            {readyNow.map((item) => (
              <div key={item} className="flex gap-3 rounded-[1.3rem] border border-slate-200 bg-white p-4">
                <div className="mt-0.5 text-[#ff6b00]">
                  <FiCheckCircle />
                </div>
                <p className="text-sm leading-7 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-2xl">
          <p className="eyebrow">Por que converte</p>
          <h2 className="section-title">Benefícios reais para quem quer vender mais com menos dor de cabeça</h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(30,30,30,0.1)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1e1e1e] text-xl text-[#ffd166]">
                <pillar.icon />
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold text-[#1e1e1e]">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="rounded-[2rem] bg-[#1e1e1e] p-6 text-white shadow-[0_30px_80px_rgba(30,30,30,0.18)] sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="eyebrow text-[#ffd166]">Potencial de evolução</p>
            <h2 className="section-title !text-white">Você começa hoje com uma base forte e evolui sem trocar de sistema</h2>
            <p className="section-copy text-white/70">
              Sua operação cresce com uma plataforma que continua evoluindo para aumentar eficiência, retenção e previsibilidade financeira.
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {roadmap.map((item) => (
              <div key={item.title} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#ffd166]">
                  <item.icon />
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/75">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:pb-24">
        <div className="rounded-[2rem] border border-[#ff6b00]/10 bg-[linear-gradient(135deg,_#ff6b00,_#ff8c38)] p-8 text-white shadow-[0_30px_60px_rgba(255,107,0,0.28)] lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-white/75">Vamos validar no seu negócio</p>
            <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Comece hoje e coloque sua operação no controle
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/80">
              Em poucos minutos você cria sua conta, recebe o link da loja e já pode vender com organização, profissionalismo e 0% de comissão.
            </p>
          </div>

          <div className="mt-6 lg:mt-0">
            <Link to="/cadastro" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1e1e1e] transition hover:-translate-y-0.5 hover:bg-[#fff3e8]">
              Criar conta e testar grátis
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
