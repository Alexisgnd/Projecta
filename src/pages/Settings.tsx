import React from 'react';
import './Settings.css';
import Text from '../components/Text';

const Settings: React.FC = () => {
    return (
        <div className="settings-root">
            <div className="settings-container">
                <div className="settings-left">
                    {/* Avatar et boutons */}
                    <div className="settings-avatar-section">
                        <div className="settings-avatar" />
                        <button className="settings-btn" disabled>Mettre à jour</button>
                        <button className="settings-btn delete" disabled>🗑️ Effacer</button>
                    </div>
                    <div className="settings-avatar-section">
                        <div className="settings-banner" />
                        <button className="settings-btn" disabled>Mettre à jour</button>
                        <button className="settings-btn delete" disabled>🗑️ Effacer</button>
                    </div>
                    {/* Formulaire */}
                    <form className="settings-form">
                        <div className="settings-row">
                            <Text size={14} bold>Prénom *</Text>
                            <input type="text" value="Alexis" />
                            <Text size={14} bold>Nom *</Text>
                            <input type="text" value="GONNEAUD" />
                        </div>
                        <Text size={14} bold>Mention</Text>
                        <input type="text" value="NOUVEL ARRIVANT" />
                        <Text size={14} bold>Bio</Text>
                        <textarea />
                        <Text size={14} bold>Adresse e-mail *</Text>
                        <input type="email" value="alexis.gonneaud@hotmail.fr" />
                        <div className="settings-actions">
                            <button className="settings-btn primary" type="submit">Valider les changements</button>
                            <button className="settings-btn" type="button">Annuler</button>
                        </div>
                    </form>
                </div>
                <div className="settings-right">
                    <div className="settings-card">
                        <div className="settings-card-avatar" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;