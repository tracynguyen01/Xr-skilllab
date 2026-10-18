import { Route, Routes } from 'react-router-dom'
import { AboutPage } from '../pages/AboutPage'
import { HomePage } from '../pages/HomePage'
import { HowItWorksPage } from '../pages/HowItWorksPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProjectPage } from '../pages/ProjectPage'
import { ResultsPage } from '../pages/ResultsPage'
import { SimulationPage } from '../pages/SimulationPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/simulate" element={<SimulationPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/project" element={<ProjectPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
