import './App.css'
import Button from './components/Button'
import Input from './components/Input'
import Text from './components/Text'
import { createClient } from '@supabase/supabase-js'
import { SetStateAction, useState } from 'react'

// Création du client Supabase avec les variables d'environnement
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

function App() {
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
        console.log('Connexion réussie pour', email)
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
        console.log('Nouvel utilisateur inscrit:', email)
      }
    } else {
      handleCheck()
    }
  }

  // Affichage du formulaire selon le mode
  return (
    <div className="split-container">
      <div className="split-left">
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
        <h2>Partie droite</h2>
      </div>
    </div>
  )
}

export default App