import React from 'react';
import './Dashboard.css';
import Text from '../components/Elements/Text';

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard-root">
            <div className="dashboard-container">
                <Text size={32} bold color="primary">
                    Dashboard
                </Text>
            </div>
        </div>
    );
}

export default Dashboard;