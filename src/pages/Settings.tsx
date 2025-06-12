import React from 'react';
import './Settings.css';
import Text from '../components/Text';

const Settings: React.FC = () => {
    return (
        <div className="settings-root">
            <div className="settings-container">
                <div className="settings-left">
                    {/* Titre principal */}
                    <Text size={32} bold color="primary" className="settings-main-title">
                        Paramètres
                    </Text>
                    {/* Titre Médias */}
                    <div className="settings-section-title">
                        <Text size={20} bold>Médias</Text>
                    </div>
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
                    {/* Titre Informations */}
                    <div className="settings-section-title">
                        <Text size={20} bold>Informations</Text>
                    </div>
                    {/* Formulaire */}
                    <form className="settings-form">
                        <div className="settings-row">
                            <Text size={14} bold>Prénom</Text>
                            <input type="text" value="Alexis" />
                            <Text size={14} bold>Nom</Text>
                            <input type="text" value="GONNEAUD" />
                        </div>
                        <div className="settings-row">
                            <Text size={14} bold>Adresse e-mail</Text>
                            <input type="email" value="alexis.gonneaud@hotmail.fr" />
                        </div>
                        <div className="settings-row">
                            <Text size={14} bold>Bio</Text>
                            <textarea />
                        </div>
                        <div className="settings-actions">
                            <button className="settings-btn primary" type="submit">Valider les changements</button>
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