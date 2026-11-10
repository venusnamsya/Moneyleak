import {
  LayoutDashboard,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Smartphone,
  Settings,
  LogOut,
  Wallet,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
  { name: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
  { name: "M-Pesa", path: "/mpesa", icon: Smartphone },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Wallet size={23} />
        </div>
        <span>Money<span className="brand-highlight">Leak</span></span>
      </div>

      <div className="sidebar-section-label">MENU</div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-section-label">PREFERENCES</div>

        <NavLink to="/settings" className="nav-item">
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>

        <button
          className="nav-item logout-button"
          onClick={() => {
            localStorage.removeItem("moneyleak_access");
            localStorage.removeItem("moneyleak_refresh");
            window.location.href = "/login";
          }}
        >
          <LogOut size={19} />
          <span>Log out</span>
        </button>

        <div className="sidebar-footer">
          <div className="footer-avatar">M</div>
          <div>
            <strong>MoneyLeak</strong>
            <small>Personal Finance</small>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;