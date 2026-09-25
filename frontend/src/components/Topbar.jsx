import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef(null);

  const linksByRole = {
    student: [
      { to: '/student', label: 'Tableau de bord' },
      { to: '/internships', label: 'Explorer' },
      { to: '/student/applications', label: 'Candidatures' },
      { to: '/student/profile', label: 'Mon Profil' },
    ],
    company: [
      { to: '/company', label: 'Espace Entreprise' },
    ],
    admin: [
      { to: '/admin', label: 'Administration' },
    ],
  };

  const fetchNotifs = () => {
    if (user) {
      api.getNotifications()
        .then(setNotifications)
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
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
      <Link to="/" className="wordmark">StageMatch</Link>

      <div className="nav-links">
        {user && (linksByRole[user.role] || []).map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={location.pathname === l.to || location.pathname.startsWith(l.to + '/') ? 'active' : ''}
          >
            {l.label}
          </Link>
        ))}

        {/* Notification Bell */}
        {user && (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="notif-btn"
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifs && (
              <div className="notif-dropdown">
                <div className="notif-dropdown__header">
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                    Notifications {unreadCount > 0 && (
                      <span className="tag tag--active" style={{ marginLeft: 6, padding: '2px 8px', fontSize: 11 }}>
                        {unreadCount}
                      </span>
                    )}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="btn btn--ghost"
                      style={{ fontSize: 12, padding: '4px 8px' }}
                    >
                      Tout lire
                    </button>
                  )}
                </div>

                {!notifications.length ? (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 16px' }}>
                    Aucune notification
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`notif-item ${n.is_read ? '' : 'notif-item--unread'}`}
                    >
                      {!n.is_read && (
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', float: 'right', marginTop: 4 }} />
                      )}
                      <div className={`notif-item__msg ${n.is_read ? 'notif-item--read' : ''}`}>
                        {n.message}
                      </div>
                      <div className="notif-item__time">
                        {new Date(n.created_at).toLocaleString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Auth button */}
        {user ? (
          <button
            className="btn btn--outline btn--sm"
            onClick={() => { logout(); navigate('/login'); }}
          >
            Déconnexion
          </button>
        ) : (
          <Link to="/login" className="btn btn--primary btn--sm">Se connecter</Link>
        )}
      </div>
    </nav>
  );
}
