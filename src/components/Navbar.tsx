import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { user, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="nav-brand">
        <span className="logo-mark">TF</span>
        <span className="logo-name">TaskFlow</span>
      </div>
      <div className="nav-links">
        <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} data-testid="nav-dashboard">Dashboard</Link>
        <Link to="/tasks" className={`nav-link ${location.pathname === '/tasks' ? 'active' : ''}`} data-testid="nav-tasks">Tasks</Link>
      </div>
      <div className="nav-user">
        <span className="user-name" data-testid="user-name">{user?.name}</span>
        <button className="btn-ghost btn-sm" data-testid="logout-button" onClick={handleLogout}>Sign out</button>
      </div>
    </nav>
  );
}