import { useState } from 'react'
import { FiArrowRight, FiMail, FiMessageSquare, FiPhoneCall } from 'react-icons/fi'

const initialFormData = {
  name: '',
  whatsapp: '',
  email: '',
  message: '',
}

const WHATSAPP_NUMBER = '5500000000000'

function Contact() {
  const [formData, setFormData] = useState(initialFormData)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const whatsappMessage = [
      'Ola, quero iniciar meu teste no LacheON SaaS.',
      `Nome: ${formData.name}`,
      `WhatsApp: ${formData.whatsapp}`,
      `Email: ${formData.email}`,
      `Mensagem: ${formData.message}`,
    ].join('\n')

    const targetUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`

    window.open(targetUrl, '_blank', 'noopener,noreferrer')
    setSubmitted(true)
    setFormData(initialFormData)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <section>
          <p className="eyebrow">Implantacao assistida</p>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-[#1e1e1e] sm:text-6xl">
            Comece com suporte e seguranca desde o primeiro dia
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Voce nao precisa se virar sozinho. Nosso time acompanha sua ativacao para sua loja entrar no ar rapido,
            com processo simples, controle total e operacao organizada desde o inicio.
          </p>

          <div className="mt-10 grid gap-4">
            {[
              {
                icon: FiPhoneCall,
                title: 'Diagnostico do seu negocio',
                description: 'Entendemos sua rotina antes de ativar, para configurar tudo do jeito certo para sua operacao.',
              },
              {
                icon: FiMessageSquare,
                title: 'Implantacao guiada passo a passo',
                description: 'Voce entra no teste gratis com orientacao pratica para operar sem complicacao e sem risco.',
              },
              {
                icon: FiMail,
                title: 'Crescimento com acompanhamento real',
                description: 'Nao e so ativar: ajudamos voce a evoluir com mais controle, menos bagunca e mais clareza de resultado.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-soft">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1e1e1e] text-[#ffd166]">
                  <item.icon />
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold text-[#1e1e1e]">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-4xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff6b00]">Fale com nosso time</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-[#1e1e1e]">Receba seu plano de inicio sem complicacao</h2>
            </div>
            <div className="rounded-full bg-[#fff3e8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
              Suporte proximo
            </div>
          </div>

          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Nome
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                required
                className="input-field"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              WhatsApp
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                required
                className="input-field"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="voce@seunegocio.com"
                required
                className="input-field"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Mensagem
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Conte rapidamente seu momento: pedidos, equipe e maior desafio hoje"
                rows="5"
                required
                className="input-field resize-none"
              />
            </label>

            <button type="submit" className="button-primary mt-2 justify-center">
              Quero iniciar meu teste com suporte
              <FiArrowRight />
            </button>
          </form>

          {submitted ? (
            <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              Abrimos seu WhatsApp com os dados prontos. Nosso time vai te atender para voce comecar a operar rapidamente.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  )
}

export default Contact