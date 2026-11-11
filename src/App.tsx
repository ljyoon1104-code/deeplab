import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { LessonPage } from './pages/LessonPage'
import { CourseSessionProvider } from './lessons/mnistIntegrated/CourseSession'

export default function App() {
  return (
    <CourseSessionProvider><Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/lesson/:lessonId" element={<LessonPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></CourseSessionProvider>
  )
}
