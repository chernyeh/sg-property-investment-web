import { useEffect, useState } from 'react'
import { TrendingUp, Home, BarChart3, DollarSign } from 'lucide-react'
import { getProperties } from '../lib/supabase'
import { Property } from '../lib/supabase'

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProperties()
  }, [])

  async function loadProperties() {
    try {
      setLoading(true)
      const data = await getProperties()
      setProperties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading market data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-semibold">Error loading data</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadProperties}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  const totalProperties = properties.length
  const avgPrice = properties.length > 0
    ? properties.reduce((sum, p) => sum + p.recent_price, 0) / properties.length
    : 0
  const avgPsf = properties.length > 0
    ? properties.reduce((sum, p) => sum + (p.recent_price / p.size_sqft), 0) / properties.length
    : 0
  const freeholdCount = properties.filter(p => p.tenure === 'Freehold').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Properties</p>
              <p className="text-3xl font-bold text-gray-900">{totalProperties}</p>
            </div>
            <Home className="w-12 h-12 text-blue-100" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Average Price</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(avgPrice / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-100" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Price/Sqft</p>
              <p className="text-2xl font-bold text-gray-900">
                ${avgPsf.toFixed(0)}
              </p>
            </div>
            <BarChart3 className="w-12 h-12 text-amber-100" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Freehold</p>
              <p className="text-2xl font-bold text-gray-900">
                {freeholdCount} ({totalProperties > 0 ? Math.round(freeholdCount / totalProperties * 100) : 0}%)
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-100" />
          </div>
        </div>
      </div>

      <div className="card bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to Your Property Analyzer</h2>
        <p className="mb-4">
          This platform helps you make better investment decisions by analyzing Singapore property data comprehensively.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white bg-opacity-10 rounded p-4">
            <h3 className="font-semibold mb-2">📊 Compare Projects</h3>
            <p className="text-sm text-blue-100">Analyze side-by-side comparisons of different properties</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded p-4">
            <h3 className="font-semibold mb-2">🔍 Screen Deals</h3>
            <p className="text-sm text-blue-100">Find undervalued properties with high yields</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded p-4">
            <h3 className="font-semibold mb-2">💰 Mortgage Planning</h3>
            <p className="text-sm text-blue-100">Calculate loan scenarios with variable rates</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Market Overview ({totalProperties} Properties)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Project</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">District</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Price/Sqft</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Tenure</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-900 font-medium">{property.project_name}</td>
                  <td className="py-3 px-4 text-center text-gray-700">D{property.district}</td>
                  <td className="py-3 px-4 text-gray-700 text-xs">{property.property_type}</td>
                  <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                    ${(property.recent_price / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3 px-4 text-right text-gray-700">
                    ${(property.recent_price / property.size_sqft).toFixed(0)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      property.tenure === 'Freehold'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {property.tenure}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
