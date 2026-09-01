import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { NewSaleWizard } from "./pages/NewSale/NewSaleWizard";
import { Repair } from "./pages/Repair";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/nova-venda" element={<NewSaleWizard />} />
        <Route path="/conserto" element={<Repair />} />
        <Route path="/historico" element={<History />} />
        <Route path="/configuracoes" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
