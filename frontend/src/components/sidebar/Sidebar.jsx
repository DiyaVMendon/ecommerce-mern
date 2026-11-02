import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  Home,
  Package,
  ShoppingBag,
  LogOut,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "react-toastify";

import Styles from "./sidebar.module.css";

// Change `to` to match the paths in your App.jsx routes.
const menuItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Product Management", to: "/admin", icon: Package },
];

// localStorage keys cleared on sign out.
// Change these to whatever your Login page saves (token, user, role...).
const AUTH_STORAGE_KEYS = ["token", "user"];

const getInitialTheme = () => {
  try {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch {
    return "light"; // storage unavailable
  }
};

const Sidebar = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  const settingsRef = useRef(null);

  // Apply the theme to <html data-theme="..."> and remember it
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    try {
      localStorage.setItem("theme", theme);
    } catch {
      // storage unavailable, theme just won't persist
    }
  }, [theme]);

  // Close the settings menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;

    const handleMouseDown = (event) => {
      if (!settingsRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleSignOut = () => {
    setMenuOpen(false);

    AUTH_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    toast.success("Signed out successfully");
    navigate("/login", { replace: true });
  };

  return (
    <aside className={Styles.sidebar}>
      <div className={Styles.brand}>
        <ShoppingBag size={22} />
        <span>E-Commerce</span>
      </div>

      <nav className={Styles.nav}>
        {menuItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `${Styles.link} ${isActive ? Styles.active : ""}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={Styles.footer} ref={settingsRef}>
        {menuOpen && (
          <div className={Styles.settingsMenu} role="menu">
            <div className={Styles.menuSection}>
              <p className={Styles.menuLabel}>Theme</p>

              <div className={Styles.themeToggle}>
                <button
                  type="button"
                  className={`${Styles.themeOption} ${
                    theme === "light" ? Styles.themeOptionActive : ""
                  }`}
                  aria-pressed={theme === "light"}
                  onClick={() => setTheme("light")}
                >
                  <Sun size={15} />
                  Light
                </button>

                <button
                  type="button"
                  className={`${Styles.themeOption} ${
                    theme === "dark" ? Styles.themeOptionActive : ""
                  }`}
                  aria-pressed={theme === "dark"}
                  onClick={() => setTheme("dark")}
                >
                  <Moon size={15} />
                  Dark
                </button>
              </div>
            </div>

            <div className={Styles.menuDivider} />

            <button
              type="button"
              className={Styles.signOutItem}
              role="menuitem"
              onClick={handleSignOut}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}

        <button
          type="button"
          className={`${Styles.settingsButton} ${
            menuOpen ? Styles.settingsButtonOpen : ""
          }`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
