import React from 'react';
import { FaHome, FaFolderOpen, FaUsers, FaQuestionCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';
import Text from './Text';
import './Sidebar.css';

const Sidebar: React.FC = () => (
  <div className="sidebar-container">
    {/* Profil */}
    <div className="sidebar-profile">
      <div className="sidebar-avatar">
        <span className="sidebar-status" />
      </div>
      <div>
        <Text size={20} bold>UserName</Text>
        <div style={{ color: '#a259ff', fontWeight: 600, fontSize: 14 }}>NOUVEL ARRIVANT</div>
      </div>
    </div>
    {/* Menu */}
    <div className="sidebar-menu">
      <div className="sidebar-item active">
        <FaHome size={22} className="sidebar-icon" />
        <Text size={20} color="#3730A3" bold>DASHBOARD</Text>
      </div>
      <div className="sidebar-item">
        <FaFolderOpen size={22} className="sidebar-icon" />
        <Text size={20} color="#757575">PROJETS</Text>
      </div>
      <div className="sidebar-item" style={{ marginBottom: 24 }}>
        <FaUsers size={22} className="sidebar-icon" />
        <Text size={20} color="#757575">COMMUNAUTÉ</Text>
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-link">
          <FaQuestionCircle size={20} className="sidebar-icon" />
          <Text size={18} color="#3730A3">AIDE</Text>
        </div>
        <div className="sidebar-link">
          <FaCog size={20} className="sidebar-icon" />
          <Text size={18} color="#3730A3">PARAMÈTRES</Text>
        </div>
        <div className="sidebar-logout">
          <FaSignOutAlt size={22} className="sidebar-icon" />
          <Text size={20} color="#b91c1c" bold> DÉCONNEXION </Text>
        </div>
      </div>
    </div>
  </div>
);

export default Sidebar;