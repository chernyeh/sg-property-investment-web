import { useEffect, useState } from 'react'
import { getProperties, Property } from '../lib/supabase'
import { X } from 'lucide-react'

export default function ProjectComparison() {
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProperties()
  }, [])

  async function loadProperties() {
    try {
      setLoading(true)
      const data = await getProperties()
      setAllProperties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  function toggleProperty(id: string) {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(prevId => prevId !== id)
      } else if (prev.length < 5) {
        return [...prev, id]
      }
      return prev
    })
  }

  const selectedProperties = allProperties.filter(p => selectedIds.includes(p.id))
  const filteredProperties = allProperties.filter(p =>
    p.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading properties...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-semibold">Error loading properties</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selected Properties - Side by Side */}
      {selectedProperties.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Selected Properties ({selectedIds.length}/5)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {selectedProperties.map(prop => (
              <div key={prop.id} className="border border-blue-300 rounded-lg p-3 bg-blue-50 relative">
                <button
                  onClick={() => toggleProperty(prop.id)}
                  className="absolute top-2 right-2 p-1 hover:bg-red-200 rounded"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
                <p className="font-bold text-sm text-gray-900 mb-2">{prop.project_name}</p>
                <div className="text-xs space-y-1 text-gray-700">
                  <p><span className="font-semibold">D{prop.district}</span></p>
                  <p><span className="font-semibold">${(prop.recent_price/1000000).toFixed(2)}M</span></p>
                  <p>${(prop.recent_price/prop.size_sqft).toFixed(0)}/sqft</p>
                  <p className="text-gray-600">{prop.size_sqft} sqft</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Property List */}
      <div className="card">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <p className="text-sm text-gray-600 mb-3">Select up to 5 properties ({selectedIds.length}/5)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {filteredProperties.map(property => (
            <label key={property.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded hover:bg-blue-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selectedIds.includes(property.id)}
                onChange={() => toggleProperty(property.id)}
                disabled={!selectedIds.includes(property.id) && selectedIds.length >= 5}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{property.project_name}</p>
                <p className="text-xs text-gray-600">D{property.district} • ${(property.recent_price / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-gray-500">{property.property_type}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Detailed Comparison */}
      {selectedProperties.length > 1 && (
        <div className="card overflow-x-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Detailed Comparison</h2>
          
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-700 w-32">Project</td>
                {selectedProperties.map(p => (
                  <td key={p.id} className="py-2 px-3 font-semibold text-gray-900">{p.project_name}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-700">Price</td>
                {selectedProperties.map(p => (
                  <td key={p.id} className="py-2 px-3 text-right text-gray-900">${(p.recent_price/1000000).toFixed(2)}M</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-700">Size (sqft)</td>
                {selectedProperties.map(p => (
                  <td key={p.id} className="py-2 px-3 text-right text-gray-700">{p.size_sqft.toLocaleString()}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-700">Price/Sqft</td>
                {selectedProperties.map(p => (
                  <td key={p.id} className="py-2 px-3 text-right text-gray-900 font-semibold">${(p.recent_price/p.size_sqft).toFixed(0)}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-700">District</td>
                {selectedProperties.map(p => (
                  <td key={p.id} className="py-2 px-3 text-center text-gray-700">D{p.district}</td>
                ))}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-700">Type</td>
                {selectedProperties.map(p => (
                  <td key={p.id} className="py-2 px-3 text-gray-700">{p.property_type}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-700">Tenure</td>
                {selectedProperties.map(p => (
                  <td key={p.id} className="py-2 px-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      p.tenure === 'Freehold'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {p.tenure}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {selectedProperties.length === 0 && (
        <div className="card text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300">
          <p className="text-gray-600">Select properties above to see detailed comparison</p>
        </div>
      )}
    </div>
  )
}
