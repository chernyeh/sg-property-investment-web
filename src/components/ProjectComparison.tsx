import { useEffect, useState } from 'react'
import { getProperties, Property } from '../lib/supabase'

export default function ProjectComparison() {
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      <div className="card">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Select Properties to Compare</h2>
        <p className="text-gray-600 text-sm mb-4">Select up to 5 properties ({selectedIds.length}/5)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allProperties.map(property => (
            <label key={property.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selectedIds.includes(property.id)}
                onChange={() => toggleProperty(property.id)}
                disabled={!selectedIds.includes(property.id) && selectedIds.length >= 5}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{property.project_name}</p>
                <p className="text-sm text-gray-600">D{property.district} • ${(property.recent_price / 1000000).toFixed(1)}M • {property.property_type}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {selectedProperties.length > 0 && (
        <div className="card overflow-x-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Comparison Analysis</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-700 w-32">Project</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="py-2 px-3 font-semibold text-gray-900">{p.project_name}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-700">District</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="py-2 px-3 text-gray-700">D{p.district}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-700">Type</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="py-2 px-3 text-gray-700">{p.property_type}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-700">Age</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="py-2 px-3 text-gray-700">{p.age} years</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-700">Size</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="py-2 px-3 text-gray-700">{p.size_sqft.toLocaleString()} sqft</td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-700">Tenure</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="py-2 px-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
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

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Pricing</h3>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-700 w-32">Price</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="py-2 px-3 font-semibold text-gray-900">
                        ${(p.recent_price / 1000000).toFixed(2)}M
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-3 bg-gray-50 font-semibold text-gray-700">Price/Sqft</td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="py-2 px-3 text-gray-700">
                        ${(p.recent_price / p.size_sqft).toFixed(0)}/sqft
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
