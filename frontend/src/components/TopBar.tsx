import { BookOpen, LogOut, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

type TopBarProps = {
  onSearch: () => void;
};

export function TopBar({ onSearch }: TopBarProps) {
  const { auth, logout } = useAuth();
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
