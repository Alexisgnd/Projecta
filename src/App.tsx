import './App.css'
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
      </div>
      <div className="split-right">
        {/* Contenu de la partie droite */}
        <h2>Partie droite</h2>
      </div>
    </div>
  )
}

export default App