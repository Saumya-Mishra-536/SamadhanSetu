import React, { useState } from 'react'
import axios from 'axios'

export default function SubmitGrievance() {
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [result, setResult] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('/api/v1/grievances', { description, location })
      setResult(res.data)
    } catch (err: any) {
      console.error(err)
      setResult({ error: err?.message || 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold text-[#174C3C] mb-4">Report a Grievance</h1>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Describe the problem</label>
        <textarea className="w-full border p-2 mb-4" value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />

        <label className="block mb-2">Location (state, district)</label>
        <input className="w-full border p-2 mb-4" value={location} onChange={(e) => setLocation(e.target.value)} />

        <button type="submit" className="bg-[#3D8064] text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {result && (
        <div className="mt-4">
          <h2 className="font-semibold">Result</h2>
          <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
