import './App.css'
import Button from './components/Button'
import Input from './components/Input'
import Text from './components/Text'
import { createClient } from '@supabase/supabase-js'
import { SetStateAction, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import packageJson from '../package.json';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Ajout de l'import
import Settings from './pages/Settings'

// Création du client Supabase avec les variables d'environnement
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

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

  // Vérifie si l'utilisateur existe et adapte le mode (connexion ou inscription)
  const handleCheck = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle()
    setLoading(false)
    if (error) {
      setError("Erreur lors de la vérification de l'email")
      return
    }
    if (data) {
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
        navigate('/dashboard');
      } else {
        setError('Mot de passe incorrect ou utilisateur inexistant')
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
          last_name: lastName
        }])
      setLoading(false)
      if (insertError) {
        setError("Erreur lors de l'ajout dans la base")
      } else {
        navigate('/dashboard');
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

          {error && <Text size={14} color="danger">{error}</Text>}

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

// Remplace l'export principal :
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;