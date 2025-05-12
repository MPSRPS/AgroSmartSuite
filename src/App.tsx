import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CropRecommendation from './pages/CropRecommendation'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CropRecommendation />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
