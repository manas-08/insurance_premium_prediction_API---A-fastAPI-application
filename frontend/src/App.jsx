import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/landing'
import './App.css'
import InsurancePremiumPredictor from './components/form'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/predict" element={<InsurancePremiumPredictor />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
