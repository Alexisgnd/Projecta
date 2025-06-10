import './App.css'
import Button from './components/Button'
import Input from './components/Input'
import Text from './components/Text'
import usersData from '../users.json'

import { SetStateAction, useState } from 'react'

function App() {
  const [email, setEmail] = useState('')
  const [subtitle, setSubtitle] = useState('Veuillez renseigner votre email pour vous connecter ou vous inscrire.')
  const [buttonText, setButtonText] = useState('Vérifier')
  const [title, setTitle] = useState('Connexion / Inscription')
  const [mode, setMode] = useState<'initial' | 'login' | 'register'>('initial')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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

  const handleCheck = () => {
    const exists = usersData.users.some(user => user.email === email)
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

  const handleSubmit = () => {
    if (mode === 'login') {
      const user = usersData.users.find(user => user.email === email)
      if (user && user.password === password) {
        console.log('Connexion réussie pour', user.email)
      } else {
        console.log('Mot de passe incorrect pour', email)
      }
    } else if (mode === 'register') {
      const newUser = {
        id: usersData.users.length + 1,
        email,
        password,
        name: email.split('@')[0]
      }
      console.log('Nouvel utilisateur inscrit:', newUser)
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
          text={buttonText}
          variant="primary"
          onClick={handleSubmit}
          disabled={isButtonDisabled}
        />
      </div>
      <div className="split-right">
        <h2>Partie droite</h2>
      </div>
    </div>
  )
}

export default App