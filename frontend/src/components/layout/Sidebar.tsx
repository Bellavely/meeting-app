import { FC } from "react";
import { LogOut, LayoutDashboard, User, Settings, CalendarDays } from "lucide-react";
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
        <button className="nav-item active">
          <LayoutDashboard size={20} /> 
          <span>Dashboard</span>
        </button>
        <button className="nav-item">
          <User size={20} /> 
          <span>Profile</span>
        </button>
        <button className="nav-item">
          <Settings size={20} /> 
          <span>Settings</span>
        </button>
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
