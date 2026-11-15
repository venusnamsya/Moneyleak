import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
  X,
  Sun, Moon,
} from "lucide-react";
import api from "../services/api";

function Topbar({ title }) {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(
  localStorage.getItem("moneyleak_theme") || "light"
    );

 useEffect(() => {
     document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("moneyleak_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) =>
        current === "light" ? "dark" : "light"
     );
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/auth/profile/");
        setProfile(response.data);
      } catch (error) {
        console.log("PROFILE ERROR:", error.response?.status);
        console.log("PROFILE DETAILS:", error.response?.data);
        console.log("PROFILE MESSAGE:", error.message);
      }
    };

    fetchProfile();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) return;

    navigate(`/transactions?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("moneyleak_access");
    localStorage.removeItem("moneyleak_refresh");
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="topbar-heading">
        <h1>{title || "Dashboard"}</h1>
        <p>Welcome back. Here's your financial overview.</p>
      </div>

      <div className="topbar-actions">
        <form className="topbar-search" onSubmit={handleSearch}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </form>
            <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title="Toggle light and dark mode"
                >
                {theme === "light" ? (
                    <Moon size={20} />
                ) : (
                    <Sun size={20} />
                )}
            </button>

        <div className="topbar-menu-wrapper">
          <button
            className="notification-button"
            aria-label="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
          >
            <Bell size={20} />
          </button>

          {showNotifications && (
            <div className="topbar-dropdown notification-dropdown">
              <strong>Notifications</strong>
              <p className="empty-notifications">
                You're all caught up. No new notifications.
              </p>
            </div>
          )}
        </div>

        <div className="topbar-menu-wrapper">
          <button
            className="profile-button"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
          >
            <div className="profile-avatar">
              {profile?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="profile-info">
              <strong>{profile?.username || "Loading..."}</strong>
              <small>{profile?.email || "Personal account"}</small>
            </div>

            <ChevronDown size={16} />
          </button>

          {showProfile && (
            <div className="topbar-dropdown profile-dropdown">
              <div className="dropdown-user">
                <User size={18} />
                <div>
                  <strong>{profile?.username || "User"}</strong>
                  <small>{profile?.email || ""}</small>
                </div>
              </div>

              <button onClick={handleLogout} className="dropdown-action">
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;