import { useEffect, useState } from 'react'
import { FiArrowRight, FiMenu, FiX } from 'react-icons/fi'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { clearAuth, getSavedAuth } from '../services/authService'

const navigationItems = [
  { label: 'Home', to: '/' },
  { label: 'Planos', to: '/planos' },
  { label: 'Contato', to: '/contato' },
]

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const session = getSavedAuth()
  const isAuthenticated = Boolean(session?.token)
  const panelUrl = session?.user?.isMaster ? '/master/usuarios' : '/minha-conta'

  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,209,102,0.2),_transparent_35%),linear-gradient(180deg,_#fff8f1_0%,_#fffdf8_42%,_#ffffff_100%)] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff6b00] text-lg font-black text-white shadow-[0_16px_30px_rgba(255,107,0,0.25)]">
              LO
            </div>
            <div>
              <p className="font-display text-lg font-bold tracking-tight text-[#1e1e1e]">
                LacheON SaaS
              </p>
              <p className="text-xs text-slate-500">Plataforma consolidada para operação de delivery</p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-2 md:flex">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#1e1e1e] text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden text-right md:block">
            {isAuthenticated ? (
              <>
                <NavLink
                  to={panelUrl}
                  className="button-primary"
                >
                  Acessar painel
                  <FiArrowRight />
                </NavLink>
                <button
                  type="button"
                  className="mt-1 block w-full text-xs font-semibold text-[#ff6b00] hover:underline"
                  onClick={() => {
                    clearAuth()
                    window.location.href = '/'
                  }}
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="button-primary">
                  Login
                  <FiArrowRight />
                </NavLink>
                <NavLink to="/cadastro" className="mt-1 block text-xs font-semibold text-[#ff6b00] hover:underline">
                  Cadastre-se
                </NavLink>
              </>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-900 md:hidden"
            onClick={() => setMenuOpen((currentValue) => !currentValue)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-[#1e1e1e] text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <>
                  <NavLink
                    to={panelUrl}
                    className="button-primary justify-center"
                  >
                    Acessar painel
                    <FiArrowRight />
                  </NavLink>
                  <button
                    type="button"
                    className="rounded-2xl px-4 py-2 text-center text-sm font-semibold text-[#ff6b00] hover:bg-[#fff3e8]"
                    onClick={() => {
                      clearAuth()
                      window.location.href = '/'
                    }}
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className="button-primary justify-center">
                    Login
                    <FiArrowRight />
                  </NavLink>
                  <NavLink to="/cadastro" className="rounded-2xl px-4 py-2 text-center text-sm font-semibold text-[#ff6b00] hover:bg-[#fff3e8]">
                    Cadastre-se
                  </NavLink>
                </>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/80 bg-[#1e1e1e] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
          <div>
            <p className="font-display text-2xl font-semibold">LacheON SaaS</p>
            <p className="mt-4 max-w-md text-sm text-white/70">
              Plataforma SaaS já em produção para restaurantes, lanchonetes e delivery local venderem
              com cardápio próprio, dados isolados por loja e gestão completa da operação.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ffd166]">
              Navegação
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
              {navigationItems.map((item) => (
                <NavLink key={item.to} to={item.to} className="hover:text-white">
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ffd166]">
              O que já entrega
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
              <p>Link exclusivo por loja</p>
              <p>Pedidos e pagamentos em tempo real</p>
              <p>Faturamento com comparativos</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout