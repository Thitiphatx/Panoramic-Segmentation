import type React from 'react'
import { Route, Routes } from 'react-router'
import HomePage from './pages/home/page'
import SequenceDetailPage from './pages/sequence/detail/page'
import NotFoundPage from './pages/not-found/page'

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<SequenceDetailPage />} path="/sequences/:sequenceId" />
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  )
}

export default App
