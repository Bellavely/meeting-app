import { FC } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, LayoutDashboard, User, CalendarDays, History as HistoryIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";


export const Sidebar: FC = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="global-sidebar">
      <div className="sidebar-header">
        <div className="brand-logo">
          <CalendarDays size={28} className="brand-icon" />
          <span>MeetSync</span>
        </div>
        <div className="user-greeting">
          <div className="avatar">{user?.firstName?.[0] || "U"}</div>
          <div className="user-info">
            <span className="user-name">Hi, {user?.firstName}!</span>
            <span className="user-role">Member</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} /> 
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <HistoryIcon size={20} /> 
          <span>History</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={20} /> 
          <span>Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="nav-item logout-nav-item">
          <LogOut size={20} /> 
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
