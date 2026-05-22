import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuth, getSavedAuth } from '../services/authService'
import { listAllUsers, updateUserByMaster } from '../services/masterService'

function formatDate(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

function getDaysUntil(value) {
  if (!value) return null
  const targetDate = new Date(value)
  if (Number.isNaN(targetDate.getTime())) return null

  const startToday = new Date()
  startToday.setHours(0, 0, 0, 0)
  targetDate.setHours(0, 0, 0, 0)

  const diffMs = targetDate.getTime() - startToday.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function buildReminderMessage({ userName, storeName, expirationDate }) {
  const formattedDate = formatDate(expirationDate)
  return `Ola ${userName}, tudo bem? A assinatura da loja ${storeName} esta proxima do vencimento (${formattedDate}). Regularize para manter o cardapio ativo sem interrupcoes.`
}

function buildWhatsAppLink(phone, message) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

function buildEmailLink(email, message) {
  const normalizedEmail = String(email || '').trim()
  if (!normalizedEmail) return ''
  const subject = 'Aviso de renovacao da assinatura'
  return `mailto:${normalizedEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
}

function MasterUsers() {
  const navigate = useNavigate()
  const session = useMemo(() => getSavedAuth(), [])
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [onlyExpiringSoon, setOnlyExpiringSoon] = useState(false)
  const [expiringWindowDays, setExpiringWindowDays] = useState(7)
  const [expandedUsers, setExpandedUsers] = useState({})
  const [loading, setLoading] = useState(true)
  const [savingUserId, setSavingUserId] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [formState, setFormState] = useState({})

  useEffect(() => {
    if (!session?.token || !session?.user?.isMaster) {
      navigate('/login')
      return
    }

    async function loadUsers() {
      setLoading(true)
      setFeedback('')
      try {
        const result = await listAllUsers(session.token)
        setUsers(result)

        const nextFormState = {}
        result.forEach((user) => {
          const store = user.stores?.[0]
          nextFormState[user.id] = {
            fullName: user.fullName || '',
            storeName: store?.name || '',
            email: user.email || '',
            phone: user.phone || '',
            documentNumber: user.documentNumber || '',
            legalName: user.legalName || '',
            billingZip: user.billingZip || '',
            billingStreet: user.billingStreet || '',
            billingNumber: user.billingNumber || '',
            billingNeighborhood: user.billingNeighborhood || '',
            billingCity: user.billingCity || '',
            billingState: user.billingState || '',
            password: '',
            confirmPassword: '',
            subscriptionStatus: store?.subscriptionStatus || 'manual',
            accessDays: '',
          }
        })

        setFormState(nextFormState)
      } catch (error) {
        setFeedback(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [navigate, session?.token, session?.user?.isMaster])

  function handleFieldChange(userId, field, value) {
    setFormState((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      },
    }))
  }

  async function handleSave(userId) {
    const values = formState[userId]
    if (!values) return

    if (values.password && values.password.length < 6) {
      setFeedback('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (values.password !== values.confirmPassword) {
      setFeedback('As senhas nao conferem para o usuario selecionado.')
      return
    }

    setSavingUserId(userId)
    setFeedback('')

    try {
      const payload = {
        fullName: values.fullName,
        storeName: values.storeName,
        email: values.email,
        phone: values.phone,
        documentNumber: values.documentNumber,
        legalName: values.legalName,
        billingZip: values.billingZip,
        billingStreet: values.billingStreet,
        billingNumber: values.billingNumber,
        billingNeighborhood: values.billingNeighborhood,
        billingCity: values.billingCity,
        billingState: values.billingState,
        subscriptionStatus: values.subscriptionStatus,
      }

      if (values.password) {
        payload.password = values.password
      }

      if (values.accessDays !== '') {
        payload.accessDays = Number(values.accessDays)
      }

      await updateUserByMaster(session.token, userId, payload)

      const refreshed = await listAllUsers(session.token)
      setUsers(refreshed)
      setFormState((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          password: '',
          confirmPassword: '',
        },
      }))
      setFeedback('Usuario atualizado com sucesso.')
    } catch (error) {
      setFeedback(error.message)
    } finally {
      setSavingUserId(null)
    }
  }

  const filteredUsers = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()
    return users.filter((user) => {
      const store = user.stores?.[0]
      const userName = String(user.fullName || '').toLowerCase()
      const userEmail = String(user.email || '').toLowerCase()
      const storeName = String(store?.name || '').toLowerCase()
      const daysUntil = getDaysUntil(store?.trialEndsAt)
      const isExpiringSoon =
        typeof daysUntil === 'number' &&
        daysUntil >= 0 &&
        daysUntil <= Number(expiringWindowDays)

      const matchesSearch =
        !normalizedTerm ||
        userName.includes(normalizedTerm) ||
        userEmail.includes(normalizedTerm) ||
        storeName.includes(normalizedTerm)

      if (!matchesSearch) return false

      if (onlyExpiringSoon) {
        return isExpiringSoon
      }

      return true
    })
  }, [expiringWindowDays, onlyExpiringSoon, searchTerm, users])

  function toggleExpanded(userId) {
    setExpandedUsers((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  if (!session?.user?.isMaster) {
    return null
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-[#ff6b00]">Painel Master</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-[#1e1e1e]">Usuarios cadastrados</h1>
          <p className="mt-2 text-slate-600">Edite os dados e controle o tempo de acesso mesmo sem assinatura paga.</p>
        </div>

        <button
          type="button"
          className="button-secondary"
          onClick={() => {
            clearAuth()
            navigate('/login')
          }}
        >
          Sair do master
        </button>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Filtrar por nome do usuario, email ou nome da loja
            <input
              className="input-field"
              placeholder="Ex: joao, loja centro, email@dominio.com"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Janela de vencimento (dias)
            <select
              className="input-field"
              value={expiringWindowDays}
              onChange={(event) => setExpiringWindowDays(Number(event.target.value))}
            >
              <option value={3}>3 dias</option>
              <option value={7}>7 dias</option>
              <option value={15}>15 dias</option>
              <option value={30}>30 dias</option>
            </select>
          </label>

          <label className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={onlyExpiringSoon}
              onChange={(event) => setOnlyExpiringSoon(event.target.checked)}
            />
            Mostrar apenas prestes a vencer
          </label>
        </div>
      </div>

      {feedback ? <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{feedback}</p> : null}

      {loading ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-slate-600">Carregando usuarios...</p>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => {
            const store = user.stores?.[0]
            const rowState = formState[user.id] || {
              fullName: user.fullName || '',
              storeName: store?.name || '',
              email: user.email || '',
              phone: user.phone || '',
              documentNumber: user.documentNumber || '',
              legalName: user.legalName || '',
              billingZip: user.billingZip || '',
              billingStreet: user.billingStreet || '',
              billingNumber: user.billingNumber || '',
              billingNeighborhood: user.billingNeighborhood || '',
              billingCity: user.billingCity || '',
              billingState: user.billingState || '',
              password: '',
              confirmPassword: '',
              subscriptionStatus: store?.subscriptionStatus || 'manual',
              accessDays: '',
            }
            const isExpanded = Boolean(expandedUsers[user.id])
            const daysUntilExpiration = getDaysUntil(store?.trialEndsAt)
            const isExpiringSoon =
              typeof daysUntilExpiration === 'number' &&
              daysUntilExpiration >= 0 &&
              daysUntilExpiration <= Number(expiringWindowDays)
            const reminderMessage = buildReminderMessage({
              userName: user.fullName || 'cliente',
              storeName: store?.name || 'sua loja',
              expirationDate: store?.trialEndsAt,
            })
            const whatsappLink = buildWhatsAppLink(rowState.phone, reminderMessage)
            const emailLink = buildEmailLink(rowState.email, reminderMessage)

            return (
              <article key={user.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
                <div className="grid gap-4 lg:grid-cols-6">
                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    Nome
                    <input
                      className="input-field"
                      value={rowState.fullName}
                      onChange={(event) => handleFieldChange(user.id, 'fullName', event.target.value)}
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    Nome da loja
                    <input
                      className="input-field"
                      value={rowState.storeName}
                      onChange={(event) => handleFieldChange(user.id, 'storeName', event.target.value)}
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-slate-700 lg:col-span-2">
                    Email
                    <input
                      className="input-field"
                      value={rowState.email}
                      onChange={(event) => handleFieldChange(user.id, 'email', event.target.value)}
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    Nova senha
                    <input
                      type="password"
                      className="input-field"
                      placeholder="Minimo 6 caracteres"
                      value={rowState.password}
                      onChange={(event) => handleFieldChange(user.id, 'password', event.target.value)}
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    Confirmar senha
                    <input
                      type="password"
                      className="input-field"
                      placeholder="Repita a nova senha"
                      value={rowState.confirmPassword}
                      onChange={(event) => handleFieldChange(user.id, 'confirmPassword', event.target.value)}
                    />
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    Status de acesso
                    <select
                      className="input-field"
                      value={rowState.subscriptionStatus}
                      onChange={(event) => handleFieldChange(user.id, 'subscriptionStatus', event.target.value)}
                    >
                      <option value="trial">trial</option>
                      <option value="active">active</option>
                      <option value="manual">manual</option>
                      <option value="paused">paused</option>
                      <option value="canceled">canceled</option>
                    </select>
                  </label>

                  <label className="grid gap-1 text-sm font-semibold text-slate-700">
                    Liberar acesso por (dias)
                    <input
                      type="number"
                      min="0"
                      className="input-field"
                      placeholder="Ex: 30"
                      value={rowState.accessDays}
                      onChange={(event) => handleFieldChange(user.id, 'accessDays', event.target.value)}
                    />
                  </label>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                  <p>
                    Loja: <strong>{store?.name || 'Sem loja'}</strong> | Expira em:{' '}
                    <strong>{formatDate(store?.trialEndsAt)}</strong>
                    {typeof daysUntilExpiration === 'number' ? (
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${isExpiringSoon ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                        {daysUntilExpiration < 0 ? 'vencida' : `${daysUntilExpiration} dia(s)`}
                      </span>
                    ) : null}
                  </p>

                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => toggleExpanded(user.id)}
                  >
                    {isExpanded ? 'Esconder dados de cadastro' : 'Mostrar dados de cadastro'}
                  </button>

                  <a
                    href={whatsappLink || '#'}
                    className={`button-secondary ${whatsappLink ? '' : 'pointer-events-none opacity-50'}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Avisar no WhatsApp
                  </a>

                  <a
                    href={emailLink || '#'}
                    className={`button-secondary ${emailLink ? '' : 'pointer-events-none opacity-50'}`}
                  >
                    Avisar por email
                  </a>

                  <button
                    type="button"
                    className="button-primary"
                    disabled={savingUserId === user.id}
                    onClick={() => handleSave(user.id)}
                  >
                    {savingUserId === user.id ? 'Salvando...' : 'Salvar alteracoes'}
                  </button>
                </div>

                {isExpanded ? (
                  <div className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-3">
                    <label className="grid gap-1 text-sm font-semibold text-slate-700">
                      Telefone
                      <input
                        className="input-field"
                        value={rowState.phone}
                        onChange={(event) => handleFieldChange(user.id, 'phone', event.target.value)}
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-semibold text-slate-700">
                      CPF/CNPJ
                      <input
                        className="input-field"
                        value={rowState.documentNumber}
                        onChange={(event) => handleFieldChange(user.id, 'documentNumber', event.target.value)}
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-semibold text-slate-700">
                      Razao social/nome fiscal
                      <input
                        className="input-field"
                        value={rowState.legalName}
                        onChange={(event) => handleFieldChange(user.id, 'legalName', event.target.value)}
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-semibold text-slate-700">
                      CEP
                      <input
                        className="input-field"
                        value={rowState.billingZip}
                        onChange={(event) => handleFieldChange(user.id, 'billingZip', event.target.value)}
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-semibold text-slate-700">
                      Rua
                      <input
                        className="input-field"
                        value={rowState.billingStreet}
                        onChange={(event) => handleFieldChange(user.id, 'billingStreet', event.target.value)}
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-semibold text-slate-700">
                      Numero
                      <input
                        className="input-field"
                        value={rowState.billingNumber}
                        onChange={(event) => handleFieldChange(user.id, 'billingNumber', event.target.value)}
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-semibold text-slate-700">
                      Bairro
                      <input
                        className="input-field"
                        value={rowState.billingNeighborhood}
                        onChange={(event) => handleFieldChange(user.id, 'billingNeighborhood', event.target.value)}
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-semibold text-slate-700">
                      Cidade
                      <input
                        className="input-field"
                        value={rowState.billingCity}
                        onChange={(event) => handleFieldChange(user.id, 'billingCity', event.target.value)}
                      />
                    </label>

                    <label className="grid gap-1 text-sm font-semibold text-slate-700">
                      UF
                      <input
                        className="input-field"
                        maxLength={2}
                        value={rowState.billingState}
                        onChange={(event) => handleFieldChange(user.id, 'billingState', event.target.value.toUpperCase())}
                      />
                    </label>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default MasterUsers
