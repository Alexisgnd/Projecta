import React from 'react';
import { FaHome, FaFolderOpen, FaUsers, FaQuestionCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import Text from './Text';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = React.useState<string>('Utilisateur');

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        // Récupérer le prénom et le nom depuis la table users
        const { data } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('email', user.email)
          .single();

        if (data && data.first_name && data.last_name) {
          setDisplayName(`${data.first_name} ${data.last_name}`);
        } else {
          setDisplayName('Loading...');
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
          <div style={{ color: '#a259ff', fontWeight: 600, fontSize: 14 }}>NOUVEL ARRIVANT</div>
        </div>
      </div>
      {/* Menu */}
      <div className="sidebar-menu">
        <div className="sidebar-item active">
          <FaHome size={22} className="sidebar-icon" />
          <Text size={16} color="#3730A3" bold>DASHBOARD</Text>
        </div>
        <div className="sidebar-item">
          <FaFolderOpen size={22} className="sidebar-icon" />
          <Text size={16} color="#757575">PROJETS</Text>
        </div>
        <div className="sidebar-item" style={{ marginBottom: 24 }}>
          <FaUsers size={22} className="sidebar-icon" />
          <Text size={16} color="#757575">COMMUNAUTÉ</Text>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-link">
            <FaQuestionCircle size={20} className="sidebar-icon" />
            <Text size={16} color="#3730A3">AIDE</Text>
          </div>
          <div className="sidebar-link">
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