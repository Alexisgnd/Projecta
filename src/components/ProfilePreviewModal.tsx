import React, { useEffect, useState } from "react";
import { useProfilePreview } from "../contexts/ProfilePreviewContext";
import supabase from "../supabaseClient";
import Text from "./Text";

const ProfilePreviewModal: React.FC = () => {
  const { show, close } = useProfilePreview();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!show) return;
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();
      setUser(data);
    };
    fetchUser();
  }, [show]);

  if (!show || !user) return null;

  // Contraste dynamique
  function getContrastClass(hex: string) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'contrast-dark' : 'contrast-light';
  }
  const primaryColor = user.primary_color || "#5A321F";
  const accentColor = user.secondary_color || "#FF0017";
  const cardContrastClass = getContrastClass(primaryColor);
  const accentContrastClass = getContrastClass(accentColor);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.25)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={close}
    >
      <div
        style={{
          background: 'none',
          border: 'none',
          boxShadow: 'none',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className={`settings-card ${cardContrastClass}`}
          style={{
            ['--primary-color' as any]: primaryColor,
            ['--accent-color' as any]: accentColor,
            ['--primary-contrast' as any]: cardContrastClass === 'contrast-dark' ? '#111' : '#fff',
            ['--accent-contrast' as any]: accentContrastClass === 'contrast-dark' ? '#111' : '#fff',
          }}
        >
          <div
            className="settings-card-banner"
            style={
              user.banner_url
                ? { backgroundImage: `url(${user.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : {}
            }
          />
          <div
            className="settings-card-avatar"
            style={
              user.picture_url
                ? { backgroundImage: `url(${user.picture_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : {}
            }
          />
          <div className="settings-card-info">
            <Text size={22} bold className="settings-card-title">
              {user.first_name} {user.last_name}
            </Text>
            <div className="settings-card-mention">
              <Text size={15} bold>
                {user.special_status || 'Nouvel arrivant'}
              </Text>
            </div>
            <div className="settings-card-bio">
              <Text size={14} italic>
                {user.description || 'Aucune bio renseignée.'}
              </Text>
            </div>
            <div className="settings-card-email">
              <Text size={13}>
                {user.email}
              </Text>
            </div>
            <button className="settings-preview-btn" onClick={close}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreviewModal;