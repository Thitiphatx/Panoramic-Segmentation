import type React from 'react'
import { Route, Routes } from 'react-router'
import AppLayout from './layouts/AppLayout'
import HomePage from './pages/home/page'
import SequenceDetailPage from './pages/sequence/detail/page'
import NotFoundPage from './pages/not-found/page'

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<HomePage />} path="/" />
        <Route element={<SequenceDetailPage />} path="/sequences/:sequenceId" />
        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  )
}

export default App
