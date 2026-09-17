import { useState, type FormEvent } from "react";
import { Link, NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Compass,
  Home,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Avatar, Loading, Logo, Modal, Empty } from "./components";
import { useAuth, useData, useToast } from "./context";
import { send } from "./api";
import type { Notification } from "./types";

const nav = [
  { to: "/dashboard", icon: Home, label: "Dashboard" },
  { to: "/explore", icon: Compass, label: "Explore" },
  { to: "/sessions", icon: CalendarDays, label: "Sessions" },
  { to: "/community", icon: Users, label: "Community" },
  { to: "/resources", icon: BookOpen, label: "Resources" },
  { to: "/profile", icon: UserRound, label: "Profile" },
];
export default function Layout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [menu, setMenu] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const notices = useData<Notification[]>(user ? "/notifications" : "/health");
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  async function signOut() {
    try {
      await logout();
      navigate("/");
    } catch (e) {
      toast((e as Error).message, true);
    }
  }
  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate(
      `/explore?q=${encodeURIComponent(String(new FormData(e.currentTarget).get("q") || ""))}`,
    );
  }
  async function readNotifications() {
    setNotifications(true);
    try {
      await send("/notifications/read", {}, "PATCH");
      notices.reload();
    } catch (e) {
      toast((e as Error).message, true);
    }
  }
  const unread = Array.isArray(notices.data)
    ? notices.data.filter((n) => !n.read).length
    : 0;
  return (
    <div className="app-shell">
      {menu && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <div className="sidebar-brand">
          <Logo light />
          <button
            className="icon-button mobile-close"
            onClick={() => setMenu(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>
        <div className="nav-label">YOUR LEARNING SPACE</div>
        <nav>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenu(false)}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              {label}
              {label === "Explore" && <span className="nav-new">NEW</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-promo">
          <div className="promo-icon">
            <Sparkles size={23} />
          </div>
          <h3>
            Different skills.
            <br />
            <span>Shared possibilities.</span>
          </h3>
          <p>
            You have something
            <br />
            someone wants to learn.
          </p>
          <Link to="/explore" onClick={() => setMenu(false)}>
            Find your people <span>↗</span>
          </Link>
          <div className="promo-rings" />
        </div>
        <div className="sidebar-footer">
          <button className="nav-item" onClick={readNotifications}>
            <Bell size={18} />
            Notifications
            {unread > 0 && <span className="notification-count">{unread}</span>}
          </button>
          <NavLink className="nav-item" to="/settings">
            <Settings size={18} />
            Settings
          </NavLink>
          <button className="nav-item" onClick={signOut}>
            <LogOut size={18} />
            Log out
          </button>
        </div>
        <div className="sidebar-user">
          <Avatar person={user} />
          <div>
            <strong>{user.name}</strong>
            <span>Keep growing ✦</span>
          </div>
          <span className="online-dot" />
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMenu(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <form className="global-search" onSubmit={search}>
            <Search size={17} />
            <input
              name="q"
              aria-label="Search skills or learners"
              placeholder="Search skills, people, and possibilities…"
            />
            <kbd>↵</kbd>
          </form>
          <div className="topbar-right">
            <span className="today">
              A good day to grow <span>✦</span>
            </span>
            <button
              className="icon-button notification-bell"
              aria-label="Open notifications"
              onClick={readNotifications}
            >
              <Bell size={19} />
              {unread > 0 && <i />}
            </button>
            <div className="topbar-divider" />
            <Link className="topbar-user" to="/profile">
              <Avatar person={user} />
              <div>
                <strong>{user.name}</strong>
                <span>{user.major}</span>
              </div>
            </Link>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
        <footer className="workspace-footer">
          <span>Made for curious minds.</span>
          <span>
            Learn. Share. Grow. <span className="purple">✦</span>
          </span>
        </footer>
      </div>
      <nav className="mobile-nav">
        {nav
          .slice(0, 4)
          .concat(nav.slice(5))
          .map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}>
              <Icon size={19} />
              <span>{label === "Dashboard" ? "Home" : label}</span>
            </NavLink>
          ))}
      </nav>
      {notifications && (
        <Modal title="Your notifications" close={() => setNotifications(false)}>
          {Array.isArray(notices.data) && notices.data.length ? (
            <div className="notification-list">
              {notices.data.map((n) => (
                <Link
                  key={n._id}
                  to={n.link}
                  onClick={() => setNotifications(false)}
                >
                  <span className="notification-symbol">
                    <Bell size={17} />
                  </span>
                  <div>
                    <p>{n.text}</p>
                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Empty title="You’re all caught up">
              Session updates, new connections, and messages will appear here.
            </Empty>
          )}
        </Modal>
      )}
    </div>
  );
}
