import './App.css'
import Button from './components/Button'
import Input from './components/Input'
import Text from './components/Text'

function App() {
  return (
    <div className="split-container">
      <div className="split-left">
        {/* Contenu de la partie gauche */}
        <Text size={32} bold color="primary">
          Connexion / Inscription
        </Text>
        <Text size={16} color="secondary">
          Veuillez renseigner votre email pour vous connecter ou vous inscrire.
        </Text>

        <div className="form">
          <Input
            header={'Adresse email'}>
          </Input>
        </div>

        <Button text="Valider" variant="primary" />

      </div>
      <div className="split-right">
        {/* Contenu de la partie droite */}
        <h2>Partie droite</h2>
      </div>
    </div>
  )
}

export default App