import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  Calendar,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";

const Navbar = ({ user = {}, onLogout, selectedDate, onDateChange }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const dateInputRef = useRef(null);

  const displayDate = selectedDate
    ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // fall through to focus/click
      }
    }
    input.focus();
    input.click();
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  const initial = user.name?.[0]?.toUpperCase() || "U";

  return (
    <header className="header">
      <div className="header__brand" onClick={() => navigate("/")}>
        <span className="header__brand-icon">
          <Sparkles size={22} strokeWidth={2} />
        </span>
        <span className="header__brand-title">Daily Planner - AI Based</span>
      </div>

      <div
        className="header__date"
        title="Select date"
        role="button"
        tabIndex={0}
        aria-label="Select plan date"
        onClick={openDatePicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDatePicker();
          }
        }}
      >
        <Calendar size={16} className="header__date-icon" aria-hidden />
        <span className="header__date-text">{displayDate}</span>
        <input
          ref={dateInputRef}
          type="date"
          className="header__date-input"
          value={selectedDate || ""}
          onChange={(e) => onDateChange?.(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
        />
        <ChevronDown size={16} className="header__date-icon" aria-hidden />
      </div>

      <div className="header__actions">
        <button
          type="button"
          className="header__ai-btn"
          onClick={() => navigate("/plans")}
        >
          <Sparkles size={16} />
          <span>AI Planner</span>
        </button>

        <div className="header__avatar-wrap" ref={menuRef}>
          <button
            type="button"
            className="header__avatar"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="User menu"
            aria-expanded={menuOpen}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name || "User"} />
            ) : (
              initial
            )}
          </button>

          {menuOpen && (
            <ul className="header__menu" role="menu">
              <li>
                <button
                  type="button"
                  className="header__menu-item"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  <Settings size={16} />
                  Profile Settings
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="header__menu-item header__menu-item--danger"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
