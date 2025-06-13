import React, { useEffect, useState, useRef } from 'react';
import './Settings.css';
import Text from '../components/Text';
import supabase from '../supabaseClient';
import { useUserUpdate } from '../UserContext';

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
  const { refreshUser } = useUserUpdate();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // Récupère l'utilisateur authentifié
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setAvatarPreview(null);
      setAvatarUploading(false);
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
      return;
    }

    // Récupère l'URL publique
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    setAvatarUrl(data.publicUrl);

    // Mets à jour la table users avec la nouvelle URL
    await supabase
      .from('users')
      .update({ picture_url: data.publicUrl })
      .eq('email', authUser.email);

    setAvatarPreview(null);
    setAvatarUploading(false);
    refreshUser(); // Notifie la sidebar
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const updates: any = {
      first_name: firstName,
      last_name: lastName,
      description: bio,
      special_status: mention,
    };
    if (avatarUrl) updates.picture_url = avatarUrl;
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('email', email);
    setUpdating(false);
    if (error) {
      console.log('Erreur lors de la mise à jour:', error);
    } else {
      console.log('Mise à jour réussie');
    }
  };

  // Ajoute cette fonction pour la suppression de l'avatar
  const handleAvatarDelete = async () => {
    if (!avatarUrl) return;
    setAvatarUploading(true);

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
    refreshUser(); // Notifie la sidebar
  };

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
          {/* Bannière désactivée */}
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
          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="settings-row">
              <Text size={14} bold>Prénom</Text>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <Text size={14} bold>Nom</Text>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            <div className="settings-row">
              <Text size={14} bold>Adresse e-mail</Text>
              <input type="email" value={email} disabled />
            </div>
            <div className="settings-row">
              <Text size={14} bold>Mention</Text>
              <input type="text" value={mention} onChange={e => setMention(e.target.value)} />
            </div>
            <div className="settings-row">
              <Text size={14} bold>Bio</Text>
              <textarea value={bio} onChange={e => setBio(e.target.value)} />
            </div>
            <div className="settings-actions">
              <button className="settings-btn primary" type="submit" disabled={updating}>
                {updating ? 'Mise à jour en cours...' : 'Valider les changements'}
              </button>
            </div>
          </form>
        </div>
        <div className="settings-right">
          <div className="settings-card">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;