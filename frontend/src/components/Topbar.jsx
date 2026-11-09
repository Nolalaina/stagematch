import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { Bell, LayoutDashboard, Search, FileText, User, Building2, ShieldCheck, LogOut, LogIn, CheckCheck } from 'lucide-react';

export default function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef(null);

  const linksByRole = {
    student: [
      { to: '/student', label: 'Tableau de bord', icon: LayoutDashboard },
      { to: '/internships', label: 'Explorer les stages', icon: Search },
      { to: '/student/applications', label: 'Candidatures', icon: FileText },
      { to: '/student/profile', label: 'Mon profil et CV', icon: User },
    ],
    company: [{ to: '/company', label: 'Espace entreprise', icon: Building2 }],
    admin: [{ to: '/admin', label: "Console d'administration", icon: ShieldCheck }],
  };

  useEffect(() => {
    const fetchNotifs = () => { if (user) api.getNotifications().then(setNotifications).catch(() => {}); };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)));
  };
  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
  };

  return (
    <nav className="topbar">
      <Link to="/" className="wordmark" aria-label="StageMatch">
        <span className="wordmark-mark"><Bell size={16} /></span>
        <span>StageMatch</span>
      </Link>

      <div className="nav-links">
        {user && (linksByRole[user.role] || []).map((l) => {
          const Icon = l.icon;
          const isActive = location.pathname === l.to || (l.to !== '/' && location.pathname.startsWith(l.to + '/'));
          return (
            <Link key={l.to} to={l.to} className="nav-link" aria-current={isActive ? 'page' : undefined}>
              <Icon size={16} />
              <span>{l.label}</span>
            </Link>
          );
        })}

        {user && (
          <div ref={dropdownRef} className="nav-notifs">
            <button onClick={() => setShowNotifs(!showNotifs)} className="btn btn--ghost" title="Notifications" aria-expanded={showNotifs}>
              <Bell size={18} />
              {unreadCount > 0 && <span className="tag tag--active">{unreadCount}</span>}
            </button>
            {showNotifs && (
              <div className="notif-dropdown">
                <div className="notif-dropdown__header">
                  <span className="notif-title"><Bell size={16} /> Notifications {unreadCount > 0 && <span className="tag tag--active">{unreadCount}</span>}</span>
                  {unreadCount > 0 && <button onClick={handleMarkAllRead} className="btn btn--ghost btn--xs"><CheckCheck size={14} /> Tout lire</button>}
                </div>
                {!notifications.length ? (
                  <p className="notif-empty">Aucune notification pour le moment</p>
                ) : (
                  notifications.map((n) => (
                    <button key={n.id} type="button" onClick={() => handleMarkRead(n.id)} className={`notif-item ${n.is_read ? 'notif-item--read' : 'notif-item--unread'}`}>
                      <span className="notif-item__msg">{n.message}</span>
                      <span className="notif-item__time">{new Date(n.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {user ? (
          <button className="btn btn--outline btn--sm" onClick={() => { logout(); navigate('/login'); }}><LogOut size={15} /><span>Déconnexion</span></button>
        ) : (
          <Link to="/login" className="btn btn--primary btn--sm"><LogIn size={15} /><span>Se connecter</span></Link>
        )}
      </div>
    </nav>
  );
}
