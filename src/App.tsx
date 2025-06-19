import './App.css'
import Button from './components/Buttons/Button'
import Input from './components/Elements/Input'
import Text from './components/Elements/Text'
import supabase from './supabaseClient';
import { SetStateAction, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import packageJson from '../package.json';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Settings from './pages/Settings'
import Sidebar from './components/Elements/Sidebar';
import { UserUpdateProvider } from './UserContext';
import Alert from './components/Elements/Alert';
import { ProfilePreviewProvider } from './contexts/ProfilePreviewContext';
import ProfilePreviewModal from './components/Modals/ProfilePreviewModal';
import Relations from './pages/Relations';
import Projects from './pages/Projects';

function AuthPage() {
  // États pour les champs du formulaire et l'interface
  const [email, setEmail] = useState('')
  const [subtitle, setSubtitle] = useState('Veuillez renseigner votre email pour vous connecter ou vous inscrire.')
  const [buttonText, setButtonText] = useState('Vérifier')
  const [title, setTitle] = useState('Connexion / Inscription')
  const [mode, setMode] = useState<'initial' | 'login' | 'register'>('initial')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  // Ajoute une clé pour forcer le remount de l'alerte
  const [alertKey, setAlertKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false)
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupère la dernière version disponible (Status = 'Available') depuis la table app_version
    const fetchLatestVersion = async () => {
      const { data, error } = await supabase
        .from('app_version')
        .select('version')
        .eq('Status', 'Available')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data && data.version) {
        setLatestVersion(data.version);
      }
    };
    fetchLatestVersion();
  }, []);

  // Vérifie si l'email est valide
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  // Détermine si le bouton doit être désactivé selon le mode et les champs
  const isButtonDisabled =
    !email ||
    !isValidEmail(email) ||
    (mode === 'login' && !password) ||
    (mode === 'register' && (
      !firstName ||
      !lastName ||
      !password ||
      !confirmPassword ||
      password !== confirmPassword
    ))

  // Vérifie si l'email est déjà utilisé
  const checkEmailExists = async (email: string) => {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    return data !== null;
  };

  // Vérifie si l'utilisateur existe et adapte le mode (connexion ou inscription)
  const handleCheck = async () => {
    setLoading(true)
    setError(null)
    const exists = await checkEmailExists(email)
    setLoading(false)
    if (exists) {
      setButtonText('Connexion')
      setSubtitle('Bienvenue ! Nous sommes ravis de vous revoir !')
      setTitle('Connexion')
      setMode('login')
    } else {
      setButtonText('Inscription')
      setSubtitle('Bienvenue ! Veuillez remplir les informations pour vous inscrire.')
      setTitle('Inscription')
      setMode('register')
    }
  }

  // Gère la soumission du formulaire selon le mode (connexion ou inscription)
  const handleSubmit = async () => {
    setError(null)
    if (mode === 'login') {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (!error) {
        // Met à jour le status en "online" après connexion
        await supabase
          .from('users')
          .update({ status: "online" })
          .eq('email', email);
        navigate('/projects'); // <-- redirection vers projets
      } else {
        setError('Mot de passe incorrect')
        setAlertKey(Date.now().toString());
      }
    } else if (mode === 'register') {
      setLoading(true)
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: `${firstName} ${lastName}`,
            first_name: firstName,
            last_name: lastName
          }
        }
      })
      if (signUpError) {
        setLoading(false)
        setError("Erreur lors de l'inscription")
        return
      }
      // Ajoute l'utilisateur dans la table users
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          email,
          first_name: firstName,
          last_name: lastName,
          status: "online", // Ajout du status par défaut
          primary_color: "#F3F4F6", // Blanc grisé
          secondary_color: "#BDBDBD" // Gris plus foncé
        }])
      setLoading(false)
      if (insertError) {
        setError("Erreur lors de l'ajout dans la base")
      } else {
        navigate('/projects'); // <-- redirection vers projets
      }
    } else {
      handleCheck()
    }
  }

  // Récupère la version depuis le package.json
  const version = packageJson.version;
  const isUpToDate = !!latestVersion && version === latestVersion;

  return (
    <div className="app-root">
      {/* Affichage de la version en haut à gauche, hors du container */}
      <div className="version-indicator">
        <span>v{version}</span>
        {latestVersion && isUpToDate && (
          <FaCheckCircle className="icon-check" title="À jour" />
        )}
        {latestVersion && !isUpToDate && (
          <FaTimesCircle className="icon-cross" title="Nouvelle version disponible" />
        )}
      </div>
      {/* Affiche la nouvelle version en dessous si non à jour */}
      {latestVersion && !isUpToDate && (
        <div className="version-warning">
          Nouvelle version disponible : <b>v{latestVersion}</b>
        </div>
      )}
      <div className="split-container">
        <div className="split-left">
          {/* On retire l'affichage de la version ici */}
          <Text size={32} bold color="primary">
            {title}
          </Text>
          <Text size={16} color="secondary">
            {subtitle}
          </Text>

          <div className="form">
            <Input
              header={'Adresse email'}
              value={email}
              onChange={(e: { target: { value: SetStateAction<string> } }) => setEmail(e.target.value)}
              disabled={mode !== 'initial'}
            />
            {mode === 'register' && (
              <>
                <div className="form-row">
                  <Input
                    header={'Prénom'}
                    value={firstName}
                    onChange={(e: { target: { value: SetStateAction<string> } }) => setFirstName(e.target.value)}
                  />
                  <Input
                    header={'Nom'}
                    value={lastName}
                    onChange={(e: { target: { value: SetStateAction<string> } }) => setLastName(e.target.value)}
                  />
                </div>
                <Input
                  header={'Définir un mot de passe'}
                  type="password"
                  value={password}
                  onChange={(e: { target: { value: SetStateAction<string> } }) => setPassword(e.target.value)}
                />
                <Input
                  header={'Confirmer le mot de passe'}
                  type="password"
                  value={confirmPassword}
                  onChange={(e: { target: { value: SetStateAction<string> } }) => setConfirmPassword(e.target.value)}
                />
              </>
            )}
            {mode === 'login' && (
              <Input
                header={'Mot de passe'}
                type="password"
                value={password}
                onChange={(e: { target: { value: SetStateAction<string> } }) => setPassword(e.target.value)}
              />
            )}
          </div>

          {/* Remplace ceci :
          {error && <Text size={14} color="danger">{error}</Text>}
          */}
          {error && (
            <Alert
              key={alertKey}
              type="error"
              title="Erreur de connexion"
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <Button
            text={loading ? 'Chargement...' : buttonText}
            variant="primary"
            onClick={handleSubmit}
            disabled={isButtonDisabled || loading}
          />
        </div>
        <div className="split-right">
          {/* <h2>Partie droite</h2> */}
        </div>
      </div>
    </div>
  )
}

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

// Remplace l'export principal :
function App() {
  return (
    <BrowserRouter>
      <UserUpdateProvider>
        <ProfilePreviewProvider>
          <ProfilePreviewModal />
          <Routes>
            <Route
              path="/"
              element={
                <div className="app-root">
                  {/* AuthPage sans sidebar */}
                  <AuthPage />
                </div>
              }
            />
            <Route
              path="/dashboard"
              element={
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <MainLayout>
                  <Settings />
                </MainLayout>
              }
            />
            <Route
              path="/relations"
              element={
                <MainLayout>
                  <Relations />
                </MainLayout>
              }
            />
            <Route
              path="/projects"
              element={
                <MainLayout>
                  <Projects />
                </MainLayout>
              }
            />
            {/* Ajoute d'autres routes ici si besoin */}
          </Routes>
        </ProfilePreviewProvider>
      </UserUpdateProvider>
    </BrowserRouter>
  );
}

export default App;