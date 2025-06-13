import React from 'react';
import { FaHome, FaFolderOpen, FaUsers, FaQuestionCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import Text from './Text';
import './Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [displayName, setDisplayName] = React.useState<string>('Utilisateur');
  const [specialStatus, setSpecialStatus] = React.useState<string>(''); 

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        // Récupérer le prénom, le nom et le special_status depuis la table users
        const { data } = await supabase
          .from('users')
          .select('first_name, last_name, special_status')
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
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="sidebar-container">
      {/* Profil */}
      <div className="sidebar-profile">
        <div className="sidebar-avatar">
          <span className="sidebar-status" />
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