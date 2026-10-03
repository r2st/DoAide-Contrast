import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ContrastChecker from './pages/ContrastChecker'
import PaletteGenerator from './pages/PaletteGenerator'
import ColorBlindnessSimulator from './pages/ColorBlindnessSimulator'
import FontSizeCalculator from './pages/FontSizeCalculator'
import AccessibilityChecklist from './pages/AccessibilityChecklist'
import ScreenshotAnalyzer from './pages/ScreenshotAnalyzer'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ContrastChecker />} />
        <Route path="/palette" element={<PaletteGenerator />} />
        <Route path="/blindness" element={<ColorBlindnessSimulator />} />
        <Route path="/font-size" element={<FontSizeCalculator />} />
        <Route path="/checklist" element={<AccessibilityChecklist />} />
        <Route path="/screenshot" element={<ScreenshotAnalyzer />} />
      </Routes>
    </Layout>
  )
}
