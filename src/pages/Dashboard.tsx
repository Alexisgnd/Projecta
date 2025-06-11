import React from 'react';
import './Dashboard.css';
import Text from '../components/Text';
import Sidebar from '../components/Sidebar';

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard-root">
            <Sidebar />
            <div className="dashboard-container">
                <Text size={32} bold color="primary">
                    Bienvenue sur votre Dashboard !
                </Text>
                <Text size={18} color="secondary">
                    Vous êtes connecté. Voici votre espace personnel.
                </Text>
            </div>
        </div>
    );
};

export default Dashboard;