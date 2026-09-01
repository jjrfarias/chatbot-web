import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
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

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/:id" element={<ClientePerfil />} />
        <Route path="/nova-venda" element={<NewSaleWizard />} />
        <Route path="/conserto" element={<Conserto />} />
        <Route path="/financeiro" element={<Financeiro />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/historico" element={<History />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Route>
    </Routes>
  );
}

export default App;
