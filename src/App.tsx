import { BrowserRouter, Routes, Route } from 'react-router-dom'
import WelcomePage from './welcome/WelcomePage'
import SimulationPage from './simulation/SimulationPage'
import GamePage from './gamification/GamePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/gamification" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

