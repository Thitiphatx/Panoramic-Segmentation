import type React from 'react'
import { Link } from 'react-router'

const NotFoundPage: React.FC = () => (
  <main className="grid min-h-screen place-content-center bg-[#f5f7fb] px-5 text-center">
    <h1 className="text-xl font-semibold text-slate-800">Page not found</h1>
    <Link className="mt-3 cursor-pointer text-sm font-medium text-cyan-700 hover:text-cyan-800" to="/">Return to home</Link>
  </main>
)

export default NotFoundPage
