import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Sidebar from "./components/sidebar";
import Topbar from "./components/topbar";

import Dashboard from "./pages/dashboard";
import Transactions from "./pages/transactions";
import Analytics from "./pages/analytics";
import Mpesa from "./pages/mpesa";
import Login from "./pages/login";

function AppLayout() {
  const location = useLocation();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/transactions": "Transactions",
    "/analytics": "Analytics",
    "/mpesa": "M-Pesa",
  };

  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return <Login />;
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Topbar title={pageTitles[location.pathname] || "Dashboard"} />

        <div className="page-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/mpesa" element={<Mpesa />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
