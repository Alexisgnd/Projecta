import React, { useRef, useEffect } from 'react';
import { FaHome, FaFolderOpen, FaUsers, FaQuestionCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import Text from './Text';
import './Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../supabaseClient';
import { useUserUpdate } from '../UserContext';
import { useProfilePreview } from '../contexts/ProfilePreviewContext';

const ACTIVITY_STATUSES = [
  { key: 'online', label: 'En ligne', color: '#4ade80' },
  { key: 'busy', label: 'Occupé', color: '#f87171' },
  { key: 'away', label: 'Absent', color: '#facc15' },
  { key: 'invisible', label: 'Invisible', color: '#a3a3a3' },
  { key: 'dnd', label: 'Ne pas déranger', color: '#ef4444' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [displayName, setDisplayName] = React.useState<string>('Utilisateur');
  const [specialStatus, setSpecialStatus] = React.useState<string>('');
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [activityStatus, setActivityStatus] = React.useState<string>('online');
  const [showStatusMenu, setShowStatusMenu] = React.useState(false);
  const { userRefreshCount } = useUserUpdate();
  const { open: openProfilePreview } = useProfilePreview();
  const statusBoxRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        // Récupérer le prénom, le nom, le special_status et l'avatar
        const { data } = await supabase
          .from('users')
          .select('first_name, last_name, special_status, picture_url')
          .eq('email', user.email)
          .single();

        if (data && data.first_name && data.last_name) {
          setDisplayName(`${data.first_name} ${data.last_name}`);
        } else {
          setDisplayName('Loading...');
        }
        if (data && data.special_status) {
          setSpecialStatus(data.special_status);
        } else {
          setSpecialStatus('');
        }
        if (data && data.picture_url) {
          setAvatarUrl(data.picture_url);
        } else {
          setAvatarUrl(null);
        }
      }
    };
    fetchUser();
  }, [userRefreshCount]); // <-- Ajoute la dépendance ici

  React.useEffect(() => {
    const fetchStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        const { data } = await supabase
          .from('users')
          .select('status') // <-- corrige ici
          .eq('email', user.email)
          .single();
        if (data && data.status) { // <-- corrige ici
          setActivityStatus(data.status); // <-- corrige ici
        }
      }
    };
    fetchStatus();
  }, [userRefreshCount]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleStatusChange = async (status: string) => {
    setActivityStatus(status);
    setShowStatusMenu(false);
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      await supabase
        .from('users')
        .update({ status }) // <-- c'est déjà correct ici
        .eq('email', user.email);
    }
  };

  const currentStatus = ACTIVITY_STATUSES.find(s => s.key === activityStatus) || ACTIVITY_STATUSES[0];

  useEffect(() => {
    if (!showStatusMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusBoxRef.current &&
        !statusBoxRef.current.contains(event.target as Node)
      ) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStatusMenu]);

  return (
    <div className="sidebar-container">
      {/* Profil */}
      <div className="sidebar-profile">
        <div
          className="sidebar-avatar"
          ref={statusBoxRef}
          style={
            avatarUrl
              ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer' }
              : { cursor: 'pointer' }
          }
          onClick={openProfilePreview}
        >
          <span
            className="sidebar-status"
            style={{ background: currentStatus.color, cursor: 'pointer' }}
            onClick={e => { e.stopPropagation(); setShowStatusMenu(v => !v); }}
            title={currentStatus.label}
          />
          {showStatusMenu && (
            <div className="sidebar-status-menu">
              {ACTIVITY_STATUSES.map(status => (
                <div
                  key={status.key}
                  className={`sidebar-status-menu-item${activityStatus === status.key ? ' selected' : ''}`}
                  onClick={() => handleStatusChange(status.key)}
                >
                  <span
                    className="sidebar-status-dot"
                    style={{ background: status.color }}
                  />
                  <span style={{ fontSize: 14 }}>{status.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <Text size={14} bold>{displayName}</Text>
          <div
            style={{
              color:
                specialStatus?.toLowerCase() === 'fondateur projecta'
                  ? '#e11d48'
                  : specialStatus?.toLowerCase() === 'nouvel arrivant'
                    ? '#a259ff'
                    : specialStatus?.toLowerCase() === 'développeur projecta'
                      ? '#2563eb'
                      : '#757575',
              fontWeight: 600,
              fontSize: 14,
              textTransform: 'none',
            }}
          >
            {specialStatus
              ? specialStatus.charAt(0).toUpperCase() + specialStatus.slice(1).toLowerCase()
              : 'Nouvel arrivant'}
          </div>
        </div>
      </div>
      {/* Menu */}
      <div className="sidebar-menu">
        <div
          className={`sidebar-item${location.pathname === '/dashboard' ? ' active' : ''}`}
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <FaHome size={22} className="sidebar-icon" />
          <Text size={16} color={location.pathname === '/dashboard' ? "#3730A3" : "#757575"} bold={location.pathname === '/dashboard'}>DASHBOARD</Text>
        </div>
        <div
          className={`sidebar-item${location.pathname === '/projects' ? ' active' : ''}`}
          onClick={() => navigate('/projects')}
          style={{ cursor: 'pointer' }}
        >
          <FaFolderOpen size={22} className="sidebar-icon" />
          <Text size={16} color={location.pathname === '/projects' ? "#3730A3" : "#757575"}>PROJETS</Text>
        </div>
        <div
          className={`sidebar-item${location.pathname === '/community' ? ' active' : ''}`}
          onClick={() => navigate('/community')}
          style={{ marginBottom: 24, cursor: 'pointer' }}
        >
          <FaUsers size={22} className="sidebar-icon" />
          <Text size={16} color={location.pathname === '/community' ? "#3730A3" : "#757575"}>COMMUNAUTÉ</Text>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-link">
            <FaQuestionCircle size={20} className="sidebar-icon" />
            <Text size={16} color="#3730A3">AIDE</Text>
          </div>
          <div
            className={`sidebar-link${location.pathname === '/settings' ? ' active' : ''}`}
            onClick={() => navigate('/settings')}
          >
            <FaCog size={20} className="sidebar-icon" />
            <Text size={16} color="#3730A3">PARAMÈTRES</Text>
          </div>
          <div className="sidebar-logout" onClick={handleLogout}>
            <FaSignOutAlt size={22} className="sidebar-icon" />
            <Text size={16} color="#b91c1c" bold> DÉCONNEXION </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;