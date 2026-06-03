import { BookOpen, LogOut, Moon, Search, Sun } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { useTheme } from "../hooks/useTheme";

type TopBarProps = {
  onSearch: () => void;
};

export function TopBar({ onSearch }: TopBarProps) {
  const { auth, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const displayName = auth?.displayName || auth?.email || "Reader";
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <header className="topbar">
      <NavLink to="/" className="brand">
        raffy
      </NavLink>

      <nav className="nav-tabs" aria-label="Primary navigation">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
        >
          Home
        </NavLink>
        <NavLink
          to="/journal"
          className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
        >
          Journal
        </NavLink>
      </nav>

      <button className="search-shell" type="button" onClick={onSearch}>
        <Search size={16} aria-hidden="true" />
        <span>Search Google Books...</span>
      </button>

      <div className="user-cluster">
        <button className="icon-button" type="button" onClick={toggle} aria-label="Toggle theme">
          <span className="theme-icon-wrap">
            <Sun size={17} className={`theme-icon${theme === "dark" ? " theme-icon--hidden" : ""}`} aria-hidden="true" />
            <Moon size={17} className={`theme-icon${theme === "light" ? " theme-icon--hidden" : ""}`} aria-hidden="true" />
          </span>
        </button>
        <BookOpen size={16} aria-hidden="true" />
        <span>{displayName}</span>
        <div className="avatar" aria-hidden="true">
          {initial}
        </div>
        <button className="icon-button" type="button" onClick={logout} aria-label="Log out">
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
