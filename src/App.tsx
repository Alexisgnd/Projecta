import './App.css'
import Button from './components/Button'
import Input from './components/Input'
import Text from './components/Text'
import { createClient } from '@supabase/supabase-js'
import { SetStateAction, useState } from 'react'

// Initialisation de Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

function App() {
  const [email, setEmail] = useState('')
  const [subtitle, setSubtitle] = useState('Veuillez renseigner votre email pour vous connecter ou vous inscrire.')
  const [buttonText, setButtonText] = useState('Vérifier')
  const [title, setTitle] = useState('Connexion / Inscription')
  const [mode, setMode] = useState<'initial' | 'login' | 'register'>('initial')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Validation de l'email
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const isButtonDisabled =
    !email ||
    !isValidEmail(email) ||
    (mode === 'login' && !password) ||
    (mode === 'register' && (
      !password ||
      !confirmPassword ||
      password !== confirmPassword
    ))

  const handleCheck = async () => {
    setLoading(true)
    setError(null)
    // Vérifie si l'utilisateur existe dans Supabase
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

  const handleSubmit = async () => {
    setError(null)
    if (mode === 'login') {
      setLoading(true)
      // Connexion via Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (!error) {
        console.log('Connexion réussie pour', email)
      } else {
        setError('Mot de passe incorrect ou utilisateur inexistant')
      }
    } else if (mode === 'register') {
      setLoading(true)
      // Inscription via Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        setLoading(false)
        setError("Erreur lors de l'inscription")
        return
      }
      // Ajout dans la table users
      const { error: insertError } = await supabase
        .from('users')
        .insert([{ email, password, name: email.split('@')[0] }])
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

  return (
    <div className="split-container">
      <div className="split-left">
        <Text size={32} bold color="primary">
          {title}
        </Text>
        <Text size={16} color="secondary">
          {subtitle}
        </Text>
        {error && <Text size={14} color="danger">{error}</Text>}
        <div className="form">
          <Input
            header={'Adresse email'}
            value={email}
            onChange={(e: { target: { value: SetStateAction<string> } }) => setEmail(e.target.value)}
            disabled={mode !== 'initial'}
          />
          {mode === 'login' && (
            <Input
              header={'Mot de passe'}
              type="password"
              value={password}
              onChange={(e: { target: { value: SetStateAction<string> } }) => setPassword(e.target.value)}
            />
          )}
          {mode === 'register' && (
            <>
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
        </div>
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