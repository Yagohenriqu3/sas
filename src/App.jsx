import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Account from './pages/Account'
import Contact from './pages/Contact'
import Home from './pages/Home'
import Login from './pages/Login'
import MasterUsers from './pages/MasterUsers'
import Plans from './pages/Plans'
import Pricing from './pages/Pricing'
import Register from './pages/Register'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/planos" element={<Pricing />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/minha-conta" element={<Account />} />
        <Route path="/escolher-plano" element={<Plans />} />
        <Route path="/master/usuarios" element={<MasterUsers />} />
      </Route>
    </Routes>
  )
}

export default App