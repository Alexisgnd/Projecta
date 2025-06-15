import React, { useRef, useEffect } from 'react';
import { FaHome, FaFolderOpen, FaSearch, FaPlug, FaUsers, FaQuestionCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import Text from './Text';
import './Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../supabaseClient';
import { useUserUpdate } from '../UserContext';
import { useProfilePreview } from '../contexts/ProfilePreviewContext';
import { USER_STATUSES, UserStatusDot } from "./UserStatus";

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
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

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
    // Met à jour le status en "offline" avant de déconnecter
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      await supabase
        .from('users')
        .update({ status: "offline" })
        .eq('email', user.email);
    }
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

  // Gestion de l'inactivité utilisateur
  useEffect(() => {
    let lastStatus = activityStatus;

    const setAway = async () => {
      if (lastStatus !== "away") {
        setActivityStatus("away");
        lastStatus = "away";
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          await supabase
            .from('users')
            .update({ status: "away" })
            .eq('email', user.email);
        }
      }
    };

    const setOnline = async () => {
      if (lastStatus !== "online") {
        setActivityStatus("online");
        lastStatus = "online";
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          await supabase
            .from('users')
            .update({ status: "online" })
            .eq('email', user.email);
        }
      }
    };

    const resetTimer = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(setAway, 180000); // 3 minutes
      setOnline();
    };

    // Événements d'activité
    const events = ["mousemove", "mousedown", "keydown", "touchstart"];
    events.forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    // Démarre le timer au montage
    resetTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );
    };
    // eslint-disable-next-line
  }, []);

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
          {/* Ajoute un span englobant la pastille pour gérer le clic */}
          <span
            style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 3 }}
            onClick={e => {
              e.stopPropagation();
              setShowStatusMenu(v => !v);
            }}
          >
            <UserStatusDot status={activityStatus} />
          </span>
          {showStatusMenu && (
            <div className="sidebar-status-menu">
              {USER_STATUSES.map(status => (
                <div
                  key={status.key}
                  className={`sidebar-status-menu-item${activityStatus === status.key ? ' selected' : ''}`}
                  onClick={e => {
                    e.stopPropagation();
                    handleStatusChange(status.key);
                  }}
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
        {/* Dashboard */}
        <div
          className={`sidebar-item${location.pathname === '/dashboard' ? ' active' : ''}`}
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer' }}
        >
          <FaHome size={22} className="sidebar-icon" />
          <Text size={16} color={location.pathname === '/dashboard' ? "#3730A3" : "#757575"} bold={location.pathname === '/dashboard'}>DASHBOARD</Text>
        </div>
        {/* Projets */}
        <div
          className={`sidebar-item${location.pathname === '/projects' ? ' active' : ''} disabled`}
          // onClick={() => navigate('/projects')}
          style={{ cursor: 'not-allowed', opacity: 0.5 }}
          title="Fonctionnalité désactivée"
        >
          <FaFolderOpen size={22} className="sidebar-icon" />
          <Text size={16} color="#757575">PROJETS</Text>
        </div>
        {/* Recherches / Rapports globaux (désactivé) */}
        <div
          className="sidebar-item disabled"
          style={{ cursor: 'not-allowed', opacity: 0.5 }}
          title="Fonctionnalité désactivée"
        >
          <FaSearch size={22} className="sidebar-icon" />
          <Text size={16} color="#757575">RECHERCHES</Text>
        </div>
        {/* Intégrations (désactivé) */}
        <div
          className="sidebar-item disabled"
          style={{ cursor: 'not-allowed', opacity: 0.5 }}
          title="Fonctionnalité désactivée"
        >
          <FaPlug size={22} className="sidebar-icon" />
          <Text size={16} color="#757575">INTÉGRATIONS</Text>
        </div>
        {/* Communauté (désactivé) */}
        <div
          className={`sidebar-item${location.pathname === '/community' ? ' active' : ''} disabled`}
          // onClick={() => navigate('/community')}
          style={{ marginBottom: 24, cursor: 'not-allowed', opacity: 0.5 }}
          title="Fonctionnalité désactivée"
        >
          <FaUsers size={22} className="sidebar-icon" />
          <Text size={16} color="#757575">COMMUNAUTÉ</Text>
        </div>
        <div className="sidebar-bottom">
          {/* ADMIN désactivé */}
          {/* <div
            className="sidebar-link disabled"
            style={{ cursor: 'not-allowed', opacity: 0.7, color: '#e11d48' }}
            title="Fonctionnalité réservée à l'administration"
          >
            <FaUsers size={20} className="sidebar-icon" style={{ color: '#e11d48' }} />
            <Text size={16} color="#e11d48">ADMIN</Text>
          </div> */}
          {/* Relations */}
          <div
            className={`sidebar-link${location.pathname === '/relations' ? ' active' : ''}`}
            onClick={() => navigate('/relations')}
            style={{
              cursor: 'pointer',
              opacity: 1,
              color: location.pathname === '/relations' ? '#3730A3' : undefined
            }}
            title="Voir vos relations"
          >
            <FaUsers size={20} className="sidebar-icon" />
            <Text size={16} color={location.pathname === '/relations' ? "#3730A3" : "#757575"}>RELATIONS</Text>
          </div>
          {/* AIDE désactivé */}
          <div
            className="sidebar-link disabled"
            style={{ cursor: 'not-allowed', opacity: 0.5 }}
            title="Fonctionnalité désactivée"
          >
            <FaQuestionCircle size={20} className="sidebar-icon" />
            <Text size={16} color="#757575">AIDE</Text>
          </div>
          {/* Paramètres */}
          <div className={`sidebar-link${location.pathname === '/settings' ? ' active' : ''}`} onClick={() => navigate('/settings')}>
            <FaCog size={20} className="sidebar-icon" />
            <Text size={16} color="#3730A3">PARAMÈTRES</Text>
          </div>
          {/* Déconnexion */}
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