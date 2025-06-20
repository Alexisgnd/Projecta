import React, { useEffect, useState, useRef } from 'react';
import './Settings.css';
import Text from '../components/Elements/Text';
import supabase from '../supabaseClient';
import { useUserUpdate } from '../UserContext';
import Alert from '../components/Elements/Alert';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [mention, setMention] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#F3F4F6'); // Blanc grisé par défaut
  const [accentColor, setAccentColor] = useState('#BDBDBD'); // Gris plus foncé par défaut
  const { refreshUser } = useUserUpdate();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Ajoute cet état pour l'alerte
  const [alert, setAlert] = useState<{
    type: "error" | "success" | "info" | "warning";
    title: string;
    message: React.ReactNode;
    key?: string;
  } | null>(null);

  // Fonction utilitaire pour afficher une alerte
  function showAlert(type: "error" | "success" | "info" | "warning", title: string, message: React.ReactNode) {
    setAlert({ type, title, message, key: Date.now().toString() });
  }

  // Charger les infos utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();
      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setEmail(data.email || '');
        setBio(data.description || '');
        setMention(data.special_status || 'NOUVEL ARRIVANT');
        setAvatarUrl(data.picture_url || null);
        setBannerUrl(data.banner_url || null);
        setPrimaryColor(data.primary_color || '#F3F4F6'); // Blanc grisé par défaut
        setAccentColor(data.secondary_color || '#BDBDBD'); // Gris plus foncé par défaut
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Gérer l'upload de la photo de profil
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setAvatarPreview(URL.createObjectURL(file));
    showAlert("info", "Chargement...", "Envoi de la photo de profil en cours.");

    // Récupère l'utilisateur authentifié
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setAvatarPreview(null);
      setAvatarUploading(false);
      showAlert("error", "Erreur !", "Utilisateur non authentifié.");
      return;
    }

    // Récupère prénom et nom pour le nom du fichier
    const { data: userData } = await supabase
      .from('users')
      .select('first_name, last_name, picture_url')
      .eq('email', authUser.email)
      .single();

    const firstNameSanitized = (userData?.first_name || 'user').replace(/\s+/g, '-').toLowerCase();
    const lastNameSanitized = (userData?.last_name || 'user').replace(/\s+/g, '-').toLowerCase();
    const fileExt = file.name.split('.').pop();
    // Ajoute un timestamp pour garantir l'unicité du nom
    const uniqueSuffix = Date.now();
    const fileName = `${firstNameSanitized}-${lastNameSanitized}-profile-picture-${uniqueSuffix}.${fileExt}`;

    // Supprime l'ancienne image si elle existe
    if (userData?.picture_url) {
      const urlParts = userData.picture_url.split('/');
      const oldFileName = urlParts[urlParts.length - 1];
      await supabase.storage.from('avatars').remove([oldFileName]);
    }

    // Upload la nouvelle image
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false, // false car le nom est unique
        contentType: file.type,
      });
    if (uploadError) {
      setAvatarPreview(null);
      setAvatarUploading(false);
      showAlert("error", "Erreur !", "Échec de l'envoi de la photo de profil.");
      return;
    }

    // Récupère l'URL publique
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    setAvatarUrl(data.publicUrl);
    await supabase
      .from('users')
      .update({ picture_url: data.publicUrl })
      .eq('email', authUser.email);

    setAvatarPreview(null);
    setAvatarUploading(false);
    showAlert("success", "Succès !", "Photo de profil mise à jour.");
    refreshUser();
  };

  // Gérer l'upload de la bannière
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerUploading(true);
    setBannerPreview(URL.createObjectURL(file));
    showAlert("info", "Chargement...", "Envoi de la bannière en cours.");

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setBannerPreview(null);
      setBannerUploading(false);
      showAlert("error", "Erreur !", "Utilisateur non authentifié.");
      return;
    }

    const { data: userData } = await supabase
      .from('users')
      .select('first_name, last_name, banner_url')
      .eq('email', authUser.email)
      .single();

    const firstNameSanitized = (userData?.first_name || 'user').replace(/\s+/g, '-').toLowerCase();
    const lastNameSanitized = (userData?.last_name || 'user').replace(/\s+/g, '-').toLowerCase();
    const fileExt = file.name.split('.').pop();
    const uniqueSuffix = Date.now();
    const fileName = `${firstNameSanitized}-${lastNameSanitized}-profile-banner-${uniqueSuffix}.${fileExt}`;

    // Supprime l'ancienne bannière si elle existe
    if (userData?.banner_url) {
      const urlParts = userData.banner_url.split('/');
      const oldFileName = urlParts[urlParts.length - 1];
      await supabase.storage.from('banners').remove([oldFileName]);
    }

    // Upload la nouvelle bannière
    const { error: uploadError } = await supabase.storage
      .from('banners')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });
    if (uploadError) {
      setBannerPreview(null);
      setBannerUploading(false);
      showAlert("error", "Erreur !", "Échec de l'envoi de la bannière.");
      return;
    }

    const { data } = supabase.storage.from('banners').getPublicUrl(fileName);
    setBannerUrl(data.publicUrl);
    await supabase
      .from('users')
      .update({ banner_url: data.publicUrl })
      .eq('email', authUser.email);

    setBannerPreview(null);
    setBannerUploading(false);
    showAlert("success", "Succès !", "Bannière mise à jour.");
    refreshUser();
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    showAlert("info", "Sauvegarde...", "Enregistrement des modifications en cours.");
    const updates: any = {
      first_name: firstName,
      last_name: lastName,
      description: bio,
      special_status: mention,
      primary_color: primaryColor,
      secondary_color: accentColor,
    };
    if (avatarUrl) updates.picture_url = avatarUrl;
    if (bannerUrl) updates.banner_url = bannerUrl;
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('email', email);
    setUpdating(false);
    if (error) {
      showAlert("error", "Erreur !", "Erreur lors de la sauvegarde des modifications.");
    } else {
      showAlert("success", "Succès !", "Modifications sauvegardées.");
    }
  };

  // Ajoute cette fonction pour la suppression de l'avatar
  const handleAvatarDelete = async () => {
    if (!avatarUrl) return;
    setAvatarUploading(true);
    showAlert("info", "Suppression...", "Suppression de la photo de profil en cours.");

    // Extraire le nom du fichier depuis l'URL publique
    const urlParts = avatarUrl.split('/');
    const oldFileName = urlParts[urlParts.length - 1];

    // Supprimer le fichier du bucket
    await supabase.storage.from('avatars').remove([oldFileName]);

    // Mettre à jour la table users (picture_url à null)
    await supabase
      .from('users')
      .update({ picture_url: null })
      .eq('email', email);

    setAvatarUrl(null);
    setAvatarPreview(null);
    setAvatarUploading(false);
    showAlert("success", "Succès !", "Photo de profil supprimée.");
    refreshUser();
  };

  // Suppression de la bannière
  const handleBannerDelete = async () => {
    if (!bannerUrl) return;
    setBannerUploading(true);
    showAlert("info", "Suppression...", "Suppression de la bannière en cours.");

    // Extraire le nom du fichier depuis l'URL publique
    const urlParts = bannerUrl.split('/');
    const oldFileName = urlParts[urlParts.length - 1];

    // Supprimer le fichier du bucket
    await supabase.storage.from('banners').remove([oldFileName]);

    // Mettre à jour la table users (banner_url à null)
    await supabase
      .from('users')
      .update({ banner_url: null })
      .eq('email', email);

    setBannerUrl(null);
    setBannerPreview(null);
    setBannerUploading(false);
    showAlert("success", "Succès !", "Bannière supprimée.");
    refreshUser();
  };

  // Fonction pour obtenir la classe de contraste
  function getContrastClass(hex: string) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'contrast-dark' : 'contrast-light';
  }

  const cardContrastClass = getContrastClass(primaryColor);
  const accentContrastClass = getContrastClass(accentColor);

  if (loading) {
    return <Text size={18} color="secondary">Chargement...</Text>;
  }

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
            <div
              className="settings-avatar"
              style={
                avatarPreview
                  ? { backgroundImage: `url(${avatarPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : avatarUrl
                    ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : {}
              }
            />
            <button
              className="settings-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading || !!avatarPreview} // <-- désactive si upload ou preview
            >
              Mettre à jour
            </button>
            <button
              className="settings-btn delete"
              type="button"
              disabled={!avatarUrl || updating || avatarUploading}
              onClick={handleAvatarDelete}
            >
              🗑️ Effacer
            </button>
            <input
              type="file"
              accept="image/png, image/jpeg, image/gif"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleAvatarChange}
            />
          </div>
          {/* Bannière */}
          <div className="settings-avatar-section">
            <div
              className="settings-banner"
              style={
                bannerPreview
                  ? { backgroundImage: `url(${bannerPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : bannerUrl
                    ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : {}
              }
            />
            <button
              className="settings-btn"
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={bannerUploading || !!bannerPreview}
            >
              Mettre à jour
            </button>
            <button
              className="settings-btn delete"
              type="button"
              disabled={!bannerUrl || updating || bannerUploading}
              onClick={handleBannerDelete}
            >
              🗑️ Effacer
            </button>
            <input
              type="file"
              accept="image/png, image/jpeg, image/gif"
              style={{ display: 'none' }}
              ref={bannerInputRef}
              onChange={handleBannerChange}
            />
          </div>
          {/* Titre Informations */}
          <div className="settings-section-title">
            <Text size={20} bold>Informations</Text>
          </div>
          {/* Formulaire */}
          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="settings-row">
              <span className="settings-label"><Text size={14} bold>Prénom</Text></span>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className="settings-row">
              <span className="settings-label"><Text size={14} bold>Nom</Text></span>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            <div className="settings-row">
              <span className="settings-label"><Text size={14} bold>Adresse e-mail</Text></span>
              <input type="email" value={email} disabled />
            </div>
            <div className="settings-row">
              <span className="settings-label"><Text size={14} bold>Mention</Text></span>
              <input
                type="text"
                value={mention}
                disabled
              />
            </div>
            <div className="settings-row">
              <span className="settings-label"><Text size={14} bold>Bio</Text></span>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={200} // Limite la saisie à 200 caractères
              />
            </div>
            <div className="settings-row">
              <span className="settings-label"><Text size={14} bold>Couleur primaire</Text></span>
              <div className="color-picker-group">
                <input
                  type="color"
                  className="color-input"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  style={{ width: 48, height: 48, borderRadius: 10, border: '2px solid #eee', padding: 0 }}
                />
                <span className="color-hex">{primaryColor}</span>
              </div>
            </div>
            <div className="settings-row">
              <span className="settings-label"><Text size={14} bold>Accentuation</Text></span>
              <div className="color-picker-group">
                <input
                  type="color"
                  className="color-input"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  style={{ width: 48, height: 48, borderRadius: 10, border: '2px solid #eee', padding: 0 }}
                />
                <span className="color-hex">{accentColor}</span>
              </div>
            </div>
            <div className="settings-actions">
              <button className="settings-btn primary" type="submit" disabled={updating}>
                {updating ? 'Mise à jour en cours...' : 'Valider les changements'}
              </button>
            </div>
          </form>
        </div>
        <div className="settings-right">
          <div
            className={`settings-card ${cardContrastClass}`}
            style={{
              // On injecte UNIQUEMENT les variables CSS ici
              ['--primary-color' as any]: primaryColor,
              ['--accent-color' as any]: accentColor,
              ['--primary-contrast' as any]: cardContrastClass === 'contrast-dark' ? '#111' : '#fff',
              ['--accent-contrast' as any]: accentContrastClass === 'contrast-dark' ? '#111' : '#fff',
            }}
          >
            <div
              className="settings-card-banner"
              style={
                bannerPreview
                  ? { backgroundImage: `url(${bannerPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : bannerUrl
                    ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : {}
              }
            />
            <div
              className="settings-card-avatar"
              style={
                avatarPreview
                  ? { backgroundImage: `url(${avatarPreview})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : avatarUrl
                    ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : {}
              }
            />
            <div className="settings-card-info">
              <Text size={22} bold className="settings-card-title">
                {firstName} {lastName}
              </Text>
              <div className="settings-card-mention">
                <Text size={15} bold>
                  {mention || 'Nouvel arrivant'}
                </Text>
              </div>
              <div className="settings-card-bio">
                <Text size={14} italic>
                  {bio || 'Aucune bio renseignée.'}
                </Text>
              </div>
              <div className="settings-card-email">
                <Text size={13}>
                  {email}
                </Text>
              </div>
              <button className="settings-preview-btn">
                Bouton Exemple
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Affichage de l'alerte flottante */}
      {alert && (
        <Alert
          key={alert.key}
          type={alert.type}
          title={alert.title}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}
    </div>
  );
};

export default Settings;