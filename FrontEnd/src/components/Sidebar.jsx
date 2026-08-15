import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  BarChart3,
  Settings,
  ChevronsLeft,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  { text: "Dashboard", path: "/", icon: LayoutDashboard },
  { text: "Plans", path: "/plans", icon: CalendarDays },
  { text: "TaskBoard", path: "/taskboard", icon: CheckSquare },
  { text: "Analytics", path: "/analytics", icon: BarChart3 },
  { text: "Settings", path: "/profile", icon: Settings },
];

const Sidebar = ({ user }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const username = user?.name || "User";

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

  const renderItems = (isDrawer = false) =>
    menuItems.map(({ text, path, icon: Icon }) => (
      <NavLink
        key={text}
        to={path}
        end={path === "/"}
        className={({ isActive }) =>
          `sidebar__item${isActive ? " is-active" : ""}`
        }
        onClick={() => setMobileOpen(false)}
        title={text}
      >
        <span className="sidebar__item-icon">
          <Icon size={isDrawer ? 20 : 22} strokeWidth={1.75} />
        </span>
        <span className="sidebar__item-label">{text}</span>
      </NavLink>
    ));

  return (
    <>
      <aside className="sidebar" aria-label="Main navigation">
        <nav className="sidebar__nav">{renderItems()}</nav>
        <div className="sidebar__footer">
          <button
            type="button"
            className="sidebar__collapse"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft size={18} strokeWidth={1.75} />
            <span>Collapse</span>
          </button>
        </div>
      </aside>

      {!mobileOpen && (
        <button
          type="button"
          className="sidebar__mobile-trigger"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      )}

      {mobileOpen && (
        <>
          <div
            className="sidebar__drawer-backdrop"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="sidebar__drawer"
            role="dialog"
            aria-label="Mobile menu"
          >
            <div className="sidebar__drawer-header">
              <h2>Menu</h2>
              <button
                type="button"
                className="sidebar__drawer-close"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Hey, {username}
            </p>
            <nav className="sidebar__nav">{renderItems(true)}</nav>
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;
