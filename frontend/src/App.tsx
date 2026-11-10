import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import SubmitGrievance from './pages/SubmitGrievance'

export default function App() {
  return (
    <div className="min-h-screen bg-[#F8F8F3] text-[#202820]">
      <nav className="p-4 bg-white shadow">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-semibold text-[#174C3C]">Samadhan Setu</div>
          <div>
            <Link to="/" className="mr-4">Home</Link>
            <Link to="/submit" className="bg-[#3D8064] text-white px-3 py-1 rounded">Report a Grievance</Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<div>Welcome to Samadhan Setu. <Link to="/submit" className="text-[#174C3C]">Report a Grievance</Link></div>} />
          <Route path="/submit" element={<SubmitGrievance />} />
        </Routes>
      </main>
    </div>
  )
}
