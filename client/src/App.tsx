import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { NewSaleWizard } from "./pages/NewSale/NewSaleWizard";
import { Conserto } from "./pages/Conserto";
import { History } from "./pages/History";
import { Configuracoes } from "./pages/Configuracoes";
import { Clientes } from "./pages/Clientes";
import { ClientePerfil } from "./pages/ClientePerfil";
import { Financeiro } from "./pages/Financeiro";
import { Estoque } from "./pages/Estoque";
import { Usuarios } from "./pages/Usuarios";
import { Crm } from "./pages/Crm";
import { Acoes } from "./pages/Acoes";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/crm" element={<Crm />} />
            <Route path="/acoes" element={<Acoes />} />
            <Route path="/clientes/:id" element={<ClientePerfil />} />
            <Route path="/nova-venda" element={<NewSaleWizard />} />
            <Route path="/conserto" element={<Conserto />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/historico" element={<History />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
