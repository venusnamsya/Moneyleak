import { Search, Bell, ChevronDown } from "lucide-react";

function Topbar({ title }) {
  return (
    <header className="topbar">
      <div className="topbar-heading">
        <h1>{title || "Dashboard"}</h1>
        <p>Welcome back. Here's your financial overview.</p>
      </div>

      <div className="topbar-actions">
        <div className="topbar-search">
          <Search size={18} />
          <input type="text" placeholder="Search..." />
          <span>⌘ K</span>
        </div>

        <button className="notification-button" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <button className="profile-button">
          <div className="profile-avatar">V</div>
          <div className="profile-info">
            <strong>My Account</strong>
            <small>Personal</small>
          </div>
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}

export default Topbar;