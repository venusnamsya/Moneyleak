import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
  Outlet,
} from "react-router-dom";

import Sidebar from "./components/sidebar";
import Topbar from "./components/topbar";

import Dashboard from "./pages/dashboard";
import Transactions from "./pages/transactions";
import Analytics from "./pages/analytics";
import Mpesa from "./pages/mpesa";
import Login from "./pages/login";

function LandingPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#F7F8F5",
      color: "#243B35",
      fontFamily: "inherit",
    }}>
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 7%",
        flexWrap: "wrap",
        gap: "16px",
      }}>
        <h2 style={{ color: "#2D6A63", margin: 0 }}>
          MoneyLeak
        </h2>

        <Link
          to="/login"
          style={{
            textDecoration: "none",
            color: "#2D6A63",
            fontWeight: 600,
          }}
        >
          Sign in
        </Link>
      </nav>

      <section style={{
        maxWidth: "850px",
        margin: "100px auto",
        padding: "30px",
        textAlign: "center",
      }}>
        <p style={{
          color: "#2D6A63",
          fontWeight: 600,
          letterSpacing: "2px",
        }}>
          TAKE CONTROL OF YOUR MONEY
        </p>

        <h1 style={{
          fontSize: "clamp(38px, 6vw, 64px)",
          lineHeight: 1.1,
          marginBottom: "24px",
        }}>
          Understand your money.
          <br />
          Stop the leaks.
        </h1>

        <p style={{
          color: "#697871",
          fontSize: "18px",
          lineHeight: 1.7,
          maxWidth: "620px",
          margin: "0 auto 32px",
        }}>
          MoneyLeak helps you track transactions, understand
          your spending and manage your finances with clarity.
        </p>

        <Link
          to="/login"
          style={{
            display: "inline-block",
            background: "#2D6A63",
            color: "#FFFFFF",
            padding: "15px 32px",
            borderRadius: "9px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Get Started
        </Link>
      </section>

      <footer style={{
        textAlign: "center",
        padding: "30px",
        color: "#89948F",
      }}>
        © 2026 MoneyLeak. All rights reserved.
      </footer>
    </div>
  );
}

function ProtectedLayout() {
  const location = useLocation();

  const token = localStorage.getItem("moneyleak_access");

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/transactions": "Transactions",
    "/analytics": "Analytics",
    "/mpesa": "M-Pesa",
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Topbar
          title={pageTitles[location.pathname] || "Dashboard"}
        />

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/mpesa" element={<Mpesa />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
