import React from 'react';
import './Dashboard.css';
import Text from '../components/Text';

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard-container">
            <Text size={32} bold color="primary">
                Bienvenue sur votre Dashboard !
            </Text>
            <Text size={18} color="secondary">
                Vous êtes connecté. Voici votre espace personnel.
            </Text>
        </div>
    );
};

export default Dashboard;